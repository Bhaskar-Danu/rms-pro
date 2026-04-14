const MenuItem = require('../models/MenuItem');
const ActivityLog = require('../models/ActivityLog');

exports.getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
    const item = await MenuItem.create({ name, category, price, description });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Menu Item Added', details: `Added ${name} to ${category}` });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ success: true, item });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
