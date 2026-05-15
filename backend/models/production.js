'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Production extends Model {
    static associate(models) {
      Production.belongsTo(models.ProductionCategory, { foreignKey: 'categoryId', as: 'category' });
      Production.belongsTo(models.User, { foreignKey: 'directorId', as: 'director' });
      Production.hasMany(models.Script, { foreignKey: 'productionId' });
      Production.hasMany(models.MediaFile, { foreignKey: 'productionId', as: 'mediaFiles' });
      Production.belongsToMany(models.Talent, { through: 'ProductionTalents', foreignKey: 'productionId', otherKey: 'talentId', as: 'talents' });
    }
  }
  Production.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    genre: DataTypes.STRING,
    language: DataTypes.STRING,
    duration: DataTypes.STRING,
    budget: DataTypes.DECIMAL(15, 2),
    releaseDate: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('Draft', 'Writing', 'Rehearsal', 'Filming', 'Editing', 'Released', 'Sold/Licensed'),
      defaultValue: 'Draft'
    },
    type: {
      type: DataTypes.ENUM('Movie', 'Theatre', 'Radio Drama', 'Journal/Paper', 'Script'),
      defaultValue: 'Movie'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    directorId: DataTypes.INTEGER,
    posterUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Production',
  });
  return Production;
};
