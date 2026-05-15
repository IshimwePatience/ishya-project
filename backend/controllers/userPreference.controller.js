const { UserPreference } = require('../models');

exports.getPreferences = async (req, res) => {
  try {
    const preferences = await UserPreference.findAll({
      where: { userId: req.user.id }
    });
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upsertPreference = async (req, res) => {
  try {
    const { pageKey, zoomLevel, viewMode } = req.body;
    const userId = req.user.id;

    console.log(`💾 Saving preference for User ${userId}, Page: ${pageKey} - Zoom: ${zoomLevel}`);

    let preference = await UserPreference.findOne({
      where: { userId, pageKey }
    });

    if (preference) {
      await preference.update({ zoomLevel, viewMode });
    } else {
      preference = await UserPreference.create({
        userId,
        pageKey,
        zoomLevel,
        viewMode
      });
    }

    res.json(preference);
  } catch (error) {
    console.error('❌ FAILED TO SAVE PREFERENCE:', error);
    res.status(400).json({ message: error.message });
  }
};
