const Staff = require('../models/Staff');
const ActivityLog = require('../models/ActivityLog');

exports.getStaff = async (req, res) => {
  try {
    res.json(await Staff.find({ is_active: true }).sort({ name: 1 }));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addStaff = async (req, res) => {
  try {
    const { name, role, phone, salary } = req.body;
    if (!name) return res.status(400).json({ error: 'Staff name is required' });
    const staff = await Staff.create({ name, role, phone, salary });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Staff Added', details: `Added ${name} as ${role}` });
    res.status(201).json(staff);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Staff Updated', details: `Updated ${staff.name}` });
    res.json({ success: true, staff });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteStaff = async (req, res) => {
  try {
    // Soft delete — keep records, mark inactive
    await Staff.findByIdAndUpdate(req.params.id, { is_active: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
