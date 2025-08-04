'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameSessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique session identifier'
      },
      gameTime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Game duration in seconds'
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Session status'
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the game started'
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the game ended'
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'User who created the session'
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
    await queryInterface.addIndex('GameSessions', ['sessionId'], {
      unique: true,
      name: 'idx_game_sessions_session_id_unique'
    });

    await queryInterface.addIndex('GameSessions', ['status'], {
      name: 'idx_game_sessions_status'
    });

    await queryInterface.addIndex('GameSessions', ['createdBy'], {
      name: 'idx_game_sessions_created_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameSessions');
  }
}; 