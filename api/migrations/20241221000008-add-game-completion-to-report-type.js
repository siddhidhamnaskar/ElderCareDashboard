'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'game_completion' to the ReportType enum
    await queryInterface.sequelize.query(`
      ALTER TABLE GameScoreReports 
      MODIFY COLUMN ReportType ENUM('daily', 'weekly', 'monthly', 'game_completion') 
      NOT NULL DEFAULT 'daily' 
      COMMENT 'Type of report'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'game_completion' from the ReportType enum
    await queryInterface.sequelize.query(`
      ALTER TABLE GameScoreReports 
      MODIFY COLUMN ReportType ENUM('daily', 'weekly', 'monthly') 
      NOT NULL DEFAULT 'daily' 
      COMMENT 'Type of report'
    `);
  }
}; 