const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production.controller');
const { authMiddleware } = require('../middleware/auth');

router.get('/categories', productionController.getCategories);
router.get('/', productionController.getAllProductions);
router.get('/:id', productionController.getProductionById);

router.use(authMiddleware);

router.post('/', productionController.createProduction);
router.put('/:id', productionController.updateProduction);
router.delete('/:id', productionController.deleteProduction);

module.exports = router;
