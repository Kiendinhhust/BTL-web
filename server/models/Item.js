const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Item = sequelize.define('Item', {
  item_id: {
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
  name: {
    type: DataTypes.STRING(255)
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  img_url: {
    type: DataTypes.STRING(255)
  },
  sale_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  attributes: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'items',
  timestamps: false
});

module.exports = Item;
