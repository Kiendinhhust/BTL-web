const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Payment = sequelize.define(
  "Payment",
  {
    payment_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    payment_method: {
      type: DataTypes.ENUM(
        "credit_card",
        "paypal",
        "bank_transfer",
        "cod",
        "e_wallet"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "completed",
        "failed",
        "refunded",
        "partially_refunded"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    transaction_id: { type: DataTypes.STRING(100), unique: true },
    payment_gateway: { type: DataTypes.STRING(50) },
    gateway_response: { type: DataTypes.TEXT },
    paid_at: { type: DataTypes.DATE },
  },
  {
    tableName: "payments",
    timestamps: true, // Có timestamps
    underscored: true,
  }
);

module.exports = Payment;
