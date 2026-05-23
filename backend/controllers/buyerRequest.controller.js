const { BuyerRequest, Buyer, User, Role, sequelize } = require('../models');
const crypto = require('crypto');
const { sendNotification } = require('../socket');

exports.createRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.create(req.body);
    
    // Notify all Admins in real-time
    await sendNotification({
      role: 'Admin',
      title: 'New Partner Registration',
      message: `A new prospective partner registration was submitted by "${request.name}" (${request.contactPerson}).`,
      type: 'partner_request'
    });

    res.status(201).json({
      message: 'Your partnership request has been submitted successfully. Our team will review it and contact you soon.',
      request
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await BuyerRequest.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const request = await BuyerRequest.findByPk(req.params.id, { transaction });
    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'Approved') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Request already approved' });
    }

    // 1. Create the actual Buyer (Partner) entry
    const buyer = await Buyer.create({
      name: request.name,
      type: request.type,
      contactPerson: request.contactPerson,
      email: request.email,
      phone: request.phone,
      address: request.address
    }, { transaction });

    // 2. Find the 'Partner' role
    const partnerRole = await Role.findOne({ where: { name: 'Partner' } }, { transaction });
    const roleId = partnerRole ? partnerRole.id : null;

    // 3. Handle User Account creation or association
    const existingUser = await User.findOne({ where: { email: request.email } }, { transaction });

    let tempPassword = null;
    let targetUser = null;
    if (existingUser) {
      // If user exists, update their buyerId and roleId
      existingUser.buyerId = buyer.id;
      if (roleId) {
        existingUser.roleId = roleId;
      }
      await existingUser.save({ transaction });
      targetUser = existingUser;
    } else {
      // If user does not exist, create a new User account
      tempPassword = crypto.randomBytes(8).toString('hex');
      targetUser = await User.create({
        firstName: request.contactPerson.split(' ')[0] || 'Partner',
        lastName: request.contactPerson.split(' ')[1] || 'User',
        email: request.email,
        password: tempPassword,
        roleId,
        buyerId: buyer.id,
        isVerified: true,
        status: 'active'
      }, { transaction });
    }

    // 4. Update request status
    request.status = 'Approved';
    await request.save({ transaction });

    await transaction.commit();

    // Trigger notification to the Partner after transaction commit
    if (targetUser) {
      await sendNotification({
        userId: targetUser.id,
        title: 'Partnership Approved',
        message: `Congratulations! Your partnership request for "${buyer.name}" has been approved.`,
        type: 'partner_approval'
      });
    }

    res.json({
      message: 'Request approved successfully.',
      temporaryPassword: tempPassword
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'Rejected';
    await request.save();

    // Notify user if their account already exists
    const existingUser = await User.findOne({ where: { email: request.email } });
    if (existingUser) {
      await sendNotification({
        userId: existingUser.id,
        title: 'Partnership Request Status',
        message: `Your partnership request for "${request.name}" was reviewed and rejected.`,
        type: 'partner_rejection'
      });
    }

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    await request.destroy();
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
