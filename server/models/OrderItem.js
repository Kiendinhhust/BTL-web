const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.BIGINT, allowNull: false },
  item_id: { type: DataTypes.BIGINT, allowNull: false },
  product_id: { type: DataTypes.BIGINT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } }, // CHECK (quantity > 0)
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  sale_price: { type: DataTypes.DECIMAL(12, 2) },
  item_name: { type: DataTypes.STRING(255) },
  item_image_url: { type: DataTypes.STRING(255) },
  item_attributes: { type: DataTypes.JSONB }
}, {
  tableName: 'order_items',
  timestamps: false, // Không có timestamps
  underscored: true
});

module.exports = OrderItem;