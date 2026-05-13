const express = require('express');
const router = express.Router();
const buyerRequestController = require('../controllers/buyerRequest.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Public route for partnership request
router.post('/request', buyerRequestController.createRequest);

// Protected routes (Admin only)
router.get('/', protect, admin, buyerRequestController.getRequests);
router.patch('/:id/approve', protect, admin, buyerRequestController.approveRequest);
router.patch('/:id/reject', protect, admin, buyerRequestController.rejectRequest);
router.delete('/:id', protect, admin, buyerRequestController.deleteRequest);

module.exports = router;
