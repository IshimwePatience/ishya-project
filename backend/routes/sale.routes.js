const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');

const buyerController = require('../controllers/buyer.controller');

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);
router.get('/summary', saleController.getFinanceSummary);

// Buyers
router.get('/buyers', buyerController.getBuyers);
router.post('/buyers', buyerController.createBuyer);

module.exports = router;
