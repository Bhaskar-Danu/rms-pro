const Order = require('../models/Order');

// GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [daily, totalResult] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', total: 1, orders: 1, _id: 0 } },
      ]),
      Order.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: since } } },
        { $group: { _id: null, t: { $sum: '$total' } } },
      ]),
    ]);

    res.json({ daily, totalRevenue: Math.round((totalResult[0]?.t || 0) * 100) / 100 });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
