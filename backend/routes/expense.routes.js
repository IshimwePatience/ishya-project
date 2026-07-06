const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.use(authMiddleware);

router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getExpenseSummary);
router.post('/', expenseController.createExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
