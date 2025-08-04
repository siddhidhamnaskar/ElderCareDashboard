'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameScoreReports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      DeviceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Device number reference'
      },
      ReportDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Date of the report'
      },
      TotalGames: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Total number of games played'
      },
      TotalOkPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Total number of times OK button was pressed'
      },
      TotalWrongPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Total number of times Wrong button was pressed'
      },
      TotalNoPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Total number of times No button was pressed'
      },
      AverageResponseTime: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Average response time in seconds'
      },
      FastestResponseTime: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Fastest response time in seconds'
      },
      SlowestResponseTime: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Slowest response time in seconds'
      },
      SuccessRate: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Success rate percentage (0-100)'
      },
      TotalPlayTime: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Total time spent playing in minutes'
      },
      PeakHour: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Hour with most activity (0-23)'
      },
      ReportType: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'daily',
        comment: 'Type of report'
      },
      Status: {
        type: Sequelize.ENUM('active', 'archived', 'pending'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Report status'
      },
      Notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes or comments'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('GameScoreReports', ['DeviceNumber'], {
      name: 'idx_game_score_reports_device_number'
    });

    await queryInterface.addIndex('GameScoreReports', ['ReportDate'], {
      name: 'idx_game_score_reports_date'
    });

    await queryInterface.addIndex('GameScoreReports', ['ReportType'], {
      name: 'idx_game_score_reports_type'
    });

    await queryInterface.addIndex('GameScoreReports', ['Status'], {
      name: 'idx_game_score_reports_status'
    });

    // Add unique constraint for DeviceNumber, ReportDate, and ReportType combination
    await queryInterface.addIndex('GameScoreReports', ['DeviceNumber', 'ReportDate', 'ReportType'], {
      unique: true,
      name: 'idx_game_score_reports_device_date_type_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameScoreReports');
  }
}; 