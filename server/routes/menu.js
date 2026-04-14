const router = require('express').Router();
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { requireAuth, checkRole } = require('../middleware/auth');

router.get('/',     requireAuth, getMenu);
router.post('/',    requireAuth, checkRole('admin'), addMenuItem);
router.put('/:id',  requireAuth, checkRole('admin'), updateMenuItem);
router.delete('/:id', requireAuth, checkRole('admin'), deleteMenuItem);

module.exports = router;
