'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    return queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        password_hash: hashedPassword,
        created_at: new Date()
      },
      {
        username: 'seller1',
        password_hash: hashedPassword,
        created_at: new Date()
      },
      {
        username: 'buyer1',
        password_hash: hashedPassword,
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
