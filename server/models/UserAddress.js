const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const UserAddress = sequelize.define('UserAddress', {
  address_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  address_infor: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_addresses',
  timestamps: false
});

module.exports = UserAddress;
