const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ShippingMethod = sequelize.define('ShippingMethod', {
  shipping_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  estimated_time: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'shipping_methods',
  timestamps: false
});

module.exports = ShippingMethod;
