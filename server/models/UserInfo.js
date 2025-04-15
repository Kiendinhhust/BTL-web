const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const UserInfo = sequelize.define('UserInfo', {
  user_id: { type: DataTypes.BIGINT, primaryKey: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  phone_number: { type: DataTypes.STRING(20), unique: true },
  full_name: { type: DataTypes.STRING(100) },
  avatar_url: { type: DataTypes.STRING(255) },
  default_address_id: { type: DataTypes.BIGINT }
}, {
  tableName: 'user_info',
  timestamps: true, // Có cả created_at và updated_at
  underscored: true
});

module.exports = UserInfo;