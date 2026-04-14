const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const ActivityLog = require('../models/ActivityLog');

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { today, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (today === 'true') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, table_number, customer_name } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ error: 'Order must have at least one item' });

    // Fetch all menu items in ONE query (no N+1)
    const menuIds = items.map(it => it.menu_id);
    const menuItems = await MenuItem.find({ _id: { $in: menuIds } }).lean();
    const menuMap = Object.fromEntries(menuItems.map(m => [m._id.toString(), m]));

    let total = 0;
    const orderItems = items.map(it => {
      const mi = menuMap[it.menu_id];
      if (!mi) throw new Error(`Menu item not found: ${it.menu_id}`);
      total += mi.price * (it.quantity || 1);
      return { menuItem: mi._id, name: mi.name, price: mi.price, quantity: it.quantity || 1 };
    });

    const order = await Order.create({ items: orderItems, table_number: table_number || 0, customer_name: customer_name || 'Guest', total, status: 'pending' });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Order Created', details: `Order for Table ${table_number}` });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PUT /api/orders/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const valid = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!valid.includes(req.body.status))
      return res.status(400).json({ error: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Status Updated', details: `Order set to ${req.body.status}` });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/orders/:id/receipt
exports.getReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
