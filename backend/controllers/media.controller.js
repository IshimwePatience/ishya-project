const { MediaFile, Production } = require('../models');

exports.getAllMedia = async (req, res) => {
  try {
    const media = await MediaFile.findAll({
      include: [{ model: Production, as: 'production' }]
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id, {
      include: [{ model: Production, as: 'production' }]
    });
    if (!media) return res.status(404).json({ message: 'Media not found' });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const media = await MediaFile.bulkCreate(req.body);
      return res.status(201).json(media);
    }
    const media = await MediaFile.create(req.body);
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media asset not found' });
    await media.update(req.body);
    res.json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media asset not found' });
    await media.destroy();
    res.json({ message: 'Media asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
