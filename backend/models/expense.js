'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.Production, { foreignKey: 'productionId' });
    }
  }
  Expense.init({
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('Equipment', 'Transport', 'Actor payment', 'Venue', 'Editing', 'Marketing', 'Other'),
      allowNull: false
    },
    description: DataTypes.TEXT,
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
    modelName: 'Expense',
  });
  return Expense;
};
