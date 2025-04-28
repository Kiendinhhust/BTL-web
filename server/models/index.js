const sequelize = require('../config/db');

const User = require("./User");
const UserAddress = require("./UserAddress");
const UserInfo = require("./UserInfo");
const Shop = require("./Shop");
const ShopAddress = require("./ShopAddress");
const Category = require("./Category");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const Item = require("./Item");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const ShippingMethod = require("./ShippingMethod");
const OrderShipping = require("./OrderShipping");
const Payment = require("./Payment");
const ProductReview = require("./ProductReview");
const ReviewImage = require("./ReviewImage");
const Cart = require("./Cart");

const ShopRevenueSummary = require("./ShopRevenueSummary");
const ProductRevenueSummary = require("./ProductRevenueSummary");
const UserActivityLog = require("./UserActivityLog");


// --- Định nghĩa Associations ---
// --- User ---
User.hasOne(UserInfo, { foreignKey: "user_id", as: "user_info", onDelete: "CASCADE" });
User.hasMany(UserAddress, { foreignKey: "user_id", as: "user_addresses", onDelete: "CASCADE" });
User.hasMany(Shop, { foreignKey: "owner_id", as: "ownedShops", onDelete: "CASCADE" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders", onDelete: "RESTRICT" });
User.hasMany(Payment, { foreignKey: "user_id", as: "payments", onDelete: "RESTRICT" });
User.hasMany(ProductReview, { foreignKey: "user_id", as: "reviews", onDelete: "CASCADE" });
User.hasMany(Cart, { foreignKey: "user_id", as: "cartItems", onDelete: "CASCADE" }); // 1-N User-Cart
User.hasMany(UserActivityLog, { foreignKey: "user_id", as: "activityLogs", onDelete: 'SET NULL'}); // SQL dùng SET NULL

// User <=> Product (Wishlist - ManyToMany)
User.belongsToMany(Product, {
    through: 'wishlist', // Tên bảng trung gian (string là đủ)
    foreignKey: "user_id",
    otherKey: 'product_id',
    as: "wishlistedProducts",
    timestamps: true, // Bảng wishlist có created_at
    updatedAt: false,
    onDelete: 'CASCADE' // SQL cho FK user_id trong wishlist là CASCADE
});

// --- UserInfo ---
UserInfo.belongsTo(User, { foreignKey: "user_id", as: "user" });
// SQL dùng default_address_id và SET NULL
UserInfo.belongsTo(UserAddress, { foreignKey: "default_address_id", as: "defaultAddress", onDelete: "SET NULL" });

// --- UserAddress ---
UserAddress.belongsTo(User, { foreignKey: "user_id", as: "user" });
// SQL dùng RESTRICT cho OrderShipping liên quan đến UserAddress
UserAddress.hasMany(OrderShipping, { foreignKey: 'shipping_address_id', as: 'shipments', onDelete: 'RESTRICT' });

// --- Shop ---
Shop.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
Shop.hasMany(ShopAddress, { foreignKey: "shop_id", as: "addresses", onDelete: "CASCADE" });
Shop.hasMany(Product, { foreignKey: "shop_id", as: "products", onDelete: "CASCADE" });
// SQL dùng RESTRICT cho Orders liên quan đến Shop
Shop.hasMany(Order, { foreignKey: "shop_id", as: "orders", onDelete: "RESTRICT" });
Shop.hasMany(ShopRevenueSummary, { foreignKey: "shop_id", as: 'revenueSummaries', onDelete: 'CASCADE' });

// --- ShopAddress ---
ShopAddress.belongsTo(Shop, { foreignKey: "shop_id", as: "shop" });

// --- Category ---
// SQL dùng SET NULL cho parent_category_id
Category.belongsTo(Category, { foreignKey: 'parent_category_id', as: 'parent', onDelete: 'SET NULL' }); // Self Ref Parent
Category.hasMany(Category, { foreignKey: 'parent_category_id', as: 'children' }); // Self Ref Children

// Category <=> Product (ManyToMany) - Dùng CASCADE như SQL
Category.belongsToMany(Product, {
    through: 'product_categories', // Tên bảng trung gian
    foreignKey: "category_id",
    otherKey: 'product_id',
    as: "products",
    timestamps: false, // Bảng product_categories không có timestamps
    onDelete: 'CASCADE'
});

// --- Product ---
Product.belongsTo(Shop, { foreignKey: "shop_id", as: "shop" });
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images", onDelete: "CASCADE" });
Product.hasMany(Item, { foreignKey: "product_id", as: "items", onDelete: "CASCADE" });
Product.hasMany(ProductReview, { foreignKey: "product_id", as: "reviews", onDelete: "CASCADE" });
Product.hasMany(ProductRevenueSummary, { foreignKey: "product_id", as: 'revenueSummaries', onDelete: 'CASCADE' });
// SQL dùng RESTRICT cho OrderItems liên quan đến Product
Product.hasMany(OrderItem, { foreignKey: "product_id", as: 'orderItems', onDelete: 'RESTRICT' });

// Product <=> Category (ManyToMany) - Dùng CASCADE như SQL
Product.belongsToMany(Category, {
    through: 'product_categories', // Tên bảng trung gian
    foreignKey: "product_id",
    otherKey: 'category_id',
    as: "categories",
    timestamps: false,
    onDelete: 'CASCADE'
});

// Product <=> User (Wishlist - ManyToMany) - Dùng CASCADE như SQL
Product.belongsToMany(User, {
    through: 'wishlist', // Tên bảng trung gian
    foreignKey: "product_id",
    otherKey: 'user_id',
    as: "wishlistingUsers",
    timestamps: true, // Bảng wishlist có created_at
    updatedAt: false,
    onDelete: 'CASCADE'
});

// --- ProductImage ---
ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// --- Item ---
Item.belongsTo(Product, { foreignKey: "product_id", as: "product" });
// SQL dùng RESTRICT cho OrderItems liên quan đến Item
Item.hasMany(OrderItem, { foreignKey: "item_id", as: 'orderItems', onDelete: 'RESTRICT' });
Item.hasMany(Cart, { foreignKey: "item_id", as: "cartItems", onDelete: "CASCADE" }); // 1-N Item-Cart
// SQL dùng SET NULL cho review FK tới item
Item.hasMany(ProductReview, { foreignKey: 'item_id', as: 'reviews', onDelete: 'SET NULL' });

// --- Order ---
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.belongsTo(Shop, { foreignKey: "shop_id", as: "shop" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems", onDelete: "CASCADE" });
Order.hasOne(OrderShipping, { foreignKey: "order_id", as: "shippingInfo", onDelete: "CASCADE" }); 
Order.hasMany(Payment, { foreignKey: "order_id", as: "payments", onDelete: "CASCADE" });
Order.hasMany(ProductReview, { foreignKey: "order_id", as: "reviews", onDelete: 'SET NULL' });

// --- OrderItem ---
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Item, { foreignKey: "item_id", as: "item" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// --- ShippingMethod ---
// SQL dùng RESTRICT cho OrderShipping liên quan đến ShippingMethod
ShippingMethod.hasMany(OrderShipping, { foreignKey: 'shipping_method_id', as: 'shipments', onDelete: 'RESTRICT'});

// --- OrderShipping ---
OrderShipping.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderShipping.belongsTo(ShippingMethod, { foreignKey: "shipping_method_id", as: "shippingMethod" });
OrderShipping.belongsTo(UserAddress, { foreignKey: "shipping_address_id", as: "address" });

// --- Payment ---
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Payment.belongsTo(User, { foreignKey: "user_id", as: "user" });

// --- ProductReview ---
ProductReview.belongsTo(Product, { foreignKey: "product_id", as: "product" });
ProductReview.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
ProductReview.belongsTo(User, { foreignKey: "user_id", as: "user" });
ProductReview.belongsTo(Order, { foreignKey: "order_id", as: "order" });
ProductReview.hasMany(ReviewImage, { foreignKey: "review_id", as: "images", onDelete: "CASCADE" });

// --- ReviewImage ---
ReviewImage.belongsTo(ProductReview, { foreignKey: "review_id", as: "review" });

// --- Cart ---
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });
Cart.belongsTo(Item, { foreignKey: "item_id", as: "item" });

// --- ShopRevenueSummary ---
ShopRevenueSummary.belongsTo(Shop, { foreignKey: "shop_id", as: "shop" }); // FK đã là CASCADE

// --- ProductRevenueSummary ---
ProductRevenueSummary.belongsTo(Product, { foreignKey: "product_id", as: "product" }); // FK đã là CASCADE

// --- UserActivityLog ---
UserActivityLog.belongsTo(User, { foreignKey: "user_id", as: "user" }); // FK đã là SET NULL


// --- Xuất các models và sequelize instance ---
module.exports = {
  sequelize,
  User,
  UserAddress,
  UserInfo,
  Shop,
  ShopAddress,
  Category,
  Product,
  ProductImage,
  Item,
  Order,
  OrderItem,
  ShippingMethod,
  OrderShipping,
  Payment,
  ProductReview,
  ReviewImage,
  Cart,
  ShopRevenueSummary,
  ProductRevenueSummary,
  UserActivityLog
};