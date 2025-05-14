const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ProductImage = sequelize.define('ProductImage', {
  image_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.BIGINT, allowNull: false },
  image_url: { type: DataTypes.STRING(255), allowNull: false },
  alt_text: { type: DataTypes.STRING(255) },
  display_order: { type: DataTypes.SMALLINT, defaultValue: 0 }
}, {
  tableName: 'product_images',
  timestamps: false, // Không có timestamps
  underscored: true
});

module.exports = ProductImage;