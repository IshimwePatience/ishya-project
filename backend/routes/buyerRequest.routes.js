const express = require('express');
const router = express.Router();
const buyerRequestController = require('../controllers/buyerRequest.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public route for partnership request
router.post('/request', buyerRequestController.createRequest);

// Protected routes (Admin only)
router.get('/', authMiddleware, adminMiddleware, buyerRequestController.getRequests);
router.patch('/:id/approve', authMiddleware, adminMiddleware, buyerRequestController.approveRequest);
router.patch('/:id/reject', authMiddleware, adminMiddleware, buyerRequestController.rejectRequest);
router.delete('/:id', authMiddleware, adminMiddleware, buyerRequestController.deleteRequest);

module.exports = router;
