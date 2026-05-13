'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Script extends Model {
    static associate(models) {
      Script.belongsTo(models.Production, { foreignKey: 'productionId', as: 'production' });
      Script.belongsToMany(models.Talent, { through: 'ScriptAssignments', foreignKey: 'scriptId', otherKey: 'talentId', as: 'assignedActors' });
    }
  }
  Script.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0'
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: DataTypes.STRING, // PDF, DOCX, etc.
    status: {
      type: DataTypes.ENUM('Draft', 'Under Review', 'Approved', 'Rejected'),
      defaultValue: 'Draft'
    },
    productionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    authorId: DataTypes.INTEGER,
    copyrightInfo: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Script',
  });
  return Script;
};
