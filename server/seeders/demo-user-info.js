'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy ID của các user đã tạo
    const users = await queryInterface.sequelize.query(
      'SELECT user_id FROM users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Lấy ID của các địa chỉ đã tạo
    const addresses = await queryInterface.sequelize.query(
      'SELECT address_id, user_id FROM user_addresses;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length >= 3) {
      const userInfoData = [
        {
          user_id: users[0].user_id,
          email: 'admin@example.com',
          phone_number: '0123456789',
          img: 'admin.jpg',
          role: 'admin'
        },
        {
          user_id: users[1].user_id,
          email: 'seller1@example.com',
          phone_number: '0123456788',
          img: 'seller1.jpg',
          role: 'seller'
        },
        {
          user_id: users[2].user_id,
          email: 'buyer1@example.com',
          phone_number: '0123456787',
          img: 'buyer1.jpg',
          role: 'buyer'
        }
      ];

      // Thêm default_address nếu có địa chỉ tương ứng
      for (let info of userInfoData) {
        const userAddresses = addresses.filter(addr => addr.user_id === info.user_id);
        if (userAddresses.length > 0) {
          info.default_address = userAddresses[0].address_id;
        }
      }

      return queryInterface.bulkInsert('user_info', userInfoData);
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user_info', null, {});
  }
};
