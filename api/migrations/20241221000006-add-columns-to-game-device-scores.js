'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GameDeviceScores', 'last_time', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Last time the game was played (timestamp)'
    });

    await queryInterface.addColumn('GameDeviceScores', 'avg_time', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Average time taken for games'
    });

    await queryInterface.addColumn('GameDeviceScores', 'game_status', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Current status of the game'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GameDeviceScores', 'last_time');
    await queryInterface.removeColumn('GameDeviceScores', 'avg_time');
    await queryInterface.removeColumn('GameDeviceScores', 'game_status');
  }
}; 