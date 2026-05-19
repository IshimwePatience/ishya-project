const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const buyerController = require('../controllers/buyer.controller');

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);
router.get('/summary', saleController.getFinanceSummary);

router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

router.patch('/:id/approve', saleController.approveSale);
router.patch('/:id/reject', saleController.rejectSale);

// Buyers
router.get('/buyers', buyerController.getBuyers);
router.post('/buyers', buyerController.createBuyer);

module.exports = router;
