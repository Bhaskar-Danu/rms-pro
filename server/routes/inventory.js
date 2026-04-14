const router = require('express').Router();
const { getInventory, addItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { requireAuth } = require('../middleware/auth');

router.get('/',       requireAuth, getInventory);
router.post('/',      requireAuth, addItem);
router.put('/:id',    requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);

module.exports = router;
