'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameDeviceUserRelations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      game_device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GameDevices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_google_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'SensorUsers',
          key: 'google_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'user',
        comment: 'Role of user for this game device (owner, user, admin)'
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.addIndex('GameDeviceUserRelations', ['game_device_id', 'user_google_id'], {
      unique: true,
      name: 'game_device_user_relation_unique'
    });

    await queryInterface.addIndex('GameDeviceUserRelations', ['user_google_id'], {
      name: 'game_device_user_relation_user_idx'
    });

    await queryInterface.addIndex('GameDeviceUserRelations', ['game_device_id'], {
      name: 'game_device_user_relation_device_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameDeviceUserRelations');
  }
}; 