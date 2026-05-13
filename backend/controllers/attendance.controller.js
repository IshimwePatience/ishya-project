const { Attendance, User, Event } = require('../models');

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
