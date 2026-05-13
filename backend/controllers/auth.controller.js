const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');
const { Op } = require('sequelize');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const roleRecord = await Role.findOne({ where: { name: role || 'Public Visitor' } });
    if (!roleRecord) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      roleId: roleRecord.id,
      isTwoFactorEnabled: true,
      isVerified: false,
      emailVerifyCode: verifyCode,
      emailVerifyExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    await sendEmail(
      user.email,
      'Verify Your ISHYA Account',
      `Your verification code is: ${verifyCode}`,
      `<h2>Welcome to ISHYA</h2><p>Your verification code is: <strong style="font-size:24px">${verifyCode}</strong></p><p>Valid for 10 minutes.</p>`
    );

    res.status(201).json({
      message: 'Account created. Check your email for the verification code.',
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      where: {
        email,
        emailVerifyCode: code,
        emailVerifyExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.emailVerifyCode = null;
    user.emailVerifyExpires = null;
    await user.save();

    // Fetch user with role for the response
    const fullUser = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }]
    });

    const tokens = generateTokens(fullUser);

    res.json({ 
      message: 'Email verified successfully.',
      user: {
        id: fullUser.id,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        email: fullUser.email,
        role: fullUser.role?.name
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'No account with this email' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerifyCode = verifyCode;
    user.emailVerifyExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      user.email,
      'Your New ISHYA Verification Code',
      `Your new code is: ${verifyCode}`,
      `<h2>New Verification Code</h2><p>Your code: <strong style="font-size:24px">${verifyCode}</strong></p><p>Valid for 10 minutes.</p>`
    );

    res.json({ message: 'New code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.validPassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.', requiresVerification: true, email });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is ' + user.status });
    }

    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = otp;
      user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail(
        user.email,
        'Your ISHYA Verification Code',
        `Your code is: ${otp}`,
        `<h1>Security Verification</h1><p>Your verification code is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`
      );

      return res.json({ 
        requires2FA: true, 
        email: user.email,
        message: 'Verification code sent to email' 
      });
    }

    const tokens = generateTokens(user);
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      where: { 
        email,
        twoFactorCode: code,
        twoFactorExpires: { [Op.gt]: new Date() }
      },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save();

    const tokens = generateTokens(user);
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail(
      user.email,
      'ISHYA Password Reset',
      `Reset your password here: ${resetUrl}`,
      `<h1>Password Reset</h1><p>You requested a password reset. Click the link below:</p><a href="${resetUrl}">${resetUrl}</a>`
    );

    res.json({ message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role?.name
    }
  });
};
