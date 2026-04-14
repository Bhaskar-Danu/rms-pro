const router = require('express').Router();
const { getStats } = require('../controllers/statsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getStats);

module.exports = router;
