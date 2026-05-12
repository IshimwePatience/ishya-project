const express = require('express');
const router = express.Router();
const talentController = require('../controllers/talent.controller');

router.get('/', talentController.getAllTalents);
router.get('/:id', talentController.getTalentById);
router.post('/', talentController.createTalent);
router.put('/:id', talentController.updateTalent);
router.delete('/:id', talentController.deleteTalent);

module.exports = router;
