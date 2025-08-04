'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists
    const tableDescription = await queryInterface.describeTable('GameDevices');
    
    if (!tableDescription.lastHeartBeatTime) {
      await queryInterface.addColumn('GameDevices', 'lastHeartBeatTime', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp of last heartbeat from device'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if the column exists before trying to remove it
    const tableDescription = await queryInterface.describeTable('GameDevices');
    
    if (tableDescription.lastHeartBeatTime) {
      await queryInterface.removeColumn('GameDevices', 'lastHeartBeatTime');
    }
  }
}; 