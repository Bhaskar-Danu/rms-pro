const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  role:      { type: String, default: 'Employee', trim: true },
  phone:     { type: String, default: '' },
  salary:    { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
