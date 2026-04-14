const router = require('express').Router();
const { getLogs } = require('../controllers/activityController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getLogs);

module.exports = router;
