const { Sale, Buyer, Production, Contract, User } = require('../models');
const { sendNotification } = require('../socket');

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
    
    // Fetch details for the notification
    const buyer = await Buyer.findByPk(sale.buyerId);
    const production = await Production.findByPk(sale.productionId);
    const buyerName = buyer ? buyer.name : 'A partner';
    const movieTitle = production ? production.title : 'a movie';

    // Notify all Admins
    await sendNotification({
      role: 'Admin',
      title: 'New License Request',
      message: `"${buyerName}" has requested a distribution license for "${movieTitle}".`,
      type: 'license_request'
    });

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

    // 3. Notify the partner
    const targetUser = await User.findOne({ where: { buyerId: sale.buyerId } });
    if (targetUser) {
      const production = await Production.findByPk(sale.productionId);
      const movieTitle = production ? production.title : 'requested movie';
      await sendNotification({
        userId: targetUser.id,
        title: 'License Request Approved',
        message: `Your distribution license request for "${movieTitle}" has been approved!`,
        type: 'license_approval'
      });
    }

    res.json({ message: 'License request approved, contract created successfully.', sale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale request not found' });

    const targetUser = await User.findOne({ where: { buyerId: sale.buyerId } });
    const production = await Production.findByPk(sale.productionId);
    const movieTitle = production ? production.title : 'requested movie';

    // Rejecting a licensing request means deleting the pending sale request
    await sale.destroy();

    // Notify the partner
    if (targetUser) {
      await sendNotification({
        userId: targetUser.id,
        title: 'License Request Rejected',
        message: `Your distribution license request for "${movieTitle}" has been rejected.`,
        type: 'license_rejection'
      });
    }

    res.json({ message: 'License request rejected/removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sales/my-license-requests
// Returns the logged-in partner's own license requests
// Checks buyerId first, falls back to email lookup (handles unlinked accounts)
exports.getMyLicenseRequests = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let buyer = null;

    // 1. Check user.buyerId first (fastest path)
    if (user.buyerId) {
      buyer = await Buyer.findByPk(user.buyerId);
    }

    // 2. Fallback: look up by email (handles partners whose buyerId was not linked)
    //    A buyer in the Buyers table means they were approved by admin
    if (!buyer && user.email) {
      buyer = await Buyer.findOne({ where: { email: user.email } });

      // Auto-link the buyerId on the user record so future calls are fast
      if (buyer) {
        await user.constructor.update(
          { buyerId: buyer.id },
          { where: { id: user.id } }
        );
      }
    }

    if (!buyer) {
      // No buyer record found — partner not yet approved
      return res.json({ buyer: null, sales: [], approved: false });
    }

    // Get all their license requests
    const sales = await Sale.findAll({
      where: { buyerId: buyer.id, saleType: 'Licensing' },
      include: [
        { model: Buyer, as: 'buyer' },
        { model: Production, as: 'production' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ buyer, sales, approved: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
