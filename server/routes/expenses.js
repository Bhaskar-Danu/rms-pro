const router = require('express').Router();
const { getExpenses, getReport, addExpense, deleteExpense } = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/auth');

router.get('/',        requireAuth, getExpenses);
router.get('/report',  requireAuth, getReport);
router.post('/',       requireAuth, addExpense);
router.delete('/:id',  requireAuth, deleteExpense);

module.exports = router;
