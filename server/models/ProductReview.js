const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ProductReview = sequelize.define('ProductReview', {
  review_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.BIGINT, allowNull: false },
  item_id: { type: DataTypes.BIGINT }, // Có thể null
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  order_id: { type: DataTypes.BIGINT }, // Có thể null
  rating: { type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'product_reviews',
  timestamps: true, // Có timestamps
  underscored: true,
  indexes: [ // Index cho unique constraint
      { unique: true, fields: ['product_id', 'user_id', 'order_id'] }
  ]
});

module.exports = ProductReview;