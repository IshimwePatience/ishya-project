const { Script, Production } = require('../models');

exports.getAllScripts = async (req, res) => {
  try {
    const scripts = await Script.findAll({
      include: [{ model: Production, as: 'production' }]
    });
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScript = async (req, res) => {
  try {
    const script = await Script.create(req.body);
    res.status(201).json(script);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScript = async (req, res) => {
  try {
    const script = await Script.findByPk(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    await script.update(req.body);
    res.json(script);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteScript = async (req, res) => {
  try {
    const script = await Script.findByPk(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    await script.destroy();
    res.json({ message: 'Script deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
