const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const UserInfo = sequelize.define(
  "UserInfo",
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      unique: true,
    },
    firstname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    default_address: {
      type: DataTypes.BIGINT,
      references: {
        model: "user_addresses",
        key: "address_id",
      },
    },
    img: {
      type: DataTypes.BLOB("long"),
    },
  },
  {
    tableName: "user_info",
    timestamps: true, // Có cả created_at và updated_at
    underscored: true,
  }
);

module.exports = UserInfo;
