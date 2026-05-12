const { Sale, Buyer, Production, Contract } = require('../models');

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: Buyer, as: 'buyer' },
        { model: Production, as: 'production' }
      ]
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFinanceSummary = async (req, res) => {
  try {
    const totalRevenue = await Sale.sum('amount');
    // Basic summary for now
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
