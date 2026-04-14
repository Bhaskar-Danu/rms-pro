const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  quantity:  { type: Number, required: true, min: 0 },
  unit:      { type: String, default: 'kg' },
  min_level: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
