const sequelize = require('../config/db');

// Import tất cả các model
const User = require("./user")
const UserAddress = require("./UserAddress")
const UserInfo = require("./UserInfo")
const UserActivityLog = require("./UserActivityLog")
const AdminUser = require("./AdminUser")
const Shop = require("./Shop")
const ShopAddress = require("./ShopAddress")
// const Category = require("./category")
const Product = require("./Product")
const Item = require("./Item")
const ProductImage = require("./ProductImage")
// const Promotion = require("./promotion")
// const PromotionProduct = require("./promotionProduct")
const ProductRevenue = require("./ProductRevenue")
const ProductReview = require("./ProductReview")
const Order = require("./Order")
const OrderItem = require("./OrderItem")
const OrderShipping = require("./OrderShipping")
// const PaymentGateway = require("./paymentGateway")
const Payment = require("./Payment")
const ShippingMethod = require("./ShippingMethod")
const ReviewImage = require("./ReviewImage")
const ShopRevenue = require("./ShopRevenue")

// const Refund = require("./refund")
// const Voucher = require("./voucher")
// const UserVoucher = require("./userVoucher")
// const FavoriteProduct = require("./favoriteProduct")
// const Chat = require("./chat")
// const Notification = require("./notification")

// =======================================
// 1️⃣ Quan hệ giữa User, UserInfo và UserAddress
// =======================================
User.hasOne(UserInfo, { foreignKey: "user_id", onDelete: "CASCADE" });
UserInfo.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(UserAddress, { foreignKey: "user_id", onDelete: "CASCADE" });
UserAddress.belongsTo(User, { foreignKey: "user_id" });

UserInfo.belongsTo(UserAddress, { foreignKey: "default_address", onDelete: "SET NULL" });

// =======================================
// 2️⃣ Quan hệ giữa User, Shop và ShopAddress
// =======================================
// User.hasMany(Shop, { foreignKey: "owner_id", onDelete: "CASCADE" });
// Shop.belongsTo(User, { foreignKey: "owner_id" });

// Shop.hasMany(ShopAddress, { foreignKey: "shop_id", onDelete: "CASCADE" });
// ShopAddress.belongsTo(Shop, { foreignKey: "shop_id" });

// =======================================
// 3️⃣ Quan hệ giữa Category và Product
// =======================================
// Category.hasMany(Product, { foreignKey: "category_id", onDelete: "SET NULL" });
// Product.belongsTo(Category, { foreignKey: "category_id" });

// Category.hasMany(Category, { foreignKey: "parent_id", onDelete: "SET NULL" });

// =======================================
// 4️⃣ Quan hệ giữa Shop, Product và ProductImage
// =======================================
// Shop.hasMany(Product, { foreignKey: "shop_id", onDelete: "CASCADE" });
// Product.belongsTo(Shop, { foreignKey: "shop_id" });

// Product.hasMany(ProductImage, { foreignKey: "product_id", onDelete: "CASCADE" });
// ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// =======================================
// 5️⃣ Quan hệ giữa Promotion và Product
// =======================================
// Promotion.hasMany(PromotionProduct, { foreignKey: "promotion_id", onDelete: "CASCADE" });
// PromotionProduct.belongsTo(Promotion, { foreignKey: "promotion_id" });

// Product.hasMany(PromotionProduct, { foreignKey: "product_id", onDelete: "CASCADE" });
// PromotionProduct.belongsTo(Product, { foreignKey: "product_id" });

// =======================================
// 6️⃣ Quan hệ giữa User, Order và OrderItem
// =======================================
// User.hasMany(Order, { foreignKey: "user_id", onDelete: "CASCADE" });
// Order.belongsTo(User, { foreignKey: "user_id" });

// Order.hasMany(OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });
// OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// Product.hasMany(OrderItem, { foreignKey: "product_id", onDelete: "CASCADE" });
// OrderItem.belongsTo(Product, { foreignKey: "product_id" });

// =======================================
// 7️⃣ Quan hệ giữa Order, Shipping và Payment
// =======================================
// Order.hasOne(Shipping, { foreignKey: "order_id", onDelete: "CASCADE" });
// Shipping.belongsTo(Order, { foreignKey: "order_id" });

// User.hasMany(Payment, { foreignKey: "user_id", onDelete: "CASCADE" });
// Order.hasOne(Payment, { foreignKey: "order_id", onDelete: "CASCADE" });
// Payment.belongsTo(Order, { foreignKey: "order_id" });

// PaymentGateway.hasMany(Payment, { foreignKey: "gateway_id", onDelete: "CASCADE" });
// Payment.belongsTo(PaymentGateway, { foreignKey: "gateway_id" });

// =======================================
// 8️⃣ Quan hệ giữa User, Review và FavoriteProduct
// =======================================
// User.hasMany(Review, { foreignKey: "user_id", onDelete: "CASCADE" });
// Review.belongsTo(User, { foreignKey: "user_id" });

// Product.hasMany(Review, { foreignKey: "product_id", onDelete: "CASCADE" });
// Review.belongsTo(Product, { foreignKey: "product_id" });

// User.hasMany(FavoriteProduct, { foreignKey: "user_id", onDelete: "CASCADE" });
// Product.hasMany(FavoriteProduct, { foreignKey: "product_id", onDelete: "CASCADE" });

// =======================================
// 9️⃣ Quan hệ giữa Voucher, UserVoucher và Order
// =======================================
// User.hasMany(UserVoucher, { foreignKey: "user_id", onDelete: "CASCADE" });
// Voucher.hasMany(UserVoucher, { foreignKey: "voucher_id", onDelete: "CASCADE" });
// UserVoucher.belongsTo(User, { foreignKey: "user_id" });
// UserVoucher.belongsTo(Voucher, { foreignKey: "voucher_id" });

// =======================================
// 🔟 Quan hệ giữa User, Chat và Notification
// =======================================
// User.hasMany(Chat, { foreignKey: "sender_id", onDelete: "CASCADE" });
// User.hasMany(Chat, { foreignKey: "receiver_id", onDelete: "CASCADE" });
// Chat.belongsTo(User, { foreignKey: "sender_id" });
// Chat.belongsTo(User, { foreignKey: "receiver_id" });

// User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });

// Xuất models và Sequelize instance
module.exports = {
  sequelize,
  User,
  UserAddress,
  UserInfo,
  AdminUser,
  Shop,
  ShopAddress,
  // Category,
  Product,
  ProductImage,
  // Promotion,
  // PromotionProduct,
  Item,
  UserActivityLog,
  ProductReview,
  Order,
  OrderItem,
  OrderShipping,
  // PaymentGateway,
  Payment,
  ProductRevenue,
  ShopRevenue,
  ShippingMethod,
  ReviewImage
  // Refund,
  // Voucher,
  // UserVoucher,
  // FavoriteProduct,
  // Chat,
  // Notification,
};