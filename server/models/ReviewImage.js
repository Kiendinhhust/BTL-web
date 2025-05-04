const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ReviewImage = sequelize.define('ReviewImage', {
  image_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  review_id: { type: DataTypes.BIGINT, allowNull: false },
  image_url: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: 'review_images',
  timestamps: true, // Chỉ có created_at
  updatedAt: false,
  underscored: true
});

module.exports = ReviewImage;