const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductSale = sequelize.define('ProductSale', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'product',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  sale_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'sale',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  }
}, {
  tableName: 'product_sale',
  timestamps: false
});

module.exports = ProductSale;