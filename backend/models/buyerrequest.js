'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BuyerRequest extends Model {
    static associate(models) {
      // No associations needed for now
    }
  }
  BuyerRequest.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('TV Channel', 'Radio Station', 'Streaming Platform', 'Individual', 'Production Company'),
      allowNull: false
    },
    contactPerson: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    message: DataTypes.TEXT, // Why they want to partner
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    }
  }, {
    sequelize,
    modelName: 'BuyerRequest',
  });
  return BuyerRequest;
};
