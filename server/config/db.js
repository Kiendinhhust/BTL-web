const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  port: process.env.DB_PORT,
  logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối đến PostgreSQL thành công!');
  } catch (error) {
    console.error('Lỗi kết nối database:', error);
  }
})();

module.exports = sequelize;