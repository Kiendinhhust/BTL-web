const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const OrderShipping = sequelize.define('OrderShipping', {
  order_shipping_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  },
  user_address_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'user_addresses',
      key: 'address_id'
    }
  },
  shipping_method_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'shipping_methods',
      key: 'shipping_id'
    }
  },
  tracking_number: {
    type: DataTypes.STRING(50),
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'order_shipping',
  timestamps: false
});

module.exports = OrderShipping;
