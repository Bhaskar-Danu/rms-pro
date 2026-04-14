const mongoose = require('mongoose');

// Embedded sub-document for items within an order
const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name:     { type: String, required: true },   // Snapshot of name at order time
  price:    { type: Number, required: true },   // Snapshot of price at order time
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items:         { type: [orderItemSchema], required: true },
  table_number:  { type: Number, default: 0 },
  customer_name: { type: String, default: 'Guest', trim: true },
  total:         { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
  },
  payment_status: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'upi', 'online', null],
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
