'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Talent extends Model {
    static associate(models) {
      Talent.belongsToMany(models.Production, { through: 'ProductionTalents', foreignKey: 'talentId', otherKey: 'productionId', as: 'productions' });
      Talent.belongsToMany(models.Script, { through: 'ScriptAssignments', foreignKey: 'talentId', otherKey: 'scriptId', as: 'assignedScripts' });
    }
  }
  Talent.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true }
    },
    phone: DataTypes.STRING,
    specialty: DataTypes.STRING, // Actor, Actress, Director, etc.
    skills: DataTypes.TEXT,
    bio: DataTypes.TEXT,
    profilePic: DataTypes.STRING,
    availability: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    portfolioUrl: DataTypes.STRING,
    socialLinks: DataTypes.JSONB // Store links like {twitter: '...', linkedin: '...'}
  }, {
    sequelize,
    modelName: 'Talent',
  });
  return Talent;
};
