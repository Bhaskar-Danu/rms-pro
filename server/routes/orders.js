const router = require('express').Router();
const { getOrders, createOrder, updateStatus, deleteOrder, getReceipt } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

router.get('/',               requireAuth, getOrders);
router.post('/',              requireAuth, createOrder);
router.put('/:id/status',     requireAuth, updateStatus);
router.delete('/:id',         requireAuth, deleteOrder);
router.get('/:id/receipt',    requireAuth, getReceipt);

module.exports = router;
