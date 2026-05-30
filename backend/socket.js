const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { Notification, User, Role } = require('./models');

let io = null;

const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  // JWT auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }]
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`⚡ Socket connected: User ${user.firstName} ${user.lastName} (ID: ${user.id}, Role: ${user.role?.name})`);

    // 1. Join private user room
    socket.join(`user_${user.id}`);

    // 2. Join role room
    if (user.role?.name) {
      const roleRoom = user.role.name.toLowerCase().replace('/', '_').replace(' ', '_');
      socket.join(`role_${roleRoom}`);
      console.log(`   User joined role room: role_${roleRoom}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ID ${user.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Sends a notification: persists it to DB for appropriate users, and broadcasts in real-time.
 * Supports:
 * - Specific userId (persists for that user, emits to their private room)
 * - Specific role (persists for all users with that role, emits to the role room)
 * - Global (persists for everyone or just broadcasts)
 */
const sendNotification = async ({ userId, role, title, message, type }) => {
  try {
    const activeIo = getIo();

    if (userId) {
      // 1. Target single user
      const notif = await Notification.create({
        userId,
        title,
        message,
        type,
        isRead: false
      });
      activeIo.to(`user_${userId}`).emit('notification', notif);
      return notif;
    } 
    
    if (role) {
      // 2. Target specific role (e.g. 'Admin' or 'Partner')
      const targetRole = await Role.findOne({ where: { name: role } });
      if (targetRole) {
        const users = await User.findAll({ where: { roleId: targetRole.id } });
        
        // Persist DB notification for each active user of that role
        const createdNotifications = await Promise.all(
          users.map(async (u) => {
            return await Notification.create({
              userId: u.id,
              title,
              message,
              type,
              isRead: false
            });
          })
        );

        // Emit real-time notification to the role room
        const roleRoom = role.toLowerCase().replace('/', '_').replace(' ', '_');
        activeIo.to(`role_${roleRoom}`).emit('notification_refresh', { title, message, type });
        
        return createdNotifications;
      }
    } else {
      // 3. Global Broadcast
      // Save a global notification record with userId = null
      const notif = await Notification.create({
        userId: null,
        title,
        message,
        type,
        isRead: false
      });
      activeIo.emit('notification', notif);
      return notif;
    }
  } catch (err) {
    console.error('❌ Error sending socket notification:', err);
  }
};

module.exports = {
  init,
  getIo,
  sendNotification
};
