'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Attendance.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
    }
  }
  Attendance.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Excused'),
      defaultValue: 'Present'
    },
    notes: DataTypes.TEXT,
    location: DataTypes.STRING,
    autoCheckedOut: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    checkInVideoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
