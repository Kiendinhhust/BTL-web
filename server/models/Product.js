const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = sequelize.define('Product', {
  product_id: {
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
  title: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0
  },
  sold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;