'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Users', 'emailVerifyCode', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'emailVerifyExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'isVerified');
    await queryInterface.removeColumn('Users', 'emailVerifyCode');
    await queryInterface.removeColumn('Users', 'emailVerifyExpires');
  }
};
