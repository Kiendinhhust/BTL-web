const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Category = sequelize.define('Category', {
  category_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  parent_category_id: { type: DataTypes.BIGINT },
  name: { type: DataTypes.STRING(100), allowNull: false },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  image_url: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT }
}, {
  tableName: 'categories',
  timestamps: true, // Có timestamps
  underscored: true,
   indexes: [ // Thêm index cho unique constraint từ SQL
     { unique: true, fields: ['parent_category_id', 'name'] }
   ]
});

module.exports = Category;