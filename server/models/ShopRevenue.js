const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ShopRevenue = sequelize.define('ShopRevenue', {
  revenue_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  shop_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'shops',
      key: 'shop_id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_revenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_orders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'shop_revenue',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['shop_id', 'date']
    }
  ]
});

module.exports = ShopRevenue;
