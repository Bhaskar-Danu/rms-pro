const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer_name: { type: String, required: true, trim: true },
  phone:         { type: String, default: '' },
  date:          { type: String, required: true },
  time:          { type: String, required: true },
  guests:        { type: Number, default: 1, min: 1 },
  table_number:  { type: Number, default: null },
  status:        { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  notes:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
