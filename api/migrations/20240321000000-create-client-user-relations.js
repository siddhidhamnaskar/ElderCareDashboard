'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClientUserRelations', {
      client_uid: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'UnlinkedSensorClients',
          key: 'uid'
        }
      },
      user_google_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: 'SensorUsers',
          key: 'google_id'
        }
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('ClientUserRelations', ['client_uid', 'user_google_id'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClientUserRelations');
  }
}; 