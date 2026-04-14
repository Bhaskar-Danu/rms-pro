const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');

exports.getInventory = async (req, res) => {
  try { res.json(await Inventory.find().sort({ name: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addItem = async (req, res) => {
  try {
    const { name, quantity, unit, min_level } = req.body;
    if (!name || quantity === undefined) return res.status(400).json({ error: 'Name and quantity are required' });
    const item = await Inventory.create({ name, quantity, unit, min_level });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Inventory Added', details: `Added ${quantity}${unit} of ${name}` });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Inventory Updated', details: `Updated ${item.name}` });
    res.json({ success: true, item });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
