'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AuthorizedJoyUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Authorized user email'
      },
      userType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Type of user (e.g., admin, user, etc.)'
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
    await queryInterface.addIndex('AuthorizedJoyUsers', ['email'], {
      unique: true,
      name: 'idx_authorized_users_email_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AuthorizedJoyUsers');
  }
}; 