'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy ID của các user đã tạo
    const users = await queryInterface.sequelize.query(
      'SELECT user_id FROM users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      return queryInterface.bulkInsert('user_addresses', [
        {
          user_id: users[0].user_id,
          address_infor: 'Số 1, Đường ABC, Quận XYZ, Thành phố Hà Nội',
          created_at: new Date()
        },
        {
          user_id: users[0].user_id,
          address_infor: 'Số 2, Đường DEF, Quận UVW, Thành phố Hồ Chí Minh',
          created_at: new Date()
        },
        {
          user_id: users[1].user_id,
          address_infor: 'Số 3, Đường GHI, Quận JKL, Thành phố Đà Nẵng',
          created_at: new Date()
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user_addresses', null, {});
  }
};
