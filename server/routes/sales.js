const router = require('express').Router();
const { getSales } = require('../controllers/salesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getSales);

module.exports = router;
