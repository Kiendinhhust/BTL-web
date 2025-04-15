const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ShopAddress = sequelize.define('ShopAddress', {
  address_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  shop_id: { type: DataTypes.BIGINT, allowNull: false },
  street_address: { type: DataTypes.STRING(255), allowNull: false },
  ward: { type: DataTypes.STRING(100), allowNull: false },
  district: { type: DataTypes.STRING(100), allowNull: false },
  city: { type: DataTypes.STRING(100), allowNull: false },
  country: { type: DataTypes.STRING(100), defaultValue: 'Vietnam' },
  phone_number: { type: DataTypes.STRING(20), allowNull: false },
  is_pickup_address: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_return_address: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'shop_addresses',
  timestamps: false, // Bảng này không có timestamps trong SQL
  underscored: true
});

module.exports = ShopAddress;