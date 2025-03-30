const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const UserActivityLog = sequelize.define('UserActivityLog', {
  log_id: {
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
  action: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_activity_log',
  timestamps: false
});

module.exports = UserActivityLog;
