'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_info', {
      user_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      phone_number: {
        type: Sequelize.STRING(20),
        unique: true
      },
      default_address: {
        type: Sequelize.BIGINT,
        references: {
          model: 'user_addresses',
          key: 'address_id'
        }
      },
      img: {
        type: Sequelize.STRING(100)
      },
      role: {
        type: Sequelize.ENUM('buyer', 'seller', 'admin'),
        allowNull: false,
        defaultValue: 'buyer'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_info');
  }
};
