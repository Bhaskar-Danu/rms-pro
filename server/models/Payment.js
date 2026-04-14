const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order:          { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:         { type: Number, required: true, min: 0 },
  method:         { type: String, enum: ['cash', 'card', 'upi', 'online'], required: true },
  status:         { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },

  // Online payment gateway fields (Razorpay)
  gateway_order_id:   { type: String, default: null },   // Razorpay order ID
  gateway_payment_id: { type: String, default: null },   // Razorpay payment ID
  gateway_signature:  { type: String, default: null },   // Razorpay signature for verification

  // Offline payment details
  reference_number:   { type: String, default: '' },     // Card last-4 digits, UPI ref, etc.
  received_amount:    { type: Number, default: 0 },      // Cash tendered
  change_returned:    { type: Number, default: 0 },      // Change given back

  // Meta
  processed_by: { type: String, default: 'System' },
  notes:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
