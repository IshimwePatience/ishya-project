const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const buyerController = require('../controllers/buyer.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);
router.get('/summary', saleController.getFinanceSummary);

// Partner: get their own license requests (auth required)
router.get('/my-license-requests', authMiddleware, saleController.getMyLicenseRequests);

router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

router.patch('/:id/approve', saleController.approveSale);
router.patch('/:id/reject', saleController.rejectSale);
router.patch('/:id/set-price', saleController.setSalePrice);

// Buyers
router.get('/buyers', buyerController.getBuyers);
router.post('/buyers', buyerController.createBuyer);
router.put('/buyers/:id', buyerController.updateBuyer);
router.delete('/buyers/:id', buyerController.deleteBuyer);

module.exports = router;
