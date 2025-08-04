'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update LTime column from DATETIME to INT
    await queryInterface.changeColumn('GameDevices', 'LTime', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Light time value'
    });

    // Update PTime column from DATETIME to INT
    await queryInterface.changeColumn('GameDevices', 'PTime', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Play time value'
    });

    // Update GTime column from DATETIME to INT
    await queryInterface.changeColumn('GameDevices', 'GTime', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Game time value'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert LTime column back to DATETIME
    await queryInterface.changeColumn('GameDevices', 'LTime', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Last time the device was active'
    });

    // Revert PTime column back to DATETIME
    await queryInterface.changeColumn('GameDevices', 'PTime', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Previous time the device was active'
    });

    // Revert GTime column back to DATETIME
    await queryInterface.changeColumn('GameDevices', 'GTime', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Game time or session time'
    });
  }
}; 