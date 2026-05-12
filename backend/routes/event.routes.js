const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authMiddleware } = require('../middleware/auth');

// PUBLIC ROUTES
router.get('/', eventController.getAllEvents);

// PROTECTED ROUTES (Need Token)
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

module.exports = router;
