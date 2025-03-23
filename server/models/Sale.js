const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'user_infor',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  customer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customer',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  time_create: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  time_paid: {
    type: DataTypes.TIME
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  },
  sale_of: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sale',
  timestamps: false
});

module.exports = Sale;