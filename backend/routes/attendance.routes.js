const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/my', authMiddleware, attendanceController.getMyAttendance);
router.get('/all', authMiddleware, attendanceController.getAllAttendance);
router.post('/check-in', authMiddleware, attendanceController.checkIn);
router.patch('/update-location', authMiddleware, attendanceController.updateLocation);
router.patch('/check-out/:id', authMiddleware, attendanceController.checkOut);

module.exports = router;
