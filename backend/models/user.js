'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
      User.belongsTo(models.Buyer, { foreignKey: 'buyerId', as: 'buyer' });
      User.hasMany(models.Production, { foreignKey: 'directorId', as: 'directedProductions' });
    }
    
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init({
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
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    googleId: DataTypes.STRING,
    profilePic: DataTypes.STRING,
    phone: DataTypes.STRING,
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    twoFactorCode: DataTypes.STRING,
    twoFactorExpires: DataTypes.DATE,
    isTwoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emailVerifyCode: DataTypes.STRING,
    emailVerifyExpires: DataTypes.DATE,
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      defaultValue: 'inactive'
    },
    subscriptionExpiresAt: DataTypes.DATE,
    notificationPrefs: {
      type: DataTypes.JSONB,
      defaultValue: {
        emailAlerts: true,
        browserAlerts: true,
        marketingEmails: false,
        troubleshootingAlerts: true
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user) => {
        if (user.password && !user.password.startsWith('$2b$')) {
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        }
      },
      beforeUpdate: (user) => {
        if (user.changed('password') && user.password && !user.password.startsWith('$2b$')) {
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        }
      }
    }
  });
  return User;
};
