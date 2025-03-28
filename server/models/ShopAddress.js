const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ShopAddress = sequelize.define('ShopAddress', {
  address_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  shop_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'shops',
      key: 'shop_id'
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'shop_addresses',
  timestamps: false
});

module.exports = ShopAddress;