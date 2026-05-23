const { Notification } = require('../models');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notif = await Notification.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId },
          { userId: null }
        ]
      }
    });

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notif.isRead = true;
    await notif.save();

    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.update(
      { isRead: true },
      {
        where: {
          [Op.or]: [
            { userId },
            { userId: null }
          ],
          isRead: false
        }
      }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notif = await Notification.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId },
          { userId: null }
        ]
      }
    });

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notif.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
