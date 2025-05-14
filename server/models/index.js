const sequelize = require("../config/db");

// Import tất cả các model
const User = require("./user");
const UserAddress = require("./UserAddress");
const UserInfo = require("./UserInfo");
const UserActivityLog = require("./UserActivityLog");
const Shop = require("./Shop");
const Product = require("./Product");
const Item = require("./Item");
const ProductImage = require("./ProductImage");
const ProductReview = require("./ProductReview");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const OrderShipping = require("./OrderShipping");
const Payment = require("./Payment");
const ShippingMethod = require("./ShippingMethod");
const ReviewImage = require("./ReviewImage");
const ShopRevenue = require("./ShopRevenue");
const Cart = require("./Cart");

// 1 User có 1 UserInfo
User.hasOne(UserInfo, { foreignKey: "user_id", onDelete: "CASCADE" });
UserInfo.belongsTo(User, { foreignKey: "user_id" });

// 1 User có nhiều địa chỉ
User.hasMany(UserAddress, { foreignKey: "user_id", onDelete: "CASCADE" });
UserAddress.belongsTo(User, { foreignKey: "user_id" });

// 1 UserInfo có 1 địa chỉ mặc định
UserInfo.belongsTo(UserAddress, {
  foreignKey: "default_address",
  onDelete: "SET NULL",
});

// 1 User có thể sở hữu nhiều Shop
User.hasMany(Shop, { foreignKey: "owner_id", onDelete: "CASCADE" });
Shop.belongsTo(User, { foreignKey: "owner_id" });

// 1 Shop có nhiều Product
Shop.hasMany(Product, { foreignKey: "shop_id", onDelete: "CASCADE" });
Product.belongsTo(Shop, { foreignKey: "shop_id" });

// 1 Product có nhiều Items
Product.hasMany(Item, { foreignKey: "product_id", onDelete: "CASCADE" });
Item.belongsTo(Product, { foreignKey: "product_id" });

// 1 Product có nhiều hình ảnh
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
});
ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// 1 User có nhiều Orders
User.hasMany(Order, { foreignKey: "user_id", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "user_id" });

// 1 Shop có nhiều Orders
Shop.hasMany(Order, { foreignKey: "shop_id", onDelete: "CASCADE" });
Order.belongsTo(Shop, { foreignKey: "shop_id" });

// 1 Order có nhiều OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// 1 OrderItem thuộc về 1 Item
Item.hasMany(OrderItem, { foreignKey: "item_id", onDelete: "CASCADE" });
OrderItem.belongsTo(Item, { foreignKey: "item_id" });

// 1 Order có 1 Payment
Order.hasOne(Payment, { foreignKey: "order_id", onDelete: "CASCADE" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

// 1 User có nhiều Payments
User.hasMany(Payment, { foreignKey: "user_id", onDelete: "CASCADE" });
Payment.belongsTo(User, { foreignKey: "user_id" });

// 1 Order có 1 OrderShipping
Order.hasOne(OrderShipping, { foreignKey: "order_id", onDelete: "CASCADE" });
OrderShipping.belongsTo(Order, { foreignKey: "order_id" });

// 1 ShippingMethod có nhiều OrderShipping
ShippingMethod.hasMany(OrderShipping, {
  foreignKey: "shipping_method_id",
  onDelete: "CASCADE",
});
OrderShipping.belongsTo(ShippingMethod, { foreignKey: "shipping_method_id" });

// 1 OrderShipping sử dụng 1 UserAddress
UserAddress.hasMany(OrderShipping, {
  foreignKey: "user_address_id",
  onDelete: "CASCADE",
});
OrderShipping.belongsTo(UserAddress, { foreignKey: "user_address_id" });

// 1 User có nhiều ProductReviews
User.hasMany(ProductReview, { foreignKey: "user_id", onDelete: "CASCADE" });
ProductReview.belongsTo(User, { foreignKey: "user_id" });

// 1 Product có nhiều ProductReviews
Product.hasMany(ProductReview, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
});
ProductReview.belongsTo(Product, { foreignKey: "product_id" });

// 1 ProductReview có nhiều ReviewImages
ProductReview.hasMany(ReviewImage, {
  foreignKey: "review_id",
  onDelete: "CASCADE",
});
ReviewImage.belongsTo(ProductReview, { foreignKey: "review_id" });

// 1 User có thể có nhiều sản phẩm trong Wishlist
User.belongsToMany(Product, {
  through: "wishlist",
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Product.belongsToMany(User, {
  through: "wishlist",
  foreignKey: "product_id",
  onDelete: "CASCADE",
});

// 1 User có thể có nhiều sản phẩm trong giỏ hàng
User.belongsToMany(Item, {
  through: "cart",
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Item.belongsToMany(User, {
  through: "cart",
  foreignKey: "item_id",
  onDelete: "CASCADE",
});

// 1 Shop có nhiều bản ghi doanh thu theo ngày
Shop.hasMany(ShopRevenue, { foreignKey: "shop_id", onDelete: "CASCADE" });
ShopRevenue.belongsTo(Shop, { foreignKey: "shop_id" });

// 1 User có nhiều hoạt động
User.hasMany(UserActivityLog, { foreignKey: "user_id", onDelete: "CASCADE" });
UserActivityLog.belongsTo(User, { foreignKey: "user_id" });

// Xuất các models đã liên kết
module.exports = {
  sequelize,
  Cart,
  User,
  UserAddress,
  UserInfo,
  Shop,
  Product,
  ProductImage,
  Item,
  UserActivityLog,
  ProductReview,
  Order,
  OrderItem,
  OrderShipping,
  Payment,
  ShopRevenue,
  ShippingMethod,
  ReviewImage,
};
