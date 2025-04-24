const Shop = require('../models/Shop');
const ShopRevenue = require('../models/ShopRevenue');
const User = require('../models/User');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

// Create a new shop
const createShop = async (req, res) => {
  try {
    // Lấy role từ request (được thêm bởi middleware xác thực)
    const { role } = req.user || {};

    // Tạo shop với trạng thái dựa trên role
    const shopData = {
      ...req.body,
      status: role === 'admin' ? 'accepted' : 'pending'
    };

    const shop = await Shop.create(shopData);
    const { shop_id } = shop;

    await ShopRevenue.create({
      shop_id: shop_id,
      date: new Date(),
      total_orders: 0,
      total_revenue: 0
    });

    res.status(201).json({
      success: true,
      message: role === 'admin' ? 'Shop đã được tạo và chấp nhận' : 'Shop đã được tạo và đang chờ duyệt',
      shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
    // Lấy role và userId từ request (được thêm bởi middleware xác thực)
    const { role, userId } = req.user || {};

    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Kiểm tra quyền truy cập
    // Admin có thể xem tất cả shop
    // User chỉ có thể xem shop của họ hoặc shop đã được chấp nhận
    if (role !== 'admin' && shop.owner_id !== userId && shop.status !== 'accepted') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin shop này'
      });
    }

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

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a shop
const updateShop = async (req, res) => {
  try {
    await Shop.update(req.body, {
      where: { shop_id: req.params.id }
    });
    res.json({
      success: true,
      message: 'Shop updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a shop
const deleteShop = async (req, res) => {
  try {
    // Lấy thông tin shop trước khi xóa
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Lấy thông tin người dùng
    const owner = await User.findByPk(shop.owner_id);

    // Xóa shop revenue
    await ShopRevenue.destroy({ where: { shop_id: req.params.id } });

    // Xóa shop
    await Shop.destroy({
      where: { shop_id: req.params.id }
    });

    // Kiểm tra xem người dùng có phải là admin không
    const { role } = req.user || {};

   
    if (role !== 'admin' && owner && owner.role === 'seller') {
      
        await User.update(
          { role: 'buyer' },
          { where: { user_id: shop.owner_id } }
        );
      
    }

    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin approves a shop
const approveShop = async (req, res) => {
  try {
    // Lấy thông tin shop để biết owner_id
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shop'
      });
    }

    // Cập nhật trạng thái shop thành accepted
    await Shop.update(
      { status: 'accepted' },
      { where: { shop_id: req.params.id } }
    );


    const owner = await User.findByPk(shop.owner_id);
    if (owner && owner.role === 'buyer') {
      // Cập nhật role của người dùng từ buyer thành seller
      await User.update(
        { role: 'seller' },
        { where: { user_id: shop.owner_id } }
      );
    }

    res.json({
      success: true,
      message: 'Shop đã được duyệt thành công và người dùng đã được cập nhật thành seller'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin rejects a shop
const rejectShop = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    await Shop.update(
      {
        status: 'rejected',
        rejection_reason: reason
      },
      { where: { shop_id: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Shop đã bị từ chối'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPendingShops = async (req, res) => {
  try {
    const pendingShops = await Shop.findAll({
      where: { status: 'pending' }
    });

    res.json({
      success: true,
      data: pendingShops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  approveShop,
  rejectShop,
  getPendingShops
};
