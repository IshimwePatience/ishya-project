'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Revenue extends Model {
    static associate(models) {
      Revenue.belongsTo(models.Production, { foreignKey: 'productionId' });
    }
  }
  Revenue.init({
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Revenue',
  });
  return Revenue;
};
