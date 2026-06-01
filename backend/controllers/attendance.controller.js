const { Attendance, User, Role, Event, AttendanceRule } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

exports.checkIn = async (req, res) => {
  try {
    const { eventId, notes, location } = req.body;
    const userId = req.user.id;

    const attendance = await Attendance.create({
      userId,
      eventId,
      notes,
      location,
      checkIn: new Date(),
      status: 'Present'
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      where: { userId: req.user.id, checkOut: null }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active session found' });
    }

    attendance.location = req.body.location;
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendance = await Attendance.findAll({
      where: { userId },
      include: [
        { model: Event, as: 'event' }
      ],
      order: [['checkIn', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Event, as: 'event' }
      ],
      order: [['checkIn', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all attendance', error: error.message });
  }
};

exports.setRule = async (req, res) => {
  try {
    const { targetLat, targetLng, radius, startTime, endTime, lateExtension } = req.body;
    
    // Deactivate existing rules
    await AttendanceRule.update({ isActive: false }, { where: { isActive: true } });

    const publicToken = crypto.randomBytes(16).toString('hex');
    const rule = await AttendanceRule.create({
      targetLat,
      targetLng,
      radius,
      startTime,
      endTime,
      lateExtension,
      publicToken,
      isActive: true
    });

    res.json({ message: 'Rule created successfully', rule });
  } catch (error) {
    res.status(500).json({ message: 'Error creating rule', error: error.message });
  }
};

exports.getActiveRule = async (req, res) => {
  try {
    const rule = await AttendanceRule.findOne({ where: { isActive: true } });
    if (!rule) return res.status(404).json({ message: 'No active rule found' });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active rule', error: error.message });
  }
};
