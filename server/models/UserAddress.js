const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const UserAddress = sequelize.define('UserAddress', {
  address_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  phone_number: { type: DataTypes.STRING(20), allowNull: false },
  street_address: { type: DataTypes.STRING(255), allowNull: false },
  ward: { type: DataTypes.STRING(100), allowNull: false },
  district: { type: DataTypes.STRING(100), allowNull: false },
  city: { type: DataTypes.STRING(100), allowNull: false },
  country: { type: DataTypes.STRING(100), defaultValue: 'Vietnam' },
  address_type: { type: DataTypes.STRING(50) }
}, {
  tableName: 'user_addresses',
  timestamps: true, // Bảng này chỉ có created_at
  updatedAt: false, // Không có updated_at
  underscored: true
});

module.exports = UserAddress;