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
    const totalRevenue = await Sale.sum('amount') || 0;
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    await sale.update(req.body);
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    await sale.destroy();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale request not found' });

    // 1. Create distribution Contract
    const contractNumber = 'CT-' + Date.now();
    const contract = await Contract.create({
      contractNumber,
      terms: `Standard distribution agreement for ${sale.productionId}.`,
      expiryDate: sale.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      buyerId: sale.buyerId,
      productionId: sale.productionId,
      status: 'Active'
    });

    // 2. Set Sale paymentStatus to Paid, and tie to Contract
    sale.paymentStatus = 'Paid';
    sale.contractId = contract.id;
    await sale.save();

    res.json({ message: 'License request approved, contract created successfully.', sale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale request not found' });

    // Rejecting a licensing request means deleting the pending sale request
    await sale.destroy();
    res.json({ message: 'License request rejected/removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
