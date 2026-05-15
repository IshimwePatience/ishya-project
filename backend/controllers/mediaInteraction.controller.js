const { MediaInteraction, MediaFile } = require('../models');

exports.toggleInteraction = async (req, res) => {
  try {
    const { mediaId, type } = req.body;
    const userId = req.user.id;

    if (!['like', 'unlike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid interaction type' });
    }

    // Find existing interaction
    const existing = await MediaInteraction.findOne({
      where: { userId, mediaId }
    });

    if (existing) {
      if (existing.type === type) {
        // Toggle off if same type
        await existing.destroy();
        return res.json({ message: 'Interaction removed', type: null });
      } else {
        // Switch type
        existing.type = type;
        await existing.save();
        return res.json({ message: `Switched to ${type}`, type });
      }
    } else {
      // Create new
      const created = await MediaInteraction.create({
        userId,
        mediaId,
        type
      });
      return res.json({ message: `Added ${type}`, type });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const jwt = require('jsonwebtoken');

exports.getMediaStats = async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    // Manual optional auth check
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Invalid token, treat as guest
      }
    }

    const likes = await MediaInteraction.count({ where: { mediaId, type: 'like' } });
    const unlikes = await MediaInteraction.count({ where: { mediaId, type: 'unlike' } });

    let userInteraction = null;
    if (userId) {
      const interaction = await MediaInteraction.findOne({
        where: { userId, mediaId }
      });
      userInteraction = interaction ? interaction.type : null;
    }

    res.json({ likes, unlikes, userInteraction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
