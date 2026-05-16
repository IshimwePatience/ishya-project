const express = require('express');
const router = express.Router();
const watchProgressController = require('../controllers/watchprogress.controller');
const { authMiddleware } = require('../middleware/auth');

router.post('/update', authMiddleware, watchProgressController.updateProgress);
router.get('/continue', authMiddleware, watchProgressController.getContinueWatching);

module.exports = router;
