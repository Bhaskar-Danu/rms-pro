const Payment = require('../models/Payment');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

// ──────────────────────────────────────────────────
// GET /api/payments — list all payments
// ──────────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'table_number customer_name total status')
      .sort({ createdAt: -1 })
      .lean();
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ──────────────────────────────────────────────────
// GET /api/payments/order/:orderId — get payment for a specific order
// ──────────────────────────────────────────────────
exports.getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('order')
      .lean();
    res.json(payment || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ──────────────────────────────────────────────────
// POST /api/payments/offline — process cash / card / UPI payment
// ──────────────────────────────────────────────────
exports.processOfflinePayment = async (req, res) => {
  try {
    const { order_id, method, received_amount, reference_number, notes } = req.body;

    if (!order_id || !method) {
      return res.status(400).json({ error: 'Order ID and payment method are required' });
    }
    if (!['cash', 'card', 'upi'].includes(method)) {
      return res.status(400).json({ error: 'Invalid offline payment method. Use cash, card, or upi' });
    }

    // Verify order exists
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check if already paid
    const existing = await Payment.findOne({ order: order_id, status: 'completed' });
    if (existing) return res.status(400).json({ error: 'This order has already been paid' });

    // For cash payments, validate received amount
    let changeReturned = 0;
    let receivedAmt = order.total;
    if (method === 'cash') {
      receivedAmt = parseFloat(received_amount) || 0;
      if (receivedAmt < order.total) {
        return res.status(400).json({ error: `Insufficient amount. Order total is ₹${order.total}` });
      }
      changeReturned = parseFloat((receivedAmt - order.total).toFixed(2));
    }

    const payment = await Payment.create({
      order: order_id,
      amount: order.total,
      method,
      status: 'completed',
      received_amount: receivedAmt,
      change_returned: changeReturned,
      reference_number: reference_number || '',
      processed_by: req.user.username,
      notes: notes || '',
    });

    // Mark order as completed
    order.status = 'completed';
    order.payment_status = 'paid';
    order.payment_method = method;
    await order.save();

    await ActivityLog.create({
      user: req.user.id,
      username: req.user.username,
      action: 'Payment Received',
      details: `₹${order.total} via ${method.toUpperCase()} for Table ${order.table_number}`,
    });

    res.status(201).json({
      success: true,
      payment,
      change: changeReturned,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ──────────────────────────────────────────────────
// POST /api/payments/online/create — create Razorpay order
// ──────────────────────────────────────────────────
exports.createOnlineOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'Order ID is required' });

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check if already paid
    const existing = await Payment.findOne({ order: order_id, status: 'completed' });
    if (existing) return res.status(400).json({ error: 'This order has already been paid' });

    // Check if Razorpay is configured
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpaySecret || razorpayKeyId === 'YOUR_RAZORPAY_KEY_ID') {
      // DEMO MODE — simulate a gateway order for testing
      const demoOrderId = 'demo_order_' + Date.now();
      const payment = await Payment.create({
        order: order_id,
        amount: order.total,
        method: 'online',
        status: 'pending',
        gateway_order_id: demoOrderId,
        processed_by: req.user.username,
      });
      return res.json({
        demo: true,
        payment_id: payment._id,
        gateway_order_id: demoOrderId,
        amount: order.total,
        currency: 'INR',
        key: 'demo_key',
        message: 'Razorpay not configured — running in demo mode',
      });
    }

    // PRODUCTION MODE — create Razorpay order
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: { table: order.table_number, customer: order.customer_name },
    });

    const payment = await Payment.create({
      order: order_id,
      amount: order.total,
      method: 'online',
      status: 'pending',
      gateway_order_id: razorpayOrder.id,
      processed_by: req.user.username,
    });

    res.json({
      demo: false,
      payment_id: payment._id,
      gateway_order_id: razorpayOrder.id,
      amount: order.total,
      currency: 'INR',
      key: razorpayKeyId,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ──────────────────────────────────────────────────
// POST /api/payments/online/verify — verify Razorpay payment
// ──────────────────────────────────────────────────
exports.verifyOnlinePayment = async (req, res) => {
  try {
    const { payment_id, gateway_payment_id, gateway_order_id, gateway_signature } = req.body;

    const payment = await Payment.findById(payment_id);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    const order = await Order.findById(payment.order);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check if Razorpay is configured or running demo mode
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const isDemoMode = !razorpaySecret || razorpaySecret === 'YOUR_RAZORPAY_KEY_SECRET';

    if (!isDemoMode) {
      // Verify signature in production
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${gateway_order_id}|${gateway_payment_id}`)
        .digest('hex');

      if (expectedSignature !== gateway_signature) {
        payment.status = 'failed';
        await payment.save();
        return res.status(400).json({ error: 'Payment verification failed — signature mismatch' });
      }
    }

    // Mark payment as completed
    payment.status = 'completed';
    payment.gateway_payment_id = gateway_payment_id || 'demo_pay_' + Date.now();
    payment.gateway_signature = gateway_signature || 'demo_sig';
    await payment.save();

    // Mark order as completed and paid
    order.status = 'completed';
    order.payment_status = 'paid';
    order.payment_method = 'online';
    await order.save();

    await ActivityLog.create({
      user: req.user.id,
      username: req.user.username,
      action: 'Online Payment Received',
      details: `₹${payment.amount} via Razorpay for Table ${order.table_number}`,
    });

    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ──────────────────────────────────────────────────
// POST /api/payments/:id/refund — refund a payment
// ──────────────────────────────────────────────────
exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'completed') return res.status(400).json({ error: 'Only completed payments can be refunded' });

    payment.status = 'refunded';
    payment.notes = (payment.notes ? payment.notes + ' | ' : '') + `Refunded by ${req.user.username} on ${new Date().toLocaleDateString()}`;
    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.payment_status = 'refunded';
      order.status = 'cancelled';
      await order.save();
    }

    await ActivityLog.create({
      user: req.user.id,
      username: req.user.username,
      action: 'Payment Refunded',
      details: `₹${payment.amount} refund for payment ${payment._id}`,
    });

    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ──────────────────────────────────────────────────
// GET /api/payments/stats — payment statistics
// ──────────────────────────────────────────────────
exports.getPaymentStats = async (req, res) => {
  try {
    const all = await Payment.find({ status: 'completed' }).lean();
    const total = all.reduce((s, p) => s + p.amount, 0);
    const byMethod = { cash: 0, card: 0, upi: 0, online: 0 };
    all.forEach(p => { byMethod[p.method] = (byMethod[p.method] || 0) + p.amount; });
    const countByMethod = { cash: 0, card: 0, upi: 0, online: 0 };
    all.forEach(p => { countByMethod[p.method] = (countByMethod[p.method] || 0) + 1; });

    // Today's payments
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const today = all.filter(p => new Date(p.createdAt) >= startOfDay);
    const todayTotal = today.reduce((s, p) => s + p.amount, 0);

    res.json({
      totalRevenue: parseFloat(total.toFixed(2)),
      todayRevenue: parseFloat(todayTotal.toFixed(2)),
      totalTransactions: all.length,
      todayTransactions: today.length,
      byMethod,
      countByMethod,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
