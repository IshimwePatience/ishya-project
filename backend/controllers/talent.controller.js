const { Talent, Production } = require('../models');

exports.getAllTalents = async (req, res) => {
  try {
    const talents = await Talent.findAll({
      include: [{ model: Production, as: 'productions' }]
    });
    res.json(talents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTalentById = async (req, res) => {
  try {
    const talent = await Talent.findByPk(req.params.id, {
      include: [{ model: Production, as: 'productions' }]
    });
    if (!talent) return res.status(404).json({ message: 'Talent not found' });
    res.json(talent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTalent = async (req, res) => {
  try {
    const talent = await Talent.create(req.body);
    res.status(201).json(talent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTalent = async (req, res) => {
  try {
    const talent = await Talent.findByPk(req.params.id);
    if (!talent) return res.status(404).json({ message: 'Talent not found' });
    await talent.update(req.body);
    res.json(talent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTalent = async (req, res) => {
  try {
    const talent = await Talent.findByPk(req.params.id);
    if (!talent) return res.status(404).json({ message: 'Talent not found' });
    await talent.destroy();
    res.json({ message: 'Talent deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
