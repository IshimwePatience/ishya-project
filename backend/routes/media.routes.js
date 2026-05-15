const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/', mediaController.getAllMedia);
router.get('/partner/catalog', authMiddleware, mediaController.getPartnerCatalog);
router.get('/partner/library', authMiddleware, mediaController.getPartnerLibrary);
router.get('/:id', mediaController.getMediaById);

router.use(authMiddleware);

router.post('/', mediaController.uploadMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;
