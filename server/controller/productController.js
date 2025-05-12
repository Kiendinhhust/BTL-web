const db = require("../models");

const { Product, Shop, Item } = db;
const slugify = require("slugify");
const { Op } = require("sequelize");

const { uploadImage, deleteImage } = require("../utils/cloudinaryHelper");

// Hàm helper lấy thông tin phân trang
const getPagination = (page, size) => {
  const limit = size > 30 || size < 0 ? +size : 30; // Mặc định 30 sản phẩm/trang
  const offset = page ? (page - 1) * limit : 0; // Tính offset

  return { limit, offset };
};

// Hàm helper tạo dữ liệu phân trang cho response
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: products } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, products, totalPages, currentPage };
};

// Hàm helper tạo slug chưa tồn tại
const generateUniqueSlug = async (baseSlug) => {
  let uniqueSlug = baseSlug;
  let count = 1;

  // Lặp đến khi tìm được slug chưa tồn tại
  while (await Product.findOne({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${count++}`;
  }

  return uniqueSlug;
};

// --- CRUD ---

// Thêm mới sản phẩm
const createProduct = async (req, res) => {
  try {
    if (!req.body.title || !req.body.shop_id) {
      return res
        .status(400)
        .send({ message: "Tiêu đề và shop_id không được để trống!" });
    }

    // Tạo slug từ title
    const productSlug = await generateUniqueSlug(
      slugify(req.body.title, { lower: true, strict: true })
    );

    // Dữ liệu sản phẩm mới
    const productData = {
      title: req.body.title,
      shop_id: req.body.shop_id,
      slug: productSlug,
      description: req.body.description,
      status: req.body.status || "active", // Mặc định 'active' nếu không có
      // rating và sold_count có giá trị mặc định trong database
    };

    const product = await Product.create(productData);
    res.status(201).send(product); // Trả về sản phẩm đã tạo thành công
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);

    res
      .status(500)
      .send({ message: error.message || "Đã xảy ra lỗi khi tạo sản phẩm." });
  }
};

// Lấy danh sách sản phẩm (có phân trang và tìm kiếm cơ bản)
const getAllProducts = async (req, res) => {
  const { page, size, title } = req.query; // Lấy tham số từ query string
  const { limit, offset } = getPagination(page, size);

  // Điều kiện tìm kiếm (nếu có title)
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;
  // Op.iLike không phân biệt hoa thường (PostgreSQL), dùng Op.like nếu cần phân biệt

  try {
    const data = await Product.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]], // Sắp xếp theo mới nhất
      // join với Shop
    });

    const response = getPagingData(data, page, limit);
    res.send(response);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).send({
      message: error.message || "Đã xảy ra lỗi khi lấy danh sách sản phẩm.",
    });
  }
};

// Lấy chi tiết một sản phẩm theo ID
const getProductById = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findByPk(
      id
      // , { include: [...] }
    );

    if (product) {
      res.send(product);
    } else {
      res
        .status(404)
        .send({ message: `Không tìm thấy sản phẩm với id=${id}.` });
    }
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm id=${id}:`, error);
    res.status(500).send({ message: `Lỗi khi lấy sản phẩm với id=${id}.` });
  }
};

// Cập nhật sản phẩm theo ID
const updateProduct = async (req, res) => {
  const id = req.params.id;

  try {
    // Tạo slug mới nếu title thay đổi
    if (req.body.title) {
      req.body.slug = await generateUniqueSlug(
        slugify(req.body.title, { lower: true, strict: true })
      );
    }

    const num = await Product.update(req.body, {
      where: { product_id: id },
    });

    if (num == 1) {
      // Sequelize update trả về mảng với số dòng bị ảnh hưởng
      // Lấy lại sản phẩm đã cập nhật để trả về (tùy chọn)
      const updatedProduct = await Product.findByPk(id);
      res.send({
        message: "Sản phẩm đã được cập nhật thành công.",
        product: updatedProduct,
      });
    } else {
      res.status(404).send({
        message: `Không thể cập nhật sản phẩm với id=${id}. Có thể không tìm thấy sản phẩm hoặc req.body trống!`,
      });
    }
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm id=${id}:`, error);
    // Bắt lỗi UNIQUE constraint của slug
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({
        message: `Sản phẩm với tiêu đề mới đã tồn tại (slug bị trùng).`,
      });
    }
    res
      .status(500)
      .send({ message: `Lỗi khi cập nhật sản phẩm với id=${id}.` });
  }
};

// Xóa sản phẩm theo ID
const deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Product.destroy({
      where: { product_id: id },
    });

    if (num == 1) {
      res.send({ message: "Sản phẩm đã được xóa thành công!" });
    } else {
      res.status(404).send({
        message: `Không thể xóa sản phẩm với id=${id}. Có thể không tìm thấy sản phẩm!`,
      });
    }
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm id=${id}:`, error);
    res.status(500).send({ message: `Không thể xóa sản phẩm với id=${id}.` });
  }
};

// --- ITEM CRUD ---

// Helper function kểm tra quyền owner
const checkProductOwnership = async (productId, userId) => {
  const product = await Product.findByPk(productId, {
    include: [{ model: Shop, as: "shop", attributes: ["owner_id"] }],
  });
  if (!product)
    return { product: null, isOwner: false, error: "Sản phẩm không tồn tại." };

  const isOwner = product.shop && product.shop.owner_id === userId;
  return { product, isOwner, error: null };
};

// Thêm item vào sản phẩm
const createItem = async (req, res) => {
  const productId = req.params.productId;
  const loggedInUserId = req.user.user_id; // từ auth middleware

  // Up ảnh và lấy url, nếu không có ảnh url là mặc định
  // if (req.file) {
  //   const folder = req.body.folder || "items";

  //   const result = await uploadImage(folder, req.file.buffer);
  //   req.body.image_url = result.secure_url;
  // } else {
  //   req.body.image_url = process.env.DEFAULT_PRODUCT_URL;
  // }
  // delete req.file.buffer;

  const { sku, price, stock, image_url, sale_price, attributes } = req.body;
  if (!price || stock === undefined || stock === null) {
    return res
      .status(400)
      .send({ message: "Giá và số lượng tồn kho là bắt buộc." });
  }
  if (stock < 0) {
    return res.status(400).send({ message: "Số lượng tồn kho không thể âm." });
  }
  if (sale_price && parseFloat(sale_price) >= parseFloat(price)) {
    return res
      .status(400)
      .send({ message: "Giá khuyến mãi phải nhỏ hơn giá gốc." });
  }
  // Thuộc tính
  if (attributes && typeof attributes !== "object") {
    return res
      .status(400)
      .send({ message: "Thuộc tính (attributes) phải là một đối tượng JSON." });
  }

  try {
    const {
      product,
      isOwner,
      error: ownerError,
    } = await checkProductOwnership(productId, loggedInUserId);

    if (ownerError) {
      return res.status(404).send({ message: ownerError });
    }

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).send({
        message: "Bạn không có quyền thêm mặt hàng cho sản phẩm này.",
      });
    }

    // Tạo mặt hàng
    const newItemData = {
      product_id: productId,
      price: price,
      stock: stock,
      image_url: image_url,
      sale_price: sale_price,
      attributes: attributes,
    };

    const newItem = await Item.create(newItemData);

    res.status(201).send(newItem);
  } catch (error) {
    console.error("Lỗi khi thêm mặt hàng:", error);
    // Handle potential unique constraint error for SKU
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({ message: `SKU '${sku}' đã tồn tại.` });
    }
    res.status(500).send({ message: "Đã xảy ra lỗi khi thêm mặt hàng." });
  }
};

// Tìm sản phẩm theo mặt hàng
const getItemsByProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send({ message: "Sản phẩm không tồn tại." });
    }

    const items = await Item.findAll({
      where: { product_id: productId },
      order: [["created_at", "ASC"]],
    });

    res.send(items);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mặt hàng:", error);
    res
      .status(500)
      .send({ message: "Đã xảy ra lỗi khi lấy danh sách mặt hàng." });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,

  createItem,
  getItemsByProduct,

  getPagination,
  getPagingData,
  generateUniqueSlug,
  checkProductOwnership,
};
