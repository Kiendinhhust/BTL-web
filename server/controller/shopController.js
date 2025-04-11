const Shop = require('../models/Shop');
const ShopRevenue = require('../models/ShopRevenue');

// Create a new shop
const createShop = async (req, res) => {
  try {
    const shop = await Shop.create(req.body);
    const { shop_id } = shop;
    await ShopRevenue.create({
      shop_id: shop_id,
      date: new Date(),
      total_orders: 0,
      total_revenue: 0
    });
    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all shops
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.findAll();
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a shop by ID
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (shop) {
      const shopRevenue = await ShopRevenue.findOne({
        where: { shop_id: req.params.id },
        order: [['date', 'DESC']]
      });
      const response = {
        ...shop.dataValues,
        total_orders: shopRevenue ? shopRevenue.total_orders : 0,
        total_revenue: shopRevenue ? shopRevenue.total_revenue : 0,
        date: shopRevenue ? shopRevenue.date : null
      };
      res.json(response);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a shop
const updateShop = async (req, res) => {
  try {
    await Shop.update(req.body, {
      where: { shop_id: req.params.id }
    });
    res.json({ message: 'Shop updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a shop
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.destroy({
      where: { shop_id: req.params.id }
    });
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop
};
