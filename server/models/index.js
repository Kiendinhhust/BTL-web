const sequelize = require('../config/db');

const User = require('./User');
const UserInfor = require('./UserInfor');
const RoleAction = require('./RoleAction');
const Product = require('./Product');
const Customer = require('./Customer');
const ProductTag = require('./ProductTag');
const Sale = require('./Sale');
const ProductSale = require('./ProductSale');

// Thiết lập quan hệ
User.hasOne(UserInfor, { foreignKey: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
UserInfor.belongsTo(User, { foreignKey: 'id' });

UserInfor.hasMany(Sale, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Sale.belongsTo(UserInfor, { foreignKey: 'user_id' });

Customer.hasMany(Sale, { foreignKey: 'customer_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id' });

Product.belongsToMany(Sale, { through: ProductSale, foreignKey: 'product_id' });
Sale.belongsToMany(Product, { through: ProductSale, foreignKey: 'sale_id' });

Product.belongsToMany(ProductTag, { through: 'ProductTag', foreignKey: 'product_id' });

// Xuất models và sequelize
module.exports = {
  sequelize,
  User,
  UserInfor,
  RoleAction,
  Product,
  Customer,
  ProductTag,
  Sale,
  ProductSale,
};