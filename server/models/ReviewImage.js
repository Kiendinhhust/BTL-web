const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ReviewImage = sequelize.define('ReviewImage', {
  image_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  review_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'product_reviews',
      key: 'review_id'
    }
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'review_images',
  timestamps: false
});

module.exports = ReviewImage;
