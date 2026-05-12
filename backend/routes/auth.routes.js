const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');

const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verify', authController.resendVerify);
router.post('/verify-2fa', authController.verify2FA);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authMiddleware, authController.me);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login?error=no_account',
    session: false
  }),
  (req, res) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`http://localhost:5173/login?token=${token}`);
  }
);

module.exports = router;
