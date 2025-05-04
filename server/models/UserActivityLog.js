const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const UserActivityLog = sequelize.define('UserActivityLog', {
  log_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT },
  target_type: { type: DataTypes.STRING(50) },
  target_id: { type: DataTypes.BIGINT },
  action: { type: DataTypes.STRING(255), allowNull: false },
  details: { type: DataTypes.JSONB },
  ip_address: { type: DataTypes.STRING(45) },
  user_agent: { type: DataTypes.TEXT }
}, {
  tableName: 'user_activity_log',
  timestamps: true, // Chỉ có created_at
  updatedAt: false,
  underscored: true
});

module.exports = UserActivityLog;