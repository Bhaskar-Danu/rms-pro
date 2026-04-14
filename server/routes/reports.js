const router = require('express').Router();
const { getTopItems, getCategories, getPeakHours } = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

router.get('/top-items',  requireAuth, getTopItems);
router.get('/categories', requireAuth, getCategories);
router.get('/peak-hours', requireAuth, getPeakHours);

module.exports = router;
