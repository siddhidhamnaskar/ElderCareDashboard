'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the unique constraint that prevents multiple game_completion reports per day
    await queryInterface.removeIndex('GameScoreReports', 'idx_game_score_reports_device_date_type_unique');
    
    // Add a new non-unique index for better query performance
    await queryInterface.addIndex('GameScoreReports', ['DeviceNumber', 'ReportDate', 'ReportType'], {
      name: 'idx_game_score_reports_device_date_type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the non-unique index
    await queryInterface.removeIndex('GameScoreReports', 'idx_game_score_reports_device_date_type');
    
    // Restore the original unique constraint
    await queryInterface.addIndex('GameScoreReports', ['DeviceNumber', 'ReportDate', 'ReportType'], {
      unique: true,
      name: 'idx_game_score_reports_device_date_type_unique'
    });
  }
}; 