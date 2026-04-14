const Order = require('../models/Order');
const Staff = require('../models/Staff');
const MenuItem = require('../models/MenuItem');

// GET /api/stats
exports.getStats = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const [ordersToday, activeStaff, revenueResult, menuCount] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Staff.countDocuments({ is_active: true }),
      Order.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      MenuItem.countDocuments(),
    ]);

    res.json({
      ordersToday,
      activeStaff,
      dailyRevenue: Math.round((revenueResult[0]?.total || 0) * 100) / 100,
      menuItems: menuCount,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
