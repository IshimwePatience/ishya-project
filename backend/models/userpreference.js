'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      UserPreference.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  UserPreference.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pageKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zoomLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    viewMode: {
      type: DataTypes.STRING,
      defaultValue: 'grid'
    }
  }, {
    sequelize,
    modelName: 'UserPreference',
    uniqueKeys: {
      user_page_unique: {
        fields: ['userId', 'pageKey']
      }
    }
  });
  return UserPreference;
};
