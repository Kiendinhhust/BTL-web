const db = require("../models");

const {
  User,
  Order,
  OrderItem,
  Item,
  Product,
  Shop,
  UserAddress,
  OrderShipping,
  Payment,
  ShippingMethod,
  sequelize,
  Cart,
} = db;
const { Op } = require("sequelize");

// TẠO ĐƠN HÀNG
const createOrder = async (req, res) => {
  const userId = req.user.user_id;
  const {
    shipping_address_id,
    shipping_method_id,
    payment_method = "cod",
    note,
    items: orderItemsInput, // [{ item_id, quantity }]
    clear_cart = false,
  } = req.body;

  // Xác thực thông tin
  if (!shipping_address_id)
    return res
      .status(400)
      .json({ message: "Vui lòng chọn địa chỉ giao hàng." });
  if (
    !orderItemsInput ||
    !Array.isArray(orderItemsInput) ||
    orderItemsInput.length === 0
  )
    return res
      .status(400)
      .json({
        message: "Giỏ hàng trống hoặc định dạng mặt hàng không hợp lệ.",
      });
  for (const item of orderItemsInput)
    if (!item.item_id || !item.quantity || item.quantity <= 0)
      return res
        .status(400)
        .json({ message: "Thông tin mặt hàng không hợp lệ." });
  const validPaymentMethods = [
    "cod",
    "credit_card",
    "e_wallet",
    "bank_transfer",
  ];
  if (!validPaymentMethods.includes(payment_method))
    return res
      .status(400)
      .json({ message: "Phương thức thanh toán không hợp lệ." });

  let transaction;
  try {
    // Kiểm tra địa chỉ giao hàng ( có thuộc chủ sở hữu không )
    const shippingAddress = await UserAddress.findOne({
      where: { address_id: shipping_address_id, user_id: userId },
    });
    if (!shippingAddress)
      return res
        .status(403)
        .json({
          message: "Địa chỉ giao hàng không hợp lệ hoặc không thuộc về bạn.",
        });

    transaction = await sequelize.transaction();

    // ---  ---
    let fetchedItemsDetails = [];
    let totalSubtotal = 0;
    let shopId = null;
    const itemIds = orderItemsInput.map((i) => i.item_id);
    const itemsFromDb = await Item.findAll({
      where: { item_id: { [Op.in]: itemIds } },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["product_id", "shop_id", "title"],
          include: [{ model: Shop, as: "shop", attributes: ["shop_id"] }],
        },
      ],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    const itemsMap = new Map(itemsFromDb.map((i) => [i.item_id, i]));
    for (const inputItem of orderItemsInput) {
      const dbItem = itemsMap.get(inputItem.item_id);
      if (!dbItem) {
        await transaction.rollback();
        return res
          .status(404)
          .json({
            message: `Mặt hàng với ID ${inputItem.item_id} không tìm thấy.`,
          });
      }
      if (!dbItem.product?.shop?.shop_id) {
        await transaction.rollback();
        return res
          .status(500)
          .json({
            message: `Lỗi xác định shop cho mặt hàng ${dbItem.item_id}.`,
          });
      }
      const currentShopId = dbItem.product.shop.shop_id;
      if (shopId === null) shopId = currentShopId;
      else if (shopId !== currentShopId) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Chỉ hỗ trợ đặt hàng từ một cửa hàng." });
      }
      if (dbItem.stock < inputItem.quantity) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            message: `Không đủ tồn kho cho ${dbItem.product.title} (ID: ${dbItem.item_id}). Còn ${dbItem.stock}.`,
          });
      }
      const itemPrice = dbItem.sale_price || dbItem.price;
      totalSubtotal += parseFloat(itemPrice) * inputItem.quantity;
      fetchedItemsDetails.push({
        dbItem,
        quantity: inputItem.quantity,
        priceAtOrder: itemPrice,
        productTitle: dbItem.product.title,
        product_id: dbItem.product.product_id,
        item_attributes: dbItem.attributes,
        item_image_url: dbItem.image_url,
      });
    }

    let shippingFee = 0;
    if (shipping_method_id) {
      /* ... fetch method cost ... */
      const method = await ShippingMethod.findByPk(shipping_method_id, {
        transaction,
      });
      if (method) shippingFee = parseFloat(method.cost);
      else console.warn(`Shipping method ID ${shipping_method_id} not found.`);
    } else shippingFee = totalSubtotal > 500000 ? 0 : 30000;
    const discountAmount = 0; // Placeholder
    const totalPrice = totalSubtotal + shippingFee - discountAmount;

    // --- Create Order (keep as before) ---
    const newOrder = await Order.create(
      {
        /* ... */
      },
      { transaction }
    );

    // --- Create OrderItems & Decrement Stock (keep as before) ---
    const orderItemPromises = fetchedItemsDetails.map((detail) =>
      OrderItem.create(
        {
          /*...*/
        },
        { transaction }
      )
    );
    const stockDecrementPromises = fetchedItemsDetails.map((detail) =>
      Item.decrement(
        { stock: detail.quantity },
        { where: { item_id: detail.dbItem.item_id }, transaction }
      )
    );
    await Promise.all(orderItemPromises);
    await Promise.all(stockDecrementPromises);

    // --- Create OrderShipping (keep as before) ---
    if (shipping_method_id)
      await OrderShipping.create(
        {
          /*...*/
        },
        { transaction }
      );

    // --- Create Payment (keep as before) ---
    const initialPaymentStatus =
      payment_method === "cod" ? "pending" : "pending";
    await Payment.create(
      {
        /*...*/
      },
      { transaction }
    );

    // --- TODO: Xóa giỏ hàng nếu cần (Thực hiện) ---
    let cartClearedCount = 0;
    if (clear_cart === true) {
      // Xóa các item trong đơn hàng này khỏi giỏ hàng của người dùng
      // KHÔNG nằm trong transaction chính, vì nếu rollback, giỏ hàng nên giữ nguyên
      // Bỏ qua lỗi nếu xóa cart thất bại (ưu tiên đơn hàng)
      try {
        // Ensure Cart model is defined and associated
        if (db.Cart) {
          cartClearedCount = await Cart.destroy({
            where: {
              user_id: userId,
              item_id: { [Op.in]: itemIds },
            },
          });
          console.log(
            `Cleared ${cartClearedCount} items from cart for user ${userId}`
          );
        } else {
          console.warn("Cart model not found, skipping cart clearing.");
        }
      } catch (cartError) {
        console.error("Error clearing cart:", cartError); // Log error but proceed
      }
    }

    // --- 11. Xác nhận giao dịch ---
    await transaction.commit();

    // --- 12. Phản hồi ---
    const createdOrderDetails = await Order.findByPk(newOrder.order_id, {
      include: [
        /*...*/
      ],
    }); // Keep includes
    res
      .status(201)
      .json({ ...createdOrderDetails.get({ plain: true }), cartClearedCount }); // Thêm thông tin đã xóa cart
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Lỗi khi tạo đơn hàng:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi máy chủ khi tạo đơn hàng." });
  }
};

// GET /api/orders/my - Lấy đơn hàng của người dùng hiện tại (phân trang)
exports.getUserOrders = async (req, res) => {
  const userId = req.user.user_id;
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  try {
    const data = await Order.findAndCountAll({
      where: { user_id: userId },
      include: [
        // Include basic info, avoid too many details for list view
        {
          model: Shop,
          as: "shop",
          attributes: ["shop_id", "shop_name", "logo_url"],
        },
        // Maybe include just the count of items or first item image?
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
            "order_item_id",
            "item_name",
            "item_image_url",
            "quantity",
          ], // Select fewer fields
          limit: 1, // Example: only show first item's info in the list
        },
      ],
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true, // Required when using limit with include hasMany
    });

    const response = getPagingData(data, page, limit);
    res.send(response);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng người dùng:", error);
    res.status(500).send({ message: "Đã xảy ra lỗi khi lấy đơn hàng." });
  }
};

// GET /api/orders/:orderId - Lấy chi tiết một đơn hàng
exports.getOrderDetails = async (req, res) => {
  const userId = req.user.user_id;
  const userRole = req.user.role;
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: "user", attributes: ["user_id", "username"] }, // Limited user info
        { model: Shop, as: "shop" }, // Include full shop details
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            // Include Item details if needed, but orderItem should store necessary info
            { model: Item, as: "item", attributes: ["item_id", "sku"] },
          ],
        },
        {
          model: OrderShipping,
          as: "shippingInfo",
          include: [
            { model: UserAddress, as: "address" }, // Ensure 'as' is set correctly in OrderShipping model association
            { model: ShippingMethod, as: "shippingMethod" }, // Ensure 'as' is set
          ],
        },
        { model: Payment, as: "payments" },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .send({ message: `Không tìm thấy đơn hàng với ID=${orderId}.` });
    }

    // --- Authorization Check ---
    // 1. Is the logged-in user the owner of the order?
    const isOrderOwner = order.user_id === userId;
    // 2. Is the logged-in user an admin?
    const isAdmin = userRole === "admin";
    // 3. Is the logged-in user the seller of this order's shop?
    const isSellerOfOrder =
      userRole === "seller" && order.shop?.owner_id === userId; // Check if shop info is included

    if (!isOrderOwner && !isAdmin && !isSellerOfOrder) {
      return res
        .status(403)
        .send({ message: "Bạn không có quyền xem chi tiết đơn hàng này." });
    }

    res.send(order);
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderId}:`, error);
    res
      .status(500)
      .send({ message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng." });
  }
};

// PUT /api/orders/:orderId/status - Cập nhật trạng thái đơn hàng (Admin/Seller)
exports.updateOrderStatus = async (req, res) => {
  const userId = req.user.user_id;
  const userRole = req.user.role;
  const orderId = req.params.orderId;
  const { status: newStatus, tracking_number } = req.body; // Allow updating tracking number when shipping

  // --- Validation ---
  if (!newStatus) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp trạng thái mới." });
  }
  // Validate against the ENUM values defined in your Order model/DB
  const validStatuses = Order.getAttributes().status.values; // Get ENUM values from model
  if (!validStatuses || !validStatuses.includes(newStatus)) {
    return res
      .status(400)
      .json({ message: `Trạng thái '${newStatus}' không hợp lệ.` });
  }
  if (newStatus === "shipped" && !tracking_number) {
    // Technically could allow shipping without tracking, but often required
    // return res.status(400).json({ message: "Vui lòng cung cấp mã vận đơn khi chuyển trạng thái sang 'Đã giao'." });
    console.warn(`Order ${orderId} marked as shipped without tracking number.`);
  }

  const transaction = await sequelize.transaction();
  try {
    // --- Find Order and Check Authorization ---
    const order = await Order.findByPk(orderId, {
      include: [{ model: Shop, as: "shop", attributes: ["owner_id"] }], // Need shop owner for seller check
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res
        .status(404)
        .send({ message: `Không tìm thấy đơn hàng với ID=${orderId}.` });
    }

    const isAdmin = userRole === "admin";
    const isSellerOfOrder =
      userRole === "seller" && order.shop?.owner_id === userId;

    if (!isAdmin && !isSellerOfOrder) {
      await transaction.rollback();
      return res
        .status(403)
        .send({
          message: "Bạn không có quyền cập nhật trạng thái đơn hàng này.",
        });
    }

    const currentStatus = order.status;

    // --- State Transition Logic (Example) ---
    // Define allowed transitions
    const allowedTransitions = {
      pending: ["processing", "canceled"],
      processing: ["shipped", "canceled"],
      shipped: ["delivered", "canceled"], // Maybe 'failed_delivery'?
      delivered: [], // Final state
      canceled: [], // Final state
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      await transaction.rollback();
      return res
        .status(400)
        .send({
          message: `Không thể chuyển trạng thái từ '${currentStatus}' sang '${newStatus}'.`,
        });
    }

    // --- Update Order Status ---
    await order.update({ status: newStatus }, { transaction });

    // --- Update OrderShipping status and tracking (if applicable) ---
    let orderShipping = null;
    if (
      newStatus === "shipped" ||
      newStatus === "delivered" ||
      newStatus === "canceled"
    ) {
      orderShipping = await OrderShipping.findOne({
        where: { order_id: orderId },
        transaction,
      });
      if (orderShipping) {
        let shippingUpdateData = { status: newStatus }; // Map order status to shipping status directly for simplicity here
        if (newStatus === "shipped" && tracking_number) {
          shippingUpdateData.tracking_number = tracking_number;
          shippingUpdateData.shipped_at = new Date();
        }
        if (newStatus === "delivered") {
          shippingUpdateData.delivered_at = new Date();
        }
        await orderShipping.update(shippingUpdateData, { transaction });
      } else if (newStatus !== "canceled") {
        // Don't warn if canceling an order without shipping info
        console.warn(
          `OrderShipping record not found for order ${orderId} when updating status to ${newStatus}.`
        );
      }
    }

    // --- TODO: Trigger Notifications (Email, SMS) ---
    // Example: sendEmailNotification(order.user_id, `Order ${order.order_code} status updated to ${newStatus}`);

    await transaction.commit();

    // Return the updated order details
    const updatedOrderDetails = await Order.findByPk(orderId, {
      include: [
        { model: Shop, as: "shop" },
        { model: OrderItem, as: "orderItems" },
        { model: OrderShipping, as: "shippingInfo" },
        { model: Payment, as: "payments" },
      ],
    });

    res.send(updatedOrderDetails);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, error);
    res
      .status(500)
      .send({ message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng." });
  }
};

module.exports = {
  createOrder,
};
