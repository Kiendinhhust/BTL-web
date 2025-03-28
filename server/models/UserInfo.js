const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const UserInfo = sequelize.define('UserInfo', {
  user_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    unique: true
  },
  default_address: {
    type: DataTypes.BIGINT,
    references: {
      model: 'user_addresses',
      key: 'address_id'
    }
  },
  img: {
    type: DataTypes.STRING(100)
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    allowNull: false,
    defaultValue: 'buyer'
  }
}, {
  tableName: 'user_info',
  timestamps: false
});

module.exports = UserInfo;
