'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Talent extends Model {
    static associate(models) {
      Talent.belongsToMany(models.Production, { through: 'ProductionTalents', foreignKey: 'talentId', otherKey: 'productionId', as: 'productions' });
      Talent.belongsToMany(models.Script, { through: 'ScriptAssignments', foreignKey: 'talentId', otherKey: 'scriptId', as: 'assignedScripts' });
      // Link talent to a system user account
      Talent.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
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
    specialty: DataTypes.STRING,
    skills: DataTypes.TEXT,
    bio: DataTypes.TEXT,
    profilePic: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    availability: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    portfolioUrl: DataTypes.STRING,
    socialLinks: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Talent',
  });
  return Talent;
};
