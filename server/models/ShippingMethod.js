const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ShippingMethod = sequelize.define('ShippingMethod', {
  shipping_method_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  min_delivery_days: { type: DataTypes.SMALLINT },
  max_delivery_days: { type: DataTypes.SMALLINT },
  cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'shipping_methods',
  timestamps: true, // Chỉ có created_at
  updatedAt: false,
  underscored: true
});

module.exports = ShippingMethod;