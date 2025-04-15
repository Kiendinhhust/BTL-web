const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ProductRevenueSummary = sequelize.define('ProductRevenueSummary', {
  summary_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.BIGINT, allowNull: false },
  summary_date: { type: DataTypes.DATEONLY, allowNull: false },
  total_revenue: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  total_sold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'product_revenue_summary',
  timestamps: true, // Chỉ có created_at
  updatedAt: false,
  underscored: true,
  indexes: [ // Index cho unique constraint
    { unique: true, fields: ['product_id', 'summary_date'] }
  ]
});

module.exports = ProductRevenueSummary;