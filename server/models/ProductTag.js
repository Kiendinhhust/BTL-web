const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductTag = sequelize.define('ProductTag', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'product',
      key: 'id'
    }
  },
  tag_name: {
    type: DataTypes.STRING,
    primaryKey: true
  }
}, {
  tableName: 'product_tag',
  timestamps: false
});

module.exports = ProductTag;