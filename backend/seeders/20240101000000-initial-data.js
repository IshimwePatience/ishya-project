'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      { name: 'Admin', description: 'System Administrator', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Production Manager', description: 'Manages productions and schedules', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Finance Officer', description: 'Manages budgets and expenses', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Writer/Director', description: 'Manages scripts and creative direction', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Actor/Talent', description: 'Participates in productions', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Public Visitor', description: 'Website user', createdAt: new Date(), updatedAt: new Date() },
    ], {});

    await queryInterface.bulkInsert('ProductionCategories', [
      { name: 'Movie', description: 'Film productions', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Theatre', description: 'Stage plays and drama', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Radio Drama', description: 'Audio productions', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Journal/Paper', description: 'Academic or creative writing', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Script', description: 'Stand-alone scripts', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('ProductionCategories', null, {});
  }
};
