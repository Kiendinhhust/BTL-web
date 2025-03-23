const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RoleAction = sequelize.define('RoleAction', {
  role: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  action: {
    type: DataTypes.STRING,
    primaryKey: true
  }
}, {
  tableName: 'role_action',
  timestamps: false
});

module.exports = RoleAction;