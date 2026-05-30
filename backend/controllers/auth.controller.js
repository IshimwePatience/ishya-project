const { User, Role, PendingUser, SystemSetting, Sale } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');
const { Op } = require('sequelize');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check main User table
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Check PendingUser table - if exists, remove old one to allow re-registration
    await PendingUser.destroy({ where: { email } });

    const roleRecord = await Role.findOne({ where: { name: role || 'Public Visitor' } });
    if (!roleRecord) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const pendingUser = await PendingUser.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed by hook in PendingUser
      roleId: roleRecord.id,
      verifyCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    await sendEmail(
      pendingUser.email,
      'Verify Your ISHYA Account',
      `Your verification code is: ${verifyCode}`,
      `<h2>Welcome to ISHYA</h2><p>Your verification code is: <strong style="font-size:24px">${verifyCode}</strong></p><p>Valid for 10 minutes.</p>`
    );

    res.status(201).json({
      message: 'Registration initiated. Check your email for the verification code.',
      email: pendingUser.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Check PendingUser first
    const pending = await PendingUser.findOne({
      where: {
        email,
        verifyCode: code,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!pending) {
      // Fallback: check if it's an existing unverified user (for backward compatibility if needed)
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

      const fullUser = await User.findByPk(user.id, {
        include: [{ model: Role, as: 'role' }]
      });
      const tokens = generateTokens(fullUser);
      return res.json({ message: 'Email verified successfully.', user: { id: fullUser.id, firstName: fullUser.firstName, lastName: fullUser.lastName, email: fullUser.email, role: fullUser.role?.name }, ...tokens });
    }

    // Move from PendingUser to User
    const newUser = await User.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      password: pending.password, // Keep the hashed password
      roleId: pending.roleId,
      isVerified: true,
      status: 'active'
    });

    // Delete pending record
    await pending.destroy();

    const fullUser = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'role' }]
    });

    const tokens = generateTokens(fullUser);

    res.json({
      message: 'Email verified successfully. Account is now active.',
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

    // Check main User table first
    const user = await User.findOne({ where: { email } });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (user) {
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
      return res.json({ message: 'New code sent to your email' });
    }

    // Check PendingUser table
    const pending = await PendingUser.findOne({ where: { email } });
    if (!pending) {
      return res.status(404).json({ message: 'No registration found with this email' });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.verifyCode = verifyCode;
    pending.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pending.save();

    await sendEmail(
      pending.email,
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

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    await sendEmail(
      user.email,
      'ISHYA Password Reset Code',
      `Your password reset code is: ${resetCode}`,
      `<h2>Password Reset</h2><p>You requested a password reset. Use the code below to reset your password:</p><p><strong style="font-size:24px">${resetCode}</strong></p><p>This code is valid for 15 minutes.</p>`
    );

    res.json({ message: 'Reset code sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: code,
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
      role: req.user.role?.name,
      roleId: req.user.roleId,
      phone: req.user.phone,
      profilePic: req.user.profilePic,
      isTwoFactorEnabled: req.user.isTwoFactorEnabled,
      subscriptionStatus: req.user.subscriptionStatus,
      subscriptionExpiresAt: req.user.subscriptionExpiresAt,
      notificationPrefs: req.user.notificationPrefs || {
        emailAlerts: true,
        browserAlerts: true,
        marketingEmails: false,
        troubleshootingAlerts: true
      }
    }
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, phone, profilePic, notificationPrefs, isTwoFactorEnabled } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (notificationPrefs !== undefined) user.notificationPrefs = notificationPrefs;
    if (isTwoFactorEnabled !== undefined) user.isTwoFactorEnabled = isTwoFactorEnabled;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        notificationPrefs: user.notificationPrefs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { currentPassword, newPassword } = req.body;

    if (!user.validPassword(currentPassword)) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubscriptionPrice = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: 'public_monthly_subscription_price' } });
    res.json({ price: setting ? setting.value : '9.99' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setSubscriptionPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const [setting] = await SystemSetting.findOrCreate({
      where: { key: 'public_monthly_subscription_price' },
      defaults: { value: parseFloat(price).toFixed(2) }
    });
    setting.value = parseFloat(price).toFixed(2);
    await setting.save();
    res.json({ message: 'Subscription price updated successfully.', price: setting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.subscribeUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const setting = await SystemSetting.findOne({ where: { key: 'public_monthly_subscription_price' } });
    const currentPrice = parseFloat(setting ? setting.value : '9.99');

    // Calculate new expiration date
    let newExpiryDate = new Date();
    if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()) {
      // User is topping up their active subscription
      newExpiryDate = new Date(user.subscriptionExpiresAt);
    }
    // Add 30 days
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);

    user.subscriptionStatus = 'active';
    user.subscriptionExpiresAt = newExpiryDate;
    await user.save();

    // Log the transaction as a Sale of type Theatre ticket sales (or generic subscription sale)
    await Sale.create({
      amount: currentPrice,
      saleType: 'Theatre ticket sales',
      paymentStatus: 'Paid',
      productionId: 1, // Tying to a default production or master entry
      date: new Date().toISOString().split('T')[0]
    });

    res.json({
      message: 'Subscription successfully extended by 30 days!',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
