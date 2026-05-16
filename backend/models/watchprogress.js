'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WatchProgress extends Model {
    static associate(models) {
      WatchProgress.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      WatchProgress.belongsTo(models.MediaFile, { foreignKey: 'mediaId', as: 'media', onDelete: 'CASCADE' });
    }
  }
  WatchProgress.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mediaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currentTime: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    duration: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    isFinished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastWatched: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'WatchProgress',
    uniqueKeys: {
      user_media_unique: {
        fields: ['userId', 'mediaId']
      }
    }
  });
  return WatchProgress;
};
