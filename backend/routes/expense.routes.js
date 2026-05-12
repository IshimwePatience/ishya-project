const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const passport = require('passport');

// Protected routes
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getExpenseSummary);
router.post('/', expenseController.createExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
