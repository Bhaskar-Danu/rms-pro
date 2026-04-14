const router = require('express').Router();
const { updateProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

router.put('/', requireAuth, updateProfile);

module.exports = router;
