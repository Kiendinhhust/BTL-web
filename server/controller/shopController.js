const Shop = require("../models/Shop");
const ShopRevenue = require("../models/ShopRevenue");
const User = require("../models/user");
const sequelize = require("../config/db");
const { Op } = require("sequelize");

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
      status: "pending",
    };

    // Kiểm tra owner_id
    if (!shopData.owner_id) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
    }

    const shop = await Shop.create(shopData);
    const { shop_id } = shop;

    // Tạo bản ghi doanh thu ban đầu
    await ShopRevenue.create({
      shop_id: shop_id,
      date: new Date(),
      total_orders: 0,
      total_revenue: 0,
    });

    res.status(201).json({
      success: true,
      message: "Shop đã được tạo và đang chờ duyệt",
      shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all shops
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.findAll();

    // Fetch revenue data for all shops
    const shopIds = shops.map((shop) => shop.shop_id);

    // Get the latest revenue record for each shop
    const shopRevenues = await ShopRevenue.findAll({
      where: { shop_id: { [Op.in]: shopIds } },
      order: [
        ["shop_id", "ASC"],
        ["date", "DESC"],
      ],
    });

    // Create a map of shop_id to latest revenue record
    const revenueMap = {};
    shopRevenues.forEach((revenue) => {
      if (!revenueMap[revenue.shop_id]) {
        revenueMap[revenue.shop_id] = revenue;
      }
    });

    // Add revenue data to each shop
    const shopsWithRevenue = shops.map((shop) => {
      const shopData = shop.get({ plain: true });
      const revenue = revenueMap[shop.shop_id];

      return {
        ...shopData,
        total_orders: revenue ? revenue.total_orders : 0,
        total_revenue: revenue ? revenue.total_revenue : 0,
        date: revenue ? revenue.date : null,
        rating: shop.rating || 0,
        status: shop.status || "pending",
        description: shop.description || "",
        rejection_reason: shop.rejection_reason || "",
        phone: shop.phone || "",
      };
    });

    res.json({
      success: true,
      data: shopsWithRevenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a shop by ID
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }
    const shopRevenue = await ShopRevenue.findOne({
      where: { shop_id: req.params.id },
      order: [["date", "DESC"]],
    });

    const response = {
      ...shop.dataValues,
      total_orders: shopRevenue ? shopRevenue.total_orders : 0,
      total_revenue: shopRevenue ? shopRevenue.total_revenue : 0,
      date: shopRevenue ? shopRevenue.date : null,
      // Đảm bảo các trường được trả về đầy đủ
      rating: shop.rating || 0,
      status: shop.status || "pending",
      description: shop.description || "",
      rejection_reason: shop.rejection_reason || "",
      phone: shop.phone || "",
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a shop
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);

    const { shop_name, address, phone, description, img } = req.body;
    if (!shop) {
      return res.status(404).json({ error: "Không tìm thấy cửa hàng" });
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
      message: "Shop updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Shop not found",
      });
    }

    // Lấy thông tin người dùng
    const owner = await User.findByPk(shop.owner_id);

    // Xóa shop revenue
    await ShopRevenue.destroy({ where: { shop_id: req.params.id } });

    // Xóa shop
    await Shop.destroy({
      where: { shop_id: req.params.id },
    });

    // Kiểm tra xem người dùng có phải là admin không
    const { role } = req.user || {};

    if (role !== "admin" && owner && owner.role === "seller") {
      await User.update(
        { role: "buyer" },
        { where: { user_id: shop.owner_id } }
      );
    }

    res.json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Không tìm thấy shop",
      });
    }

    // Cập nhật trạng thái shop thành accepted
    await Shop.update(
      { status: "accepted" },
      { where: { shop_id: req.params.id } }
    );

    const owner = await User.findByPk(shop.owner_id);
    if (owner && owner.role === "buyer") {
      // Cập nhật role của người dùng từ buyer thành seller
      await User.update(
        { role: "seller" },
        { where: { user_id: shop.owner_id } }
      );
    }

    res.json({
      success: true,
      message:
        "Shop đã được duyệt thành công và người dùng đã được cập nhật thành seller",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Vui lòng cung cấp lý do từ chối",
      });
    }

    await Shop.update(
      {
        status: "rejected",
        rejection_reason: reason,
      },
      { where: { shop_id: req.params.id } }
    );

    res.json({
      success: true,
      message: "Shop đã bị từ chối",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingShops = async (req, res) => {
  try {
    const pendingShops = await Shop.findAll({
      where: { status: "pending" },
    });

    // Fetch revenue data for all pending shops
    const shopIds = pendingShops.map((shop) => shop.shop_id);

    // Get the latest revenue record for each shop
    const shopRevenues = await ShopRevenue.findAll({
      where: { shop_id: { [Op.in]: shopIds } },
      order: [
        ["shop_id", "ASC"],
        ["date", "DESC"],
      ],
    });

    // Create a map of shop_id to latest revenue record
    const revenueMap = {};
    shopRevenues.forEach((revenue) => {
      if (!revenueMap[revenue.shop_id]) {
        revenueMap[revenue.shop_id] = revenue;
      }
    });

    // Add revenue data to each shop
    const shopsWithRevenue = pendingShops.map((shop) => {
      const shopData = shop.get({ plain: true });
      const revenue = revenueMap[shop.shop_id];

      return {
        ...shopData,
        total_orders: revenue ? revenue.total_orders : 0,
        total_revenue: revenue ? revenue.total_revenue : 0,
        date: revenue ? revenue.date : null,
        rating: shop.rating || 0,
        description: shop.description || "",
        rejection_reason: shop.rejection_reason || "",
        phone: shop.phone || "",
      };
    });

    res.json({
      success: true,
      data: shopsWithRevenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getShopByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Tìm shop mới nhất (shop_id cao nhất) của user
    const latestShop = await Shop.findOne({
      where: { owner_id: userId },
      order: [["shop_id", "DESC"]],
    });

    if (!latestShop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shop nào của người dùng này",
      });
    }

    // Tìm bản ghi doanh thu mới nhất của shop
    const shopRevenue = await ShopRevenue.findOne({
      where: { shop_id: latestShop.shop_id },
      order: [["date", "DESC"]],
    });

    const response = {
      ...latestShop.dataValues,
      rating: latestShop.rating || 0,
      status: latestShop.status || "pending",
      description: latestShop.description || "",
      rejection_reason: latestShop.rejection_reason || "",
      phone: latestShop.phone || "",
      // Thêm thông tin doanh thu
      total_orders: shopRevenue ? shopRevenue.total_orders : 0,
      total_revenue: shopRevenue ? shopRevenue.total_revenue : 0,
      date: shopRevenue ? shopRevenue.date : null,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
  getPendingShops,
  getShopByUserId,
};
