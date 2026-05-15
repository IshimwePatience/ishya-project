const express = require('express');
const router = express.Router();
const mediaInteractionController = require('../controllers/mediaInteraction.controller');
const { authMiddleware } = require('../middleware/auth');

router.post('/toggle', authMiddleware, mediaInteractionController.toggleInteraction);
router.get('/:mediaId/stats', mediaInteractionController.getMediaStats);

module.exports = router;
