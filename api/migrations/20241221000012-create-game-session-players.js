'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameSessionPlayers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Session identifier'
      },
      deviceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Game device number'
      },
      playerName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Player name'
      },
      finalScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Final score after game completion'
      },
      okPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of correct presses'
      },
      wrongPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of wrong presses'
      },
      noPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of missed presses'
      },
      avgResponseTime: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Average response time'
      },
      status: {
        type: Sequelize.ENUM('ready', 'playing', 'completed'),
        allowNull: false,
        defaultValue: 'ready',
        comment: 'Player status in session'
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
    await queryInterface.addIndex('GameSessionPlayers', ['sessionId'], {
      name: 'idx_game_session_players_session_id'
    });
    await queryInterface.addIndex('GameSessionPlayers', ['deviceNumber'], {
      name: 'idx_game_session_players_device_number'
    });
    await queryInterface.addIndex('GameSessionPlayers', ['status'], {
      name: 'idx_game_session_players_status'
    });
    await queryInterface.addIndex('GameSessionPlayers', ['sessionId', 'deviceNumber'], {
      unique: true,
      name: 'game_session_player_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameSessionPlayers');
  }
}; 