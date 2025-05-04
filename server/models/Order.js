const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const crypto = require('crypto');

const Order = sequelize.define('Order', {
  order_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  order_code: { type: DataTypes.STRING(20), unique: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  shop_id: { type: DataTypes.BIGINT, allowNull: false },
  subtotal_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  shipping_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  note: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'canceled'), allowNull: false, defaultValue: 'pending' }
}, {
  tableName: 'orders',
  timestamps: true, // Có timestamps
  underscored: true,
  hooks: { // Sử dụng hook để tạo order_code
      beforeValidate: (order, options) => {
          if (!order.order_code) {
              order.order_code = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
          }
      }
  }
});

module.exports = Order;