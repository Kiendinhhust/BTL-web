const db = require("../models");

const { Product, Shop, Item } = db;
const slugify = require("slugify");
const { Op } = require("sequelize");

const { uploadImage, deleteImage } = require("../utils/cloudinaryHelper");
const cloudinary = require('../config/cloudinaryStore');

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
    // 1. Validate required fields
    if (!req.body.title || !req.body.shop_id) {
      return res.status(400).send({
        success: false,
        message: "Tiêu đề và shop_id không được để trống!"
      });
    }

    // 2. Check shop existence
    const shop = await Shop.findByPk(req.body.shop_id);
    if (!shop) {
      return res.status(404).send({
        success: false,
        message: `Không tìm thấy shop với id=${req.body.shop_id}.`
      });
    }

    // 3. Generate unique slug
    const productSlug = await generateUniqueSlug(
      slugify(req.body.title, { lower: true, strict: true })
    );

    // 4. Create product record
    const product = await Product.create({
      title: req.body.title,
      shop_id: req.body.shop_id,
      slug: productSlug,
      description: req.body.description || "",
      status: req.body.status || "active",
      category_id: req.body.category_id || null
    });

    // 5. Prepare items input (accepts array of items or fallback to single-item payload)
    // IMPORTANT: For multiple variants, client MUST send `req.body.items` as an array,
    // where each object in the array has its own sku, image/image_url, and attributes.
    // The fallback below is for single-item creation or if `items` is not an array.
    const itemsInput = Array.isArray(req.body.items)
      ? req.body.items
      : [{
          price: req.body.price,
          stock: req.body.stock,
          sale_price: req.body.sale_price,
          attributes: req.body.attributes,
          image: req.body.image,
          image_url: req.body.image_url,
          sku: req.body.sku
        }];

    // 6. Process each item: upload image if base64 provided, or use existing public_id
    const itemsData = await Promise.all(
      itemsInput.map(async item => {
        // 1. Xử lý upload hoặc lấy publicId
        let publicId = null;
        if (item.image) {
          const result = await uploadImage("items", item.image);
          publicId = result.public_id;
        } else if (item.image_url) {
          publicId = item.image_url;
        }
    
        // 2. Parse attributes thành object
        let processedAttributes = {};
        if (item.attributes) {
          try {
            processedAttributes = typeof item.attributes === "string"
              ? JSON.parse(item.attributes)
              : item.attributes;
          } catch (e) {
            processedAttributes = {};
          }
          if (!processedAttributes || typeof processedAttributes !== "object") {
            processedAttributes = {};
          }
        }
    
        // 3. Trả về object cho mỗi item
        return {
          product_id: product.product_id,
          sku:         item.sku || null,
          price:       item.price || 0,
          stock:       item.stock || 0,
          sale_price:  item.sale_price || null,
          attributes:  processedAttributes,
          image_url:   publicId
        };
      })
    );

    // 7. Insert all items in bulk
    const createdItems = await Item.bulkCreate(itemsData);

    // 8. Respond with created product and its items
    return res.status(201).send({
      success: true,
      message: "Sản phẩm và các biến thể (items) đã được tạo thành công!",
      product,
      items: createdItems
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    return res.status(500).send({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi tạo sản phẩm."
    });
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
      include: [{ model: Shop, attributes: ['shop_name', 'shop_id'] }] // join với Shop
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

// Lấy danh sách sản phẩm theo shop_id (có phân trang và tìm kiếm)
const getProductsByShop = async (req, res) => {
  const { page, size, title } = req.query; // Lấy tham số từ query string
  const shopId = req.params.shopId;
  const { limit, offset } = getPagination(page, size);

  try {
    // Kiểm tra shop có tồn tại không
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return res.status(404).send({
        success: false,
        message: `Không tìm thấy shop với id=${shopId}.`
      });
    }

    // Điều kiện tìm kiếm (shop_id và title nếu có)
    let condition = { shop_id: shopId };
    if (title) {
      condition.title = { [Op.iLike]: `%${title}%` };
    }

    const data = await Product.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]], // Sắp xếp theo mới nhất
      include: [
        {
          model: Shop,
          attributes: ['shop_name', 'shop_id', 'owner_id']
        }
      ]
    });

    const response = getPagingData(data, page, limit);
    response.shopInfo = {
      shop_id: shop.shop_id,
      shop_name: shop.shop_name
    };

    res.send({
      success: true,
      ...response
    });
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách sản phẩm của shop ${shopId}:`, error);
    res.status(500).send({
      success: false,
      message: error.message || `Đã xảy ra lỗi khi lấy danh sách sản phẩm của shop ${shopId}.`,
    });
  }
};

// Lấy chi tiết một sản phẩm theo ID
const getProductById = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Shop,
          attributes: ['shop_name', 'shop_id', 'owner_id']
        },
        {
          model: Item,
          attributes: ['item_id', 'price', 'stock', 'sale_price', 'image_url', 'attributes']
        }
      ]
    });

    if (product) {
      // Không cần xử lý đặc biệt cho image_url vì đã lưu public_id
      // Các public_id sẽ được frontend sử dụng để gọi API getImageByPublicId

      res.send({
        success: true,
        data: product
      });
    } else {
      res.status(404).send({
        success: false,
        message: `Không tìm thấy sản phẩm với id=${id}.`
      });
    }
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm id=${id}:`, error);
    res.status(500).send({
      success: false,
      message: `Lỗi khi lấy sản phẩm với id=${id}.`
    });
  }
};

// Cập nhật sản phẩm theo ID
const updateProduct = async (req, res) => {
  const id = req.params.id;

  try {
    // Tìm sản phẩm để cập nhật
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: `Không tìm thấy sản phẩm với id=${id}.`
      });
    }

    // Tạo slug mới nếu title thay đổi
    if (req.body.title) {
      req.body.slug = await generateUniqueSlug(
        slugify(req.body.title, { lower: true, strict: true })
      );
    }

    // Xử lý ảnh sản phẩm nếu có
    let publicId = null;
    if (req.body.image) {
      try {
        // Nếu image là base64 string
        const folder = "products";
        const result = await uploadImage(folder, req.body.image);
        publicId = result.public_id;
      } catch (imgError) {
        console.error("Lỗi khi upload ảnh:", imgError);
        // Không cập nhật image_url nếu có lỗi
      }
    }

    // Xóa trường image khỏi dữ liệu cập nhật (vì đã chuyển thành image_url)
    delete req.body.image;

    // Cập nhật sản phẩm
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      status: req.body.status,
      category_id: req.body.category_id,
      slug: req.body.slug
    };

    // Lọc bỏ các trường undefined
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const num = await Product.update(updateData, {
      where: { product_id: id },
    });

    if (num == 1) {
      // START --- New item handling logic for product updates
      if (Array.isArray(req.body.items)) {
        for (const itemData of req.body.items) {
          let itemSpecificPublicId = itemData.image_url || null; // Use existing image_url by default

          // Handle new image upload for the item if itemData.image (base64) is provided
          if (itemData.image) {
            try {
              const itemImgResult = await uploadImage("items", itemData.image);
              itemSpecificPublicId = itemImgResult.public_id;
            } catch (imgError) {
              console.error(`Error uploading image for item (SKU: ${itemData.sku || 'N/A'}, ID: ${itemData.item_id || 'New'}):`, imgError);
              // Optionally, decide whether to skip this item or proceed without updating the image
            }
          }

          // Process attributes for the item
          let processedAttributes = {};
          if (itemData.attributes) {
            try {
              processedAttributes = typeof itemData.attributes === 'string'
                ? JSON.parse(itemData.attributes)
                : itemData.attributes;
              if (typeof processedAttributes !== 'object' || processedAttributes === null) {
                // Ensure attributes is an object, default to empty if parsing fails or type is wrong
                processedAttributes = {};
              }
            } catch (e) {
              console.error(`Error parsing attributes for item (SKU: ${itemData.sku || 'N/A'}, ID: ${itemData.item_id || 'New'}):`, e);
              processedAttributes = {}; // Default to empty object on error
            }
          }

          // Prepare data for item update or creation
          const currentItemDataPayload = {
            price: itemData.price,
            stock: itemData.stock,
            sale_price: itemData.sale_price,
            attributes: processedAttributes,
            image_url: itemSpecificPublicId,
            sku: itemData.sku,
          };

          // Remove undefined fields from payload to avoid unintentional overwrites with null
          Object.keys(currentItemDataPayload).forEach(key =>
            currentItemDataPayload[key] === undefined && delete currentItemDataPayload[key]
          );


          if (itemData.item_id) { // Existing item: Update
            if (Object.keys(currentItemDataPayload).length > 0) { // Only update if there's data
              await Item.update(currentItemDataPayload, {
                where: { item_id: itemData.item_id, product_id: id } // Ensure item belongs to product
              });
            }
          } else if (itemData.sku) { // New item: Create (SKU is mandatory for new items)
            await Item.create({
              ...currentItemDataPayload,
              product_id: id, // Associate with the current product
            });
          } else {
            console.warn("Skipping item creation/update due to missing SKU for a new item or no data for an existing item:", itemData);
          }
        }
      }
      // END --- New item handling logic

      // Lấy lại sản phẩm đã cập nhật để trả về
      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: Shop, attributes: ['shop_name', 'shop_id'] },
          { model: Item }
        ]
      });

      res.send({
        success: true,
        message: "Sản phẩm đã được cập nhật thành công.",
        product: updatedProduct,
      });
    } else {
      res.status(404).send({
        success: false,
        message: `Không thể cập nhật sản phẩm với id=${id}. Có thể không tìm thấy sản phẩm hoặc req.body trống!`,
      });
    }
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm id=${id}:`, error);
    // Bắt lỗi UNIQUE constraint của slug
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({
        success: false,
        message: `Sản phẩm với tiêu đề mới đã tồn tại (slug bị trùng).`,
      });
    }
    res.status(500).send({
      success: false,
      message: `Lỗi khi cập nhật sản phẩm với id=${id}.`
    });
  }
};

// Xóa sản phẩm theo ID
const deleteProduct = async (req, res) => {
  const id = req.params.id;


  try {

    // Xóa sản phẩm
    const num = await Product.destroy({
      where: { product_id: id },
    });

    if (num == 1) {
      res.send({
        success: true,
        message: "Sản phẩm đã được xóa thành công!"
      });
    } else {
      res.status(404).send({
        success: false,
        message: `Không thể xóa sản phẩm với id=${id}. Có thể không tìm thấy sản phẩm!`,
      });
    }
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm id=${id}:`, error);
    res.status(500).send({
      success: false,
      message: `Không thể xóa sản phẩm với id=${id}.`
    });
  }
};

// --- ITEM CRUD ---

// Helper function kểm tra quyền owner
const checkProductOwnership = async (productId, userId) => {
  try {
    const product = await Product.findByPk(productId, {
      include: [{ model: Shop, attributes: ['owner_id', 'shop_id', 'shop_name'] }],
    });

    if (!product) {
      return { product: null, isOwner: false, error: "Sản phẩm không tồn tại." };
    }

    const isOwner = product.Shop && product.Shop.owner_id === userId;
    return { product, isOwner, error: null };
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền sở hữu sản phẩm:", error);
    return { product: null, isOwner: false, error: "Lỗi khi kiểm tra quyền sở hữu sản phẩm." };
  }
};

// Thêm item vào sản phẩm
const createItem = async (req, res) => {
  const productId = req.params.productId;


  try {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId, {
      include: [{ model: Shop, attributes: ['owner_id', 'shop_id', 'shop_name'] }]
    });

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại."
      });
    }


    // Xử lý ảnh nếu có
    let publicId = null;
    if (req.file) {
      try {
        const folder = req.body.folder || "items";
        const result = await uploadImage(folder, req.file.buffer);
        publicId = result.public_id;
      } catch (imgError) {
        console.error("Lỗi khi upload ảnh:", imgError);
        publicId = null;
      }
    } else if (req.body.image) {
      try {
        // Nếu image là base64 string
        const folder = "items";
        const result = await uploadImage(folder, req.body.image);
        publicId = result.public_id;
      } catch (imgError) {
        console.error("Lỗi khi upload ảnh:", imgError);
        publicId = null;
      }
    } else if (req.body.image_url) {
      // Nếu đã có public_id
      publicId = req.body.image_url;
    }

    // Validate dữ liệu
    const { price, stock, sale_price, attributes, sku } = req.body;

    if (!price || stock === undefined || stock === null) {
      return res.status(400).send({
        success: false,
        message: "Giá và số lượng tồn kho là bắt buộc."
      });
    }

    if (stock < 0) {
      return res.status(400).send({
        success: false,
        message: "Số lượng tồn kho không thể âm."
      });
    }

    if (sale_price && parseFloat(sale_price) >= parseFloat(price)) {
      return res.status(400).send({
        success: false,
        message: "Giá khuyến mãi phải nhỏ hơn giá gốc."
      });
    }

    // Validate SKU
    if (!sku) {
      return res.status(400).send({
        success: false,
        message: "SKU là bắt buộc cho mỗi biến thể sản phẩm."
      });
    }

    // Thuộc tính
    let parsedAttributes = {};
    if (attributes) {
      try {
        parsedAttributes = typeof attributes === 'string'
          ? JSON.parse(attributes)
          : attributes;

        if (typeof parsedAttributes !== 'object') {
          throw new Error('Attributes must be an object');
        }
      } catch (e) {
        return res.status(400).send({
          success: false,
          message: "Thuộc tính (attributes) phải là một đối tượng JSON hợp lệ."
        });
      }
    }

    // Tạo mặt hàng
    const newItemData = {
      product_id: productId,
      price: price,
      stock: stock,
      image_url: publicId, // Lưu public_id thay vì URL
      sale_price: sale_price || null,
      attributes: parsedAttributes,
      sku: sku
    };

    const newItem = await Item.create(newItemData);

    res.status(201).send({
      success: true,
      message: "Mặt hàng đã được thêm thành công!",
      data: newItem
    });
  } catch (error) {
    console.error("Lỗi khi thêm mặt hàng:", error);

    // Handle potential unique constraint error for SKU
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({
        success: false,
        message: `SKU đã tồn tại.`
      });
    }

    res.status(500).send({
      success: false,
      message: "Đã xảy ra lỗi khi thêm mặt hàng."
    });
  }
};

// Tìm sản phẩm theo mặt hàng
const getItemsByProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Shop,
          attributes: ['shop_name', 'shop_id']
        }
      ]
    });

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại."
      });
    }

    const items = await Item.findAll({
      where: { product_id: productId },
      order: [["created_at", "ASC"]],
    });

    // Không cần xử lý đặc biệt cho image_url vì đã lưu public_id
    // Các public_id sẽ được frontend sử dụng để gọi API getImageByPublicId

    res.send({
      success: true,
      data: {
        product: {
          product_id: product.product_id,
          title: product.title,
          shop_name: product.Shop.shop_name,
          shop_id: product.Shop.shop_id
        },
        items: items
      }
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mặt hàng:", error);
    res.status(500).send({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách mặt hàng."
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductsByShop,
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
