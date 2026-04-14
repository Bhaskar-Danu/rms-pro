const router = require('express').Router();
const { getFeedback, getStats, addFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { requireAuth } = require('../middleware/auth');

router.get('/',       requireAuth, getFeedback);
router.get('/stats',  requireAuth, getStats);
router.post('/',      requireAuth, addFeedback);
router.delete('/:id', requireAuth, deleteFeedback);

module.exports = router;
