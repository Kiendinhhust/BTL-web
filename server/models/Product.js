const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Product = sequelize.define('Product', {
  product_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  shop_id: { type: DataTypes.BIGINT, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(280), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.0 },
  sold_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(50), defaultValue: 'active' }
}, {
  tableName: 'products',
  timestamps: true, // Có timestamps
  underscored: true
});

module.exports = Product;