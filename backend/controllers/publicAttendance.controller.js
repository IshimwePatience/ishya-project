const { AttendanceRule, Attendance, User, Role } = require('../models');
const { Op } = require('sequelize');

// Helper to calculate distance in meters (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

exports.getRule = async (req, res) => {
  try {
    const { token } = req.params;
    const rule = await AttendanceRule.findOne({ where: { publicToken: token, isActive: true } });
    
    if (!rule) {
      return res.status(404).json({ message: 'Attendance rule not found or expired' });
    }
    
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rule', error: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
  const { token, email, lat, lng, accuracy } = req.body;
    
    // 1. Get Rule
    const rule = await AttendanceRule.findOne({ where: { publicToken: token, isActive: true } });
    if (!rule) {
      return res.status(404).json({ message: 'Invalid or expired check-in link.' });
    }

    // 2. Validate User is a Talent
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || user.role?.name !== 'Actor/Talent') {
      return res.status(403).json({ message: 'Access denied: Only registered Talent can use this check-in.' });
    }

    // 3. Validate Time
    const now = new Date();
    // Rule startTime is HH:mm:ss. We need to construct today's date with that time.
    const [hours, minutes, seconds] = rule.startTime.split(':');
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
    
    // Add late extension
    const maxAllowedTime = new Date(targetTime.getTime() + (rule.lateExtension * 60000));
    
    if (now > maxAllowedTime) {
      return res.status(400).json({ message: `Check-in rejected: You are past the allowed late extension. Cutoff was ${maxAllowedTime.toLocaleTimeString()}` });
    }

    // 4. Validate Location
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location data is required for check-in.' });
    }
    
    const distance = getDistance(parseFloat(lat), parseFloat(lng), parseFloat(rule.targetLat), parseFloat(rule.targetLng));
    if (distance > rule.radius) {
      return res.status(400).json({ message: `Check-in rejected: You are outside the allowed location radius. Distance: ${Math.round(distance)}m (Allowed: ${rule.radius}m). [Browser Accuracy Margin: ±${Math.round(accuracy)}m]` });
    }

    // 5. Create/Update Attendance
    // Find if already checked in today to prevent duplicates
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const existing = await Attendance.findOne({
      where: {
        userId: user.id,
        checkIn: { [Op.gte]: startOfDay }
      }
    });

    if (existing) {
      if (existing.checkOut) {
         // allow check in again? Or reject. Let's just create a new record if they already checked out, or return existing if not.
         return res.status(400).json({ message: 'You have already completed an attendance session today.' });
      }
      return res.json({ message: 'Already checked in.', attendance: existing });
    }

    const attendance = await Attendance.create({
      userId: user.id,
      checkIn: now,
      status: now > targetTime ? 'Late' : 'Present',
      location: `${lat},${lng}`
    });

    res.status(201).json({ message: 'Check-in successful!', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error during check-in', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;
    
    const attendance = await Attendance.findByPk(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    if (!attendance.checkOut) {
      attendance.checkOut = new Date();
      attendance.autoCheckedOut = true; // Mark as auto-checked out due to leaving
      await attendance.save();
    }

    res.json({ message: 'Checked out successfully.', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error during check-out', error: error.message });
  }
};
