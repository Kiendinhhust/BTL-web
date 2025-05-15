const { Shop, ShopRevenue, User, Order} = require('../models')
const sequelize = require('../config/db');
const { Op, fn, col, literal} = require('sequelize');

// Create a new shop
const createShop = async (req, res) => {
  try {

    const { shop_name, address, phone, description, owner_id, img } = req.body;

    // Tạo đối tượng dữ liệu shop
    const shopData = {
      shop_name,
      address,
      phone,
      description,
      owner_id: owner_id || (req.user ? req.user.userId : null),
      img,
      status: 'pending'
    };

    // Kiểm tra owner_id
    if (!shopData.owner_id) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const shop = await Shop.create(shopData);
    const { shop_id } = shop;

    // Tạo bản ghi doanh thu ban đầu
    await ShopRevenue.create({
      shop_id: shop_id,
      date: new Date(),
      total_orders: 0,
      total_revenue: 0
    });

    res.status(201).json({
      success: true,
      message: 'Shop đã được tạo và đang chờ duyệt',
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
    
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
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
      date: shopRevenue ? shopRevenue.date : null,
      // Đảm bảo các trường được trả về đầy đủ
      rating: shop.rating || 0,
      status: shop.status || 'pending',
      description: shop.description || '',
      rejection_reason: shop.rejection_reason || '',
      phone: shop.phone || ''
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
    const shop = await Shop.findByPk(req.params.id);

    const { shop_name, address, phone, description, img } = req.body;
    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
    }

    if (shop) {
      const updateData = {};
      
      if (phone) {
        updateData.phone = phone;
      }
      
      if (description !== undefined) {
        updateData.description = description;
      }
    
      if (shop_name !== undefined) {
        updateData.shop_name = shop_name;
      }
      
      if (address !== undefined) {
        updateData.address = address;
      }
      
     
      if (img !== undefined) {
        updateData.img = img;
      }
      
      if (Object.keys(updateData).length > 0) {
        await shop.update(updateData);
      }
    }


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

const getShopByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Tìm shop mới nhất (shop_id cao nhất) của user
    const latestShop = await Shop.findOne({
      where: { owner_id: userId },
      order: [['shop_id', 'DESC']]
    });

    if (!latestShop) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shop nào của người dùng này'
      });
    }


    const response = {
      ...latestShop.dataValues,
      rating: latestShop.rating || 0,
      status: latestShop.status || 'pending',
      description: latestShop.description || '',
      rejection_reason: latestShop.rejection_reason || '',
      phone: latestShop.phone || ''
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

// Hàm helper để kiểm tra quyền sở hữu shop hoặc vai trò admin
const checkShopAccess = async (shopId, userId, userRole) => {
    const shop = await Shop.findByPk(shopId, { attributes: ['owner_id'] });
    if (!shop) {
        return { authorized: false, message: 'Cửa hàng không tồn tại.', shop: null };
    }
    if (userRole === 'admin' || shop.owner_id === userId) {
        return { authorized: true, shop };
    }
    return { authorized: false, message: 'Bạn không có quyền truy cập thông tin của cửa hàng này.', shop: null };
};

// API Lấy Thống Kê Tổng Quan Của Shop
const getShopOverall = async (req, res) => {
    try {
        const shopId = parseInt(req.params.shopId);
        const userId = req.user.user_id;
        const userRole = req.user.role;

        // Kiểm tra quyền truy cập
        const accessCheck = await checkShopAccess(shopId, userId, userRole);
        if (!accessCheck.authorized) {
            return res.status(accessCheck.shop ? 403 : 404).json({ message: accessCheck.message });
        }

        // 1. Tổng số đơn hàng (Tính tất cả đơn hàng trừ 'canceled')
        const totalOrders = await Order.count({
            where: {
                shop_id: shopId,
                status: { [Op.notIn]: ['canceled'] } // Loại trừ đơn hủy
            }
        });

        // 2. Tổng số sản phẩm đang bán (status = 'active')
        const totalActiveProducts = await Product.count({
            where: {
                shop_id: shopId,
                status: 'active'
            }
        });

        // 3. Tổng số sản phẩm (items) đã bán (từ Product.sold_count)
        const totalItemsSoldFromOrders = await OrderItem.sum('quantity', {
            include: [{
                model: Order,
                as: 'order',
                where: {
                    shop_id: shopId,
                    status: 'delivered' // Chỉ tính đơn đã giao thành công
                },
                attributes: []
            }]
        });

        // 4. Tổng doanh thu (từ Order.total_price của các đơn hàng đã hoàn thành)
        // Chỉ tính các đơn hàng đã 'delivered' (hoàn thành và có khả năng đã thanh toán)
        const totalRevenue = await Order.sum('total_price', {
            where: {
                shop_id: shopId,
                status: 'delivered'
            }
        });

        res.status(200).json({
            shopId: shopId,
            totalOrders: totalOrders || 0,
            totalActiveProducts: totalActiveProducts || 0,
            totalProductsSold: totalItemsSoldFromOrders || 0,
            totalRevenue: parseFloat(totalRevenue) || 0, // Đảm bảo là số
        });

    } catch (error) {
        console.error(`Lỗi khi lấy thống kê cửa hàng ${req.params.shopId}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê cửa hàng.' });
    }
};


const getShopRevenueAndOrdersByPeriod = async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const userId = req.user.user_id;
    const userRole = req.user.role;
    let { startDate, endDate, groupBy = 'day' } = req.query;

    // Kiểm tra quyền truy cập
    const accessCheck = await checkShopAccess(shopId, userId, userRole);
    if (!accessCheck.authorized) {
        return res.status(accessCheck.shop ? 403 : 404).json({ message: accessCheck.message });
    }

    const now = new Date();
    if (endDate) {
        endDate = new Date(endDate);
        if (isNaN(endDate)) {
            return res.status(400).json({ message: "Ngày kết thúc không hợp lệ." });
        }
        endDate.setHours(23, 59, 59, 999);
    } else {
        const now = new Date();
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    if (startDate) {
        startDate = new Date(startDate);
        if (isNaN(startDate)) {
            return res.status(400).json({ message: "Ngày bắt đầu không hợp lệ." });
        }
        startDate.setHours(0, 0, 0, 0);
    } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    if (startDate > endDate) {
        return res.status(400).json({ message: "Ngày bắt đầu không được lớn hơn ngày kết thúc." });
    }

    const orderWhereConditions = {
        shop_id: shopId,
        status: 'delivered',
        created_at: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
        }
    };

    // Chọn format thời gian theo groupBy
    let dateTrunc;
    switch (groupBy) {
        case 'month':
            dateTrunc = 'month';
            break;
        case 'week':
            dateTrunc = 'week';
            break;
        case 'day':
        default:
            dateTrunc = 'day';
            break;
    }

    const dateFunction = fn('date_trunc', dateTrunc, col('created_at'));

    const statistics = await Order.findAll({
        attributes: [
            [dateFunction, 'period'],
            [fn('SUM', col('total_price')), 'totalRevenue'],
            [fn('COUNT', col('order_id')), 'totalOrders'],
        ],
        where: orderWhereConditions,
        group: [literal('period')],
        order: [[literal('period'), 'ASC']],
        raw: true
    });

    const formattedStatistics = statistics.map(stat => ({
        ...stat,
        period: stat.period.toISOString().split('T')[0],
        totalRevenue: parseFloat(stat.totalRevenue) || 0,
        totalOrders: parseInt(stat.totalOrders) || 0,
    }));

    res.status(200).json({
        shopId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        groupBy,
        statistics: formattedStatistics
    });

  } catch (error) {
      console.error(`Lỗi khi lấy thống kê doanh thu theo kỳ của cửa hàng ${req.params.shopId}:`, error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê.' });
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
  getPendingShops,
  getShopByUserId,
  getShopOverall,
  getShopRevenueAndOrdersByPeriod
};