const sequelize = require("../config/db");

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
// 1 User có 1 UserInfo

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
  UserActivityLog,
};
