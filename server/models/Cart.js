const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('Cart', {
  cart_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  item_id: { type: DataTypes.BIGINT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } }
}, {
  tableName: 'cart',
  timestamps: true, // Có timestamps
  underscored: true,
  indexes: [ // Index cho unique constraint
    { unique: true, fields: ['user_id', 'item_id'] }
  ]
});

module.exports = Cart;