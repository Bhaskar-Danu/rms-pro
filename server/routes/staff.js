const router = require('express').Router();
const { getStaff, addStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { requireAuth } = require('../middleware/auth');

router.get('/',       requireAuth, getStaff);
router.post('/',      requireAuth, addStaff);
router.put('/:id',    requireAuth, updateStaff);
router.delete('/:id', requireAuth, deleteStaff);

module.exports = router;
