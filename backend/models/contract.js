'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsTo(models.Buyer, { foreignKey: 'buyerId' });
      Contract.belongsTo(models.Production, { foreignKey: 'productionId' });
      Contract.hasOne(models.Sale, { foreignKey: 'contractId' });
    }
  }
  Contract.init({
    contractNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    terms: DataTypes.TEXT,
    expiryDate: DataTypes.DATE,
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    filePath: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('Active', 'Expired', 'Terminated'),
      defaultValue: 'Active'
    }
  }, {
    sequelize,
    modelName: 'Contract',
  });
  return Contract;
};
