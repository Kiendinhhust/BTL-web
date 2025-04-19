const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Item = sequelize.define('Item', {
  item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.BIGINT, allowNull: false },
  sku: { type: DataTypes.STRING(100), unique: true },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  image_url: { type: DataTypes.STRING(255) },
  sale_price: { type: DataTypes.DECIMAL(12, 2) },
  attributes: { type: DataTypes.JSONB }
}, {
  tableName: 'items',
  timestamps: true, // Có timestamps
  underscored: true
});

module.exports = Item;