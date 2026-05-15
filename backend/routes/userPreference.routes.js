const express = require('express');
const router = express.Router();
const userPreferenceController = require('../controllers/userPreference.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, userPreferenceController.getPreferences);
router.post('/', authMiddleware, userPreferenceController.upsertPreference);

module.exports = router;
