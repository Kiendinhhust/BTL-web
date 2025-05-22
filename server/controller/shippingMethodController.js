const db = require("../models");
const { ShippingMethod } = db;
const { Op } = require("sequelize");

// Get all shipping methods with pagination
const getAllShippingMethods = async (req, res) => {
  try {
    const { page, size, name, is_active } = req.query;
    const limit = size ? parseInt(size) : 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    // Build where condition
    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.iLike]: `%${name}%` };
    }
    if (is_active !== undefined) {
      whereCondition.is_active = is_active === 'true';
    }

    const { count, rows } = await ShippingMethod.findAndCountAll({
      
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page ? parseInt(page) : 1,
      methods: rows
    });
  } catch (error) {
    console.error("Error getting shipping methods:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách phương thức vận chuyển.",
      error: error.message
    });
  }
};

// Get shipping method by ID
const getShippingMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const shippingMethod = await ShippingMethod.findByPk(id);

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy phương thức vận chuyển với ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      method: shippingMethod
    });
  } catch (error) {
    console.error(`Error getting shipping method with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin phương thức vận chuyển.",
      error: error.message
    });
  }
};

// Create new shipping method
const createShippingMethod = async (req, res) => {
  try {
    const { name, description, min_delivery_days, max_delivery_days, cost, is_active } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên phương thức vận chuyển là bắt buộc."
      });
    }

    if (cost === undefined || cost === null) {
      return res.status(400).json({
        success: false,
        message: "Chi phí vận chuyển là bắt buộc."
      });
    }

    // Create new shipping method
    const newShippingMethod = await ShippingMethod.create({
      name,
      description,
      min_delivery_days: min_delivery_days || 1,
      max_delivery_days: max_delivery_days || 7,
      cost,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: "Tạo phương thức vận chuyển thành công.",
      method: newShippingMethod
    });
  } catch (error) {
    console.error("Error creating shipping method:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi tạo phương thức vận chuyển.",
      error: error.message
    });
  }
};

// Update shipping method
const updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, min_delivery_days, max_delivery_days, cost, is_active } = req.body;

    // Find shipping method
    const shippingMethod = await ShippingMethod.findByPk(id);

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy phương thức vận chuyển với ID: ${id}`
      });
    }

    // Update fields
    if (name !== undefined) shippingMethod.name = name;
    if (description !== undefined) shippingMethod.description = description;
    if (min_delivery_days !== undefined) shippingMethod.min_delivery_days = min_delivery_days;
    if (max_delivery_days !== undefined) shippingMethod.max_delivery_days = max_delivery_days;
    if (cost !== undefined) shippingMethod.cost = cost;
    if (is_active !== undefined) shippingMethod.is_active = is_active;

    // Save changes
    await shippingMethod.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật phương thức vận chuyển thành công.",
      method: shippingMethod
    });
  } catch (error) {
    console.error(`Error updating shipping method with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật phương thức vận chuyển.",
      error: error.message
    });
  }
};

// Delete shipping method
const deleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;

    // Find shipping method
    const shippingMethod = await ShippingMethod.findByPk(id);

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy phương thức vận chuyển với ID: ${id}`
      });
    }

    // Delete shipping method
    await shippingMethod.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa phương thức vận chuyển thành công."
    });
  } catch (error) {
    console.error(`Error deleting shipping method with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xóa phương thức vận chuyển.",
      error: error.message
    });
  }
};

// Toggle shipping method active status
const toggleShippingMethodStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find shipping method
    const shippingMethod = await ShippingMethod.findByPk(id);

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy phương thức vận chuyển với ID: ${id}`
      });
    }

    // Toggle is_active status
    shippingMethod.is_active = !shippingMethod.is_active;

    // Save changes
    await shippingMethod.save();

    res.status(200).json({
      success: true,
      message: `Phương thức vận chuyển đã được ${shippingMethod.is_active ? 'kích hoạt' : 'vô hiệu hóa'}.`,
      method: shippingMethod
    });
  } catch (error) {
    console.error(`Error toggling shipping method status with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi thay đổi trạng thái phương thức vận chuyển.",
      error: error.message
    });
  }
};

module.exports = {
  getAllShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  toggleShippingMethodStatus
};
