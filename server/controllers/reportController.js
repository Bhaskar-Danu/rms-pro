const Order = require('../models/Order');

// GET /api/reports/top-items
exports.getTopItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', total_sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { total_sold: -1 } },
      { $limit: limit },
      { $project: { name: '$_id', total_sold: 1, revenue: 1, _id: 0 } },
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reports/categories — requires MenuItem ref; we stored category in name snapshot, so we need a workaround
// We'll group by item name and won't have category — for a full fix, store category in order items
exports.getCategories = async (req, res) => {
  try {
    // Join MenuItem to get category
    const data = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'menuData' } },
      { $unwind: { path: '$menuData', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ['$menuData.category', 'Other'] }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $addToSet: '$_id' } } },
      { $project: { category: '$_id', revenue: 1, orders: { $size: '$orders' }, _id: 0 } },
      { $sort: { revenue: -1 } },
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reports/peak-hours
exports.getPeakHours = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: { $hour: '$createdAt' }, order_count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
      { $project: { hour: { $toString: '$_id' }, order_count: 1, revenue: 1, _id: 0 } },
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
