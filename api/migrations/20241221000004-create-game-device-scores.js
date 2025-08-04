'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameDeviceScores', {
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
      OkPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of times OK button was pressed'
      },
      WrongPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of times Wrong button was pressed'
      },
      NoPressed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of times No button was pressed'
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

    // Add unique index for DeviceNumber
    await queryInterface.addIndex('GameDeviceScores', ['DeviceNumber'], {
      unique: true,
      name: 'idx_game_device_scores_device_number_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameDeviceScores');
  }
}; 