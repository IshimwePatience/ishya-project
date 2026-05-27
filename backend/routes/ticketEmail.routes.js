const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ticketEmail.controller');

// Send 6-digit OTP to email
router.post('/send-otp', ctrl.sendOTP);

// Verify OTP
router.post('/verify-otp', ctrl.verifyOTP);

// Send ticket receipt after payment
router.post('/send-ticket', ctrl.sendTicket);

module.exports = router;
