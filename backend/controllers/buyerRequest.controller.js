const { BuyerRequest, Buyer, User, Role } = require('../models');
const crypto = require('crypto');

exports.createRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.create(req.body);
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
  try {
    const request = await BuyerRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 1. Create the actual Buyer (Partner) entry
    const buyer = await Buyer.create({
      name: request.name,
      type: request.type,
      contactPerson: request.contactPerson,
      email: request.email,
      phone: request.phone,
      address: request.address
    });

    // 2. Find the 'Partner' role
    const partnerRole = await Role.findOne({ where: { name: 'Partner' } });
    
    // 3. Create a User Account for the Partner to log in
    // Note: We generate a random temporary password or send a reset link
    const tempPassword = crypto.randomBytes(8).toString('hex');
    
    await User.create({
      firstName: request.contactPerson.split(' ')[0] || 'Partner',
      lastName: request.contactPerson.split(' ')[1] || 'User',
      email: request.email,
      password: tempPassword,
      roleId: partnerRole ? partnerRole.id : null,
      buyerId: buyer.id,
      isVerified: true,
      status: 'active'
    });

    // 4. Update request status
    request.status = 'Approved';
    await request.save();

    res.json({ 
      message: 'Request approved. Partner profile and User account created.',
      temporaryPassword: tempPassword // Shown to admin to share, or handled via email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'Rejected';
    await request.save();

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
