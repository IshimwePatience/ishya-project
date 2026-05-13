require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
const { sequelize } = require('./models');

// 🛡️ GLOBAL ERROR TRAPS (Must be at the top)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ GLOBAL UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('❌ GLOBAL UNCAUGHT EXCEPTION:', error);
});

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disable for easier local dev video streaming
}));
app.use(cors({
  origin: 'http://localhost:5173', // Hardcode for dev or use process.env.CLIENT_URL
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'ishya-pms-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes Placeholder
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ishya Production Management System API' });
});

// Auth Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/productions', require('./routes/production.routes'));
app.use('/api/talents', require('./routes/talent.routes'));
app.use('/api/scripts', require('./routes/script.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/partner-requests', require('./routes/buyerRequest.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('⏳ Starting Ishya PMS Backend...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log('✨ Press CTRL+C to stop');
    });

    // 💓 Heartbeat to keep process alive in some environments
    setInterval(() => {
      // Internal keep-alive
    }, 1000 * 60 * 60);

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`💥 ERROR: Port ${PORT} is already being used by another program!`);
        process.exit(1);
      } else {
        console.error('💥 Server Error:', e);
      }
    });

  } catch (error) {
    console.error('💥 CRITICAL ERROR during startup:', error);
    process.exit(1);
  }
};

startServer();
