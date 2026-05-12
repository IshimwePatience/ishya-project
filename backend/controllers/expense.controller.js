const { Expense, Production } = require('../models');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: [{ model: Production, attributes: ['title'] }],
      order: [['date', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const totalExpenses = await Expense.sum('amount') || 0;
    res.json({ totalExpenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await expense.destroy();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
