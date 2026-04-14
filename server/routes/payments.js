const router = require('express').Router();
const {
  getPayments,
  getPaymentByOrder,
  processOfflinePayment,
  createOnlineOrder,
  verifyOnlinePayment,
  refundPayment,
  getPaymentStats,
} = require('../controllers/paymentController');
const { requireAuth, checkRole } = require('../middleware/auth');

router.get('/',                requireAuth, getPayments);
router.get('/stats',           requireAuth, getPaymentStats);
router.get('/order/:orderId',  requireAuth, getPaymentByOrder);

router.post('/offline',        requireAuth, processOfflinePayment);
router.post('/online/create',  requireAuth, createOnlineOrder);
router.post('/online/verify',  requireAuth, verifyOnlinePayment);

router.post('/:id/refund',     requireAuth, checkRole('admin'), refundPayment);

module.exports = router;
