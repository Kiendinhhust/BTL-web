const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ProductRevenue = sequelize.define('ProductRevenue', {
  revenue_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id'
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
  total_sold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'product_revenue',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'date']
    }
  ]
});

module.exports = ProductRevenue;
