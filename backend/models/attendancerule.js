'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AttendanceRule extends Model {
    static associate(models) {
      // Define associations here if needed later
    }
  }
  AttendanceRule.init({
    targetLat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    targetLng: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    radius: {
      type: DataTypes.INTEGER, // in meters
      allowNull: false,
      defaultValue: 100
    },
    startTime: {
      type: DataTypes.TIME, // expected check-in time
      allowNull: false
    },
    lateExtension: {
      type: DataTypes.INTEGER, // grace period in minutes
      allowNull: false,
      defaultValue: 30
    },
    publicToken: {
      type: DataTypes.STRING, // unique token for the outside link
      allowNull: false,
      unique: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'AttendanceRule',
  });
  return AttendanceRule;
};
