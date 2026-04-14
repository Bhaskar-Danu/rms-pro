const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customer_name: { type: String, required: true, trim: true },
  rating:        { type: Number, required: true, min: 1, max: 5 },
  comment:       { type: String, default: '' },
  order:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
