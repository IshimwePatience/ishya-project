'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    static associate(models) {
      Sale.belongsTo(models.Contract, { foreignKey: 'contractId' });
      Sale.belongsTo(models.Production, { foreignKey: 'productionId', as: 'production' });
      Sale.belongsTo(models.Buyer, { foreignKey: 'buyerId', as: 'buyer' });
    }
  }
  Sale.init({
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('Pending', 'Paid', 'Partial'),
      defaultValue: 'Pending'
    },
    saleType: {
      type: DataTypes.ENUM('Full ownership sale', 'Licensing', 'Broadcast rights', 'Script sale', 'Theatre ticket sales'),
      allowNull: false
    },
    contractId: DataTypes.INTEGER,
    productionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    buyerId: DataTypes.INTEGER,
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiryDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Sale',
  });
  return Sale;
};
