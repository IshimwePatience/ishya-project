'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Buyer extends Model {
    static associate(models) {
      Buyer.hasMany(models.Contract, { foreignKey: 'buyerId' });
    }
  }
  Buyer.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('TV Channel', 'Radio Station', 'Streaming Platform', 'Individual', 'Production Company'),
      allowNull: false
    },
    contactPerson: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Buyer',
  });
  return Buyer;
};
