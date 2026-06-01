const express = require('express');
const router = express.Router();
const publicAttendanceController = require('../controllers/publicAttendance.controller');

// No authMiddleware used here because these are public outside links!
router.get('/:token', publicAttendanceController.getRule);
router.post('/check-in', publicAttendanceController.checkIn);
router.post('/check-out', publicAttendanceController.checkOut);

module.exports = router;
