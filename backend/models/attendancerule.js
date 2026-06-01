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
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    targetLng: {
      type: DataTypes.DOUBLE,
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
    endTime: {
      type: DataTypes.TIME, // auto check-out time
      allowNull: false,
      defaultValue: '17:00:00'
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
