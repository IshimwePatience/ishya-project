const { WatchProgress, MediaFile, Production } = require('../models');

exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    let { mediaId, productionId, currentTime, duration, isFinished } = req.body;

    if (!productionId || productionId === 0) {
      const media = await MediaFile.findByPk(mediaId);
      if (media) productionId = media.productionId;
    }

    const [progress, created] = await WatchProgress.findOrCreate({
      where: { userId, mediaId },
      defaults: { productionId, currentTime, duration, isFinished }
    });

    if (!created) {
      await progress.update({
        productionId,
        currentTime,
        duration,
        isFinished,
        lastWatched: new Date()
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContinueWatching = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await WatchProgress.findAll({
      where: { 
        userId,
        isFinished: false 
      },
      include: [
        {
          model: MediaFile,
          as: 'media',
          include: [{ model: Production, as: 'production' }]
        }
      ],
      order: [['lastWatched', 'DESC']],
      limit: 10
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
