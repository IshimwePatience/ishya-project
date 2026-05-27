'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.Production, { foreignKey: 'productionId' });
    }
  }
  Event.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Rehearsal', 'Performance', 'Meeting', 'Filming'),
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    venue: DataTypes.STRING,
    posterUrl: DataTypes.STRING,
    productionId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    ticketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    vipPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    vvipPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tablePrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
      defaultValue: 'Scheduled'
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
