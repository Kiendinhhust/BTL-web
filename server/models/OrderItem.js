const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: {
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
  item_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'items',
      key: 'item_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
