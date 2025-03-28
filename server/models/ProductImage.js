const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ProductImage = sequelize.define('ProductImage', {
  image_id: {
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
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'product_images',
  timestamps: false
});

module.exports = ProductImage;
