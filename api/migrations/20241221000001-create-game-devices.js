'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameDevices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      DeviceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique device identifier'
      },
      LTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time the device was active'
      },
      PTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Previous time the device was active'
      },
      GTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Game time or session time'
      },
      NL: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of levels or game level'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'active',
        comment: 'Device status (active, inactive, maintenance)'
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

    // Add index for DeviceNumber
    await queryInterface.addIndex('GameDevices', ['DeviceNumber'], {
      unique: true,
      name: 'game_devices_device_number_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameDevices');
  }
}; 