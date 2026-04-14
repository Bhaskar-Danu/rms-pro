const router = require('express').Router();
const { getReservations, createReservation, updateStatus, deleteReservation } = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/auth');

router.get('/',             requireAuth, getReservations);
router.post('/',            requireAuth, createReservation);
router.put('/:id/status',   requireAuth, updateStatus);
router.delete('/:id',       requireAuth, deleteReservation);

module.exports = router;
