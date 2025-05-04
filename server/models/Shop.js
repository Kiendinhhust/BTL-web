const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Shop = sequelize.define('Shop', {
  shop_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  owner_id: { type: DataTypes.BIGINT, allowNull: false },
  shop_name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  logo_url: { type: DataTypes.STRING(255) },
  cover_image_url: { type: DataTypes.STRING(255) },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'shops',
  timestamps: true, // Có timestamps
  underscored: true
});

module.exports = Shop;