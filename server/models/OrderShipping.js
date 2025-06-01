const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const OrderShipping = sequelize.define('OrderShipping', {
  order_shipping_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
  shipping_method_id: { type: DataTypes.BIGINT, allowNull: false },
  shipping_address_id: { type: DataTypes.BIGINT, allowNull: false },
  shipper_id: {
    type: DataTypes.BIGINT,
    allowNull: true 
  },
  tracking_number: { type: DataTypes.STRING(100), unique: true },
  shipping_cost: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('pending', 'awaiting_pickup', 'shipped', 'delivered', 'canceled', 'failed_delivery', 'assigned', 'on_the_way'), allowNull: false, defaultValue: 'pending' },
  shipped_at: { type: DataTypes.DATE },
  delivered_at: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT }
}, {
  tableName: 'order_shipping',  
  timestamps: true, // Có timestamps
  underscored: true
});

module.exports = OrderShipping;