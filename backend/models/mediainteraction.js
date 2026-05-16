'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MediaInteraction extends Model {
    static associate(models) {
      MediaInteraction.belongsTo(models.User, { foreignKey: 'userId' });
      MediaInteraction.belongsTo(models.MediaFile, { foreignKey: 'mediaId', onDelete: 'CASCADE' });
    }
  }
  MediaInteraction.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mediaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('like', 'unlike'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MediaInteraction',
  });
  return MediaInteraction;
};
