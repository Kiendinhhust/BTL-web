const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const ProductReview = sequelize.define('ProductReview', {
  review_id: {
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
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'product_reviews',
  timestamps: false
});

module.exports = ProductReview;
