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
