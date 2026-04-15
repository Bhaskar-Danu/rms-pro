const router = require('express').Router();
const { requireAuth, checkRole } = require('../middleware/auth');

const MenuItem    = require('../models/MenuItem');
const Staff       = require('../models/Staff');
const Inventory   = require('../models/Inventory');
const Order       = require('../models/Order');
const Payment     = require('../models/Payment');
const Reservation = require('../models/Reservation');
const Feedback    = require('../models/Feedback');
const Expense     = require('../models/Expense');
const ActivityLog = require('../models/ActivityLog');

// DELETE /api/admin/clear-data — wipes all data (admin only)
router.delete('/clear-data', requireAuth, checkRole('admin'), async (req, res) => {
  try {
    await Promise.all([
      MenuItem.deleteMany({}),
      Staff.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Reservation.deleteMany({}),
      Feedback.deleteMany({}),
      Expense.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    res.json({ success: true, message: 'All data cleared successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
