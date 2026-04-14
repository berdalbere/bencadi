const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// ===========================
// USER
// ===========================
const User = sequelize.define('User', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  email:       { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password:    { type: DataTypes.STRING(255), allowNull: false },
  role:        { type: DataTypes.ENUM('client','editor','moderator','admin','superadmin'), defaultValue: 'client' },
  phone:       { type: DataTypes.STRING(30) },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
  // Permissions JSON
  permissions: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() { try { return JSON.parse(this.getDataValue('permissions')); } catch { return {}; } },
    set(val) { this.setDataValue('permissions', JSON.stringify(val || {})); },
  },
}, { tableName: 'users' });

// Hash password before create/update
User.beforeCreate(async (user) => {
  if (user.password) user.password = await bcrypt.hash(user.password, 12);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
});
User.prototype.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};
User.prototype.toJSON = function() {
  const v = { ...this.get() };
  delete v.password;
  return v;
};

// ===========================
// CATEGORY
// ===========================
const Category = sequelize.define('Category', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  slug:        { type: DataTypes.STRING(120), unique: true },
  icon:        { type: DataTypes.STRING(20), defaultValue: '📦' },
  color:       { type: DataTypes.STRING(20), defaultValue: '#c9a84c' },
  description: { type: DataTypes.TEXT },
  order:       { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'categories' });

// ===========================
// PRODUCT
// ===========================
const Product = sequelize.define('Product', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:             { type: DataTypes.STRING(200), allowNull: false },
  slug:             { type: DataTypes.STRING(220), unique: true },
  description:      { type: DataTypes.TEXT },
  shortDescription: { type: DataTypes.STRING(300) },
  price:            { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  comparePrice:     { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  stock:            { type: DataTypes.INTEGER, defaultValue: 0 },
  sku:              { type: DataTypes.STRING(80) },
  brand:            { type: DataTypes.STRING(100) },
  weight:           { type: DataTypes.FLOAT, defaultValue: 0 },
  mainImage:        { type: DataTypes.TEXT },
  isPublished:      { type: DataTypes.BOOLEAN, defaultValue: true },
  isNew:            { type: DataTypes.BOOLEAN, defaultValue: false },
  isFeatured:       { type: DataTypes.BOOLEAN, defaultValue: false },
  isPromo:          { type: DataTypes.BOOLEAN, defaultValue: false },
  promoLabel:       { type: DataTypes.STRING(50) },
  rating:           { type: DataTypes.FLOAT, defaultValue: 0 },
  numReviews:       { type: DataTypes.INTEGER, defaultValue: 0 },
  viewCount:        { type: DataTypes.INTEGER, defaultValue: 0 },
  soldCount:        { type: DataTypes.INTEGER, defaultValue: 0 },
  categoryId:       { type: DataTypes.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
}, { tableName: 'products' });

// ===========================
// PRODUCT_IMAGE
// ===========================
const ProductImage = sequelize.define('ProductImage', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  url:       { type: DataTypes.TEXT, allowNull: false },
  order:     { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'product_images', timestamps: false });

// ===========================
// PRODUCT_ATTRIBUTE (colors, tags, features)
// ===========================
const ProductAttribute = sequelize.define('ProductAttribute', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  type:      { type: DataTypes.ENUM('color','tag','feature'), allowNull: false },
  value:     { type: DataTypes.STRING(200), allowNull: false },
}, { tableName: 'product_attributes', timestamps: false });

// ===========================
// REVIEW
// ===========================
const Review = sequelize.define('Review', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  userId:    { type: DataTypes.INTEGER },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  rating:    { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comment:   { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'reviews' });

// ===========================
// ORDER
// ===========================
const Order = sequelize.define('Order', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber:   { type: DataTypes.STRING(20), unique: true },
  userId:        { type: DataTypes.INTEGER },
  guestEmail:    { type: DataTypes.STRING(150) },
  guestName:     { type: DataTypes.STRING(100) },
  status:        { type: DataTypes.ENUM('pending','confirmed','processing','shipped','delivered','cancelled'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.ENUM('cash_on_delivery','mobile_money','bank_transfer'), defaultValue: 'cash_on_delivery' },
  subtotal:      { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  shippingCost:  { type: DataTypes.DECIMAL(12, 0), defaultValue: 3000 },
  discount:      { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  totalAmount:   { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  notes:         { type: DataTypes.TEXT },
  couponCode:    { type: DataTypes.STRING(50) },
  // Shipping address (embedded as JSON for simplicity)
  shippingAddress: {
    type: DataTypes.TEXT,
    get() { try { return JSON.parse(this.getDataValue('shippingAddress')); } catch { return {}; } },
    set(val) { this.setDataValue('shippingAddress', JSON.stringify(val || {})); },
  },
}, { tableName: 'orders' });

// Generate order number before create
Order.beforeCreate(async (order) => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  order.orderNumber = `BNC-${rand}`;
});

// ===========================
// ORDER_ITEM
// ===========================
const OrderItem = sequelize.define('OrderItem', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId:   { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER },
  name:      { type: DataTypes.STRING(200), allowNull: false },
  price:     { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  quantity:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  image:     { type: DataTypes.TEXT },
  color:     { type: DataTypes.STRING(80) },
}, { tableName: 'order_items', timestamps: false });

// ===========================
// ORDER_STATUS_HISTORY
// ===========================
const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId:     { type: DataTypes.INTEGER, allowNull: false },
  status:      { type: DataTypes.STRING(50), allowNull: false },
  note:        { type: DataTypes.TEXT },
  updatedById: { type: DataTypes.INTEGER },
  date:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'order_status_history', timestamps: false });

// ===========================
// WISHLIST
// ===========================
const Wishlist = sequelize.define('Wishlist', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'wishlists', timestamps: false });

// ===========================
// SETTINGS
// ===========================
const Setting = sequelize.define('Setting', {
  id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key:   { type: DataTypes.STRING(100), allowNull: false, unique: true },
  value: {
    type: DataTypes.TEXT('long'),
    get() { try { return JSON.parse(this.getDataValue('value')); } catch { return this.getDataValue('value'); } },
    set(val) { this.setDataValue('value', typeof val === 'string' ? val : JSON.stringify(val)); },
  },
}, { tableName: 'settings' });

// ===========================
// PROMO
// ===========================
const Promo = sequelize.define('Promo', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type:          { type: DataTypes.ENUM('coupon','banner','flash'), defaultValue: 'coupon' },
  title:         { type: DataTypes.STRING(150), allowNull: false },
  couponCode:    { type: DataTypes.STRING(50) },
  discountType:  { type: DataTypes.ENUM('percentage','fixed'), defaultValue: 'percentage' },
  discountValue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  minPurchase:   { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  maxUsage:      { type: DataTypes.INTEGER, defaultValue: 0 },
  usageCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
  startDate:     { type: DataTypes.DATE, allowNull: false },
  endDate:       { type: DataTypes.DATE, allowNull: false },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
  order:         { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'promos' });

// ===========================
// ASSOCIATIONS
// ===========================
Category.hasMany(Product,      { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category,    { foreignKey: 'categoryId', as: 'category' });

Product.hasMany(ProductImage,     { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product,   { foreignKey: 'productId' });

Product.hasMany(ProductAttribute, { foreignKey: 'productId', as: 'attributes', onDelete: 'CASCADE' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Review,           { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product,         { foreignKey: 'productId' });
Review.belongsTo(User,            { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem,          { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order,        { foreignKey: 'orderId' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory', onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId' });

Order.belongsTo(User,             { foreignKey: 'userId', as: 'user' });
User.hasMany(Order,               { foreignKey: 'userId', as: 'orders' });

User.hasMany(Wishlist,            { foreignKey: 'userId', as: 'wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(User,          { foreignKey: 'userId' });
Wishlist.belongsTo(Product,       { foreignKey: 'productId', as: 'product' });
Product.hasMany(Wishlist,         { foreignKey: 'productId', onDelete: 'CASCADE' });

module.exports = {
  sequelize,
  User, Category, Product, ProductImage, ProductAttribute,
  Review, Order, OrderItem, OrderStatusHistory,
  Wishlist, Setting, Promo,
};
