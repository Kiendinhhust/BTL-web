const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ShopRevenueSummary = sequelize.define('ShopRevenueSummary', {
  summary_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  shop_id: { type: DataTypes.BIGINT, allowNull: false },
  summary_date: { type: DataTypes.DATEONLY, allowNull: false },
  total_revenue: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  total_orders: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  total_items_sold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'shop_revenue_summary',
  timestamps: true, // Chỉ có created_at
  updatedAt: false,
  underscored: true,
  indexes: [ // Index cho unique constraint
    { unique: true, fields: ['shop_id', 'summary_date'] }
  ]
});

module.exports = ShopRevenueSummary;