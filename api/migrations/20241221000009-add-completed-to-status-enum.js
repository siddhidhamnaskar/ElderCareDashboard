'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'completed' to the Status enum
    await queryInterface.sequelize.query(`
      ALTER TABLE GameScoreReports 
      MODIFY COLUMN Status ENUM('active', 'archived', 'pending', 'completed') 
      NOT NULL DEFAULT 'active' 
      COMMENT 'Report status'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'completed' from the Status enum
    await queryInterface.sequelize.query(`
      ALTER TABLE GameScoreReports 
      MODIFY COLUMN Status ENUM('active', 'archived', 'pending') 
      NOT NULL DEFAULT 'active' 
      COMMENT 'Report status'
    `);
  }
}; 