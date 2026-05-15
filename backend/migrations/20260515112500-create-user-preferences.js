'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserPreferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pageKey: {
        type: Sequelize.STRING,
        allowNull: false
      },
      zoomLevel: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      viewMode: {
        type: Sequelize.STRING,
        defaultValue: 'grid'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('UserPreferences', ['userId', 'pageKey'], {
      unique: true,
      name: 'user_page_unique_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserPreferences');
  }
};
