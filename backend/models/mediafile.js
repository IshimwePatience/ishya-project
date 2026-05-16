'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MediaFile extends Model {
    static associate(models) {
      MediaFile.belongsTo(models.Production, { foreignKey: 'productionId', as: 'production' });
    }
  }
  MediaFile.init({
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: DataTypes.STRING, // Trailer, Full Movie, Poster
    format: DataTypes.STRING, // JPG, PNG, MP4, etc.
    category: DataTypes.STRING,
    productionId: DataTypes.INTEGER,
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    season: DataTypes.INTEGER,
    episodeNumber: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    metaData: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'MediaFile',
  });
  return MediaFile;
};
