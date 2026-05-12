const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/script.controller');

router.get('/', scriptController.getAllScripts);
router.post('/', scriptController.createScript);
router.put('/:id', scriptController.updateScript);
router.delete('/:id', scriptController.deleteScript);

module.exports = router;
