const { Script, Production, Talent } = require('../models');

exports.getAllScripts = async (req, res) => {
  try {
    const scripts = await Script.findAll({
      include: [
        { model: Production, as: 'production' },
        { model: Talent, as: 'assignedActors', through: { attributes: [] } }
      ]
    });
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScript = async (req, res) => {
  try {
    const { talentIds, ...scriptData } = req.body;
    const script = await Script.create(scriptData);
    
    if (talentIds && talentIds.length > 0) {
      await script.setAssignedActors(talentIds);
    }
    
    const updatedScript = await Script.findByPk(script.id, {
      include: [
        { model: Production, as: 'production' },
        { model: Talent, as: 'assignedActors', through: { attributes: [] } }
      ]
    });
    
    res.status(201).json(updatedScript);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScript = async (req, res) => {
  try {
    const { talentIds, ...scriptData } = req.body;
    const script = await Script.findByPk(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    
    await script.update(scriptData);
    
    if (talentIds) {
      await script.setAssignedActors(talentIds);
    }
    
    const updatedScript = await Script.findByPk(script.id, {
      include: [
        { model: Production, as: 'production' },
        { model: Talent, as: 'assignedActors', through: { attributes: [] } }
      ]
    });
    
    res.json(updatedScript);
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
