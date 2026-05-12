'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductionCategory extends Model {
    static associate(models) {
      ProductionCategory.hasMany(models.Production, { foreignKey: 'categoryId' });
    }
  }
  ProductionCategory.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ProductionCategory',
  });
  return ProductionCategory;
};
