const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category:    { type: String, required: true },
  amount:      { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  date:        { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
