const { getPagination } = require("../controller/productController");
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
  Cart,
  sequelize,
} = db;

const { Op } = require("sequelize");

// HÀM TẠO ĐƠN HÀNG
const createOrder = async (req, res) => {
  // Giả định req.user được thiết lập bởi middleware xác thực
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Yêu cầu đăng nhập." });
  }
  const userId = req.user.user_id;
  const {
    shipping_address_id,
    shipping_method_id, // Có thể là null/undefined
    payment_method = "cod", // Mặc định là 'cod'
    note,
    items: orderItemsInput, // [{ item_id, quantity }]
    clear_cart = false, // Mặc định không xóa giỏ hàng
  } = req.body;

  // --- 1. Xác thực Input Cơ Bản ---
  if (!shipping_address_id)
    return res
      .status(400)
      .json({ message: "Vui lòng chọn địa chỉ giao hàng." });
  if (
    !orderItemsInput ||
    !Array.isArray(orderItemsInput) ||
    orderItemsInput.length === 0
  )
    return res.status(400).json({
      message: "Giỏ hàng trống hoặc định dạng mặt hàng không hợp lệ.",
    });
  for (const item of orderItemsInput) {
    if (
      !item.item_id ||
      !item.quantity ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0 ||
      !Number.isInteger(item.quantity)
    ) {
      return res.status(400).json({
        message: `Thông tin mặt hàng không hợp lệ (ID: ${item.item_id}, Số lượng: ${item.quantity}). Số lượng phải là số nguyên dương.`,
      });
    }
  }
  const validPaymentMethods = [
    "cod",
    "credit_card",
    "e_wallet",
    "bank_transfer",
  ]; // Lấy từ ENUM hoặc config
  if (!validPaymentMethods.includes(payment_method))
    return res
      .status(400)
      .json({ message: "Phương thức thanh toán không hợp lệ." });

  let transaction;
  try {
    // --- 2. Kiểm tra địa chỉ giao hàng ---
    const shippingAddress = await UserAddress.findOne({
      where: { address_id: shipping_address_id, user_id: userId },
    });
    // if (!shippingAddress)
    //   return res
    //     .status(403)
    //     .json({
    //       message: "Địa chỉ giao hàng không hợp lệ hoặc không thuộc về bạn.",
    //     });

    // --- 3. Bắt đầu Transaction ---
    transaction = await sequelize.transaction();

    // --- 4. Lấy thông tin chi tiết Items và Kiểm tra ---
    let fetchedItemsDetails = [];
    let totalSubtotal = 0;
    let shopId = null;
    const itemIds = orderItemsInput.map((i) => i.item_id);

    // Lấy items từ DB kèm Product và Shop, khóa để cập nhật stock
    const itemsFromDb = await Item.findAll({
      where: { item_id: { [Op.in]: itemIds } },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["product_id", "shop_id", "title"], // Chỉ lấy các trường cần thiết
          include: [{ model: Shop, as: "shop", attributes: ["shop_id"] }], // Chỉ lấy shop_id
        },
      ],
      lock: transaction.LOCK.UPDATE, // Khóa dòng để tránh race condition khi kiểm tra/trừ stock
      transaction,
    });

    const itemsMap = new Map(itemsFromDb.map((i) => [i.item_id, i]));

    for (const inputItem of orderItemsInput) {
      const dbItem = itemsMap.get(inputItem.item_id);

      // Kiểm tra Item tồn tại
      if (!dbItem) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Mặt hàng với ID ${inputItem.item_id} không tìm thấy.`,
        });
      }
      // Kiểm tra có Product và Shop liên kết không
      if (!dbItem.product?.shop?.shop_id) {
        await transaction.rollback();
        return res.status(500).json({
          message: `Lỗi xác định cửa hàng cho mặt hàng ID ${dbItem.item_id}. Vui lòng liên hệ hỗ trợ.`,
        });
      }
      const currentShopId = dbItem.product.shop.shop_id;

      // KIỂM TRA ĐẶT HÀNG TỪ MỘT SHOP DUY NHẤT
      if (shopId === null) {
        shopId = currentShopId; // Gán shop_id cho đơn hàng từ item đầu tiên
      } else if (shopId !== currentShopId) {
        await transaction.rollback();
        return res.status(400).json({
          message:
            "Hiện tại hệ thống chỉ hỗ trợ đặt hàng từ một cửa hàng duy nhất trong một lần thanh toán.",
        });
      }

      // Kiểm tra tồn kho
      if (dbItem.stock < inputItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Số lượng tồn kho không đủ cho sản phẩm '${dbItem.product.title}' (ID mặt hàng: ${dbItem.item_id}). Chỉ còn ${dbItem.stock}.`,
        });
      }

      // Tính giá item (ưu tiên giá sale) và cộng vào tổng phụ
      const itemPrice = parseFloat(dbItem.sale_price || dbItem.price);
      totalSubtotal += itemPrice * inputItem.quantity;

      // Lưu chi tiết để tạo OrderItem sau này
      fetchedItemsDetails.push({
        dbItem: dbItem, // Thông tin Item từ DB
        quantity: inputItem.quantity, // Số lượng đặt
        priceAtOrder: itemPrice, // Giá tại thời điểm đặt (có thể là sale_price hoặc price)
        productTitle: dbItem.product.title, // Tên sản phẩm (denormalize)
        product_id: dbItem.product_id, // ID sản phẩm
        item_attributes: dbItem.attributes, // Thuộc tính (denormalize)
        item_image_url: dbItem.image_url, // Ảnh mặt hàng (denormalize)
      });
    }
    // Nếu vòng lặp hoàn tất mà shopId vẫn null (trường hợp cực hiếm nếu item tồn tại mà ko có shop), báo lỗi
    if (shopId === null) {
      await transaction.rollback();
      return res
        .status(500)
        .json({ message: "Không thể xác định cửa hàng cho đơn hàng." });
    }

    // --- 5. Tính toán Phí Vận Chuyển ---
    let shippingFee = 0;
    let selectedShippingMethod = null; // Lưu lại thông tin shipping method nếu có
    if (shipping_method_id) {
      selectedShippingMethod = await ShippingMethod.findOne({
        where: { shipping_method_id: shipping_method_id, is_active: true },
        transaction,
      });
      if (selectedShippingMethod) {
        shippingFee = parseFloat(selectedShippingMethod.cost);
      } else {
        console.warn(
          `Không tìm thấy hoặc không hoạt động phương thức vận chuyển ID ${shipping_method_id}. Áp dụng phí mặc định.`
        );
        // Áp dụng logic mặc định nếu method không tìm thấy hoặc không active
        shippingFee = totalSubtotal > 500000 ? 0 : 30000; // Ví dụ logic mặc định
      }
    } else {
      // Logic phí mặc định nếu không chọn shipping_method_id
      shippingFee = totalSubtotal > 500000 ? 0 : 30000; // Ví dụ logic mặc định
      console.log(
        "Không có shipping_method_id, áp dụng phí mặc định:",
        shippingFee
      );
    }

    // --- 6. Tính toán Giảm Giá (Tạm thời = 0) ---
    const discountAmount = 0; // Có thể mở rộng voucher

    // --- 7. Tính Tổng Tiền Cuối Cùng ---
    const totalPrice = totalSubtotal + shippingFee - discountAmount;

    // --- 8. Tạo Bản Ghi Order Chính ---
    const orderCode = `ORD-${Date.now()}-${userId}`; // Tạo mã đơn hàng đơn giản
    const newOrder = await Order.create(
      {
        user_id: userId,
        shop_id: shopId, // Đã xác định ở bước 4
        order_code: orderCode,
        subtotal_price: totalSubtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total_price: totalPrice,
        note: note,
        status: "pending", // Trạng thái ban đầu khi mới tạo
      },
      { transaction }
    );

    // --- 9. Tạo OrderItems và Giảm Tồn Kho ---
    const orderItemCreationPromises = fetchedItemsDetails.map((detail) =>
      OrderItem.create(
        {
          order_id: newOrder.order_id,
          item_id: detail.dbItem.item_id,
          product_id: detail.product_id, // Lấy từ fetchedItemsDetails
          quantity: detail.quantity,
          price: detail.priceAtOrder, // Giá đã tính ở trên
          sale_price: detail.dbItem.sale_price, // Lưu lại giá sale nếu có
          item_name: detail.productTitle, // Denormalize tên SP
          item_image_url: detail.item_image_url, // Denormalize ảnh
          item_attributes: detail.item_attributes, // Denormalize thuộc tính
        },
        { transaction }
      )
    );
    const stockDecrementPromises = fetchedItemsDetails.map(
      (detail) =>
        Item.decrement(
          { stock: detail.quantity }, // Giảm đi số lượng đã đặt
          { where: { item_id: detail.dbItem.item_id }, transaction }
        )
      // Thêm kiểm tra sau decrement nếu cần (ví dụ: không cho stock < 0, dù logic trước đã chặn)
    );
    await Promise.all(orderItemCreationPromises);
    await Promise.all(stockDecrementPromises);

    // --- 10. Tạo Bản Ghi OrderShipping ---
    if (selectedShippingMethod) {
      // Chỉ tạo nếu có phương thức VC hợp lệ được chọn và tìm thấy
      await OrderShipping.create(
        {
          order_id: newOrder.order_id,
          shipping_method_id: selectedShippingMethod.shipping_method_id,
          shipping_address_id: shippingAddress.address_id, // Dùng ID địa chỉ đã xác thực
          shipping_cost: shippingFee, // Lưu lại phí VC đã tính
          status: "pending", // Trạng thái VC ban đầu
          // tracking_number, shipped_at, delivered_at ban đầu là null
        },
        { transaction }
      );
    } else {
      // Optional: Có thể bạn muốn lưu 1 record OrderShipping với thông tin mặc định
      // hoặc bỏ qua nếu không có method cụ thể được chọn.
      console.log(
        `Order ${newOrder.order_id}: Không tạo OrderShipping vì không có shipping_method_id hợp lệ.`
      );
      // Nếu vẫn muốn lưu địa chỉ và phí mặc định:
      await OrderShipping.create(
        {
          order_id: newOrder.order_id,
          shipping_method_id: null, // Hoặc tạo 1 method 'default'
          shipping_address_id: shippingAddress.address_id,
          shipping_cost: shippingFee,
          status: "pending",
          notes: "Phí vận chuyển mặc định đã được áp dụng.", // Thêm ghi chú nếu cần
        },
        { transaction }
      );
    }

    // --- 11. Tạo Bản Ghi Payment ---
    // Thanh toán COD thì pending, các loại khác cũng có thể bắt đầu là pending chờ xác nhận
    const initialPaymentStatus =
      payment_method === "cod" ? "pending" : "pending"; // Hoặc 'unpaid' tùy logic
    await Payment.create(
      {
        order_id: newOrder.order_id,
        user_id: userId,
        amount: totalPrice, // Số tiền cần thanh toán
        payment_method: payment_method, // Phương thức đã chọn
        status: initialPaymentStatus,
        // transaction_id, gateway_response, paid_at ban đầu là null
      },
      { transaction }
    );

    // --- 12. Commit Giao Dịch Chính ---
    await transaction.commit(); // Kết thúc transaction thành công

    // --- 13. Xóa Giỏ Hàng ---
    let cartClearedCount = 0;
    if (clear_cart === true) {
      // Chạy tác vụ này không nằm trong transaction chính
      // để nếu xóa cart lỗi, đơn hàng vẫn thành công.
      try {
        cartClearedCount = await Cart.destroy({
          where: {
            user_id: userId,
            item_id: { [Op.in]: itemIds }, // Xóa các item ID có trong đơn hàng
          },
        });
        console.log(
          `Đã xóa ${cartClearedCount} mặt hàng khỏi giỏ hàng của người dùng ${userId}.`
        );
      } catch (cartError) {
        // Chỉ log lỗi, không làm ảnh hưởng đến response thành công của đơn hàng
        console.error("Lỗi khi xóa giỏ hàng sau khi tạo đơn hàng:", cartError);
      }
    }

    // --- 14. Lấy Thông Tin Chi Tiết Đơn Hàng Vừa Tạo để Trả Về ---
    const createdOrderDetails = await Order.findByPk(newOrder.order_id, {
      include: [
        { model: User, as: "user", attributes: ["user_id", "username"] }, // Lấy thông tin cơ bản người mua
        { model: Shop, as: "shop", attributes: ["shop_id", "shop_name"] }, // Lấy thông tin cơ bản cửa hàng
        { model: OrderItem, as: "orderItems" }, // Chi tiết các mặt hàng trong đơn
        {
          model: OrderShipping,
          as: "orderShipping",
          include: [
            { model: UserAddress, as: "shippingAddress" }, // Chi tiết địa chỉ giao hàng
            { model: ShippingMethod, as: "shippingMethod" }, // Chi tiết phương thức vận chuyển
          ],
        },
        { model: Payment, as: "payments" }, // Thông tin thanh toán
      ],
    });

    if (!createdOrderDetails) {
      // Commit thành công nhưng không find được ngay
      console.error(
        `Không tìm thấy đơn hàng ${newOrder.order_id} sau khi tạo.`
      );
      // Trả về thông tin cơ bản nếu không lấy được chi tiết
      return res.status(201).json({
        order_id: newOrder.order_id,
        order_code: newOrder.order_code,
        message: "Đơn hàng đã được tạo thành công.",
        cartClearedCount: cartClearedCount,
      });
    }

    // --- 15. Phản Hồi Thành Công ---
    res.status(201).json({
      message: "Đơn hàng đã được tạo thành công.",
      order: createdOrderDetails.get({ plain: true }), // Dữ liệu chi tiết đơn hàng
      cartClearedCount: cartClearedCount, // Số lượng item đã xóa khỏi cart
    });
  } catch (error) {
    // --- Xử Lý Lỗi và Rollback ---
    if (transaction) await transaction.rollback(); // Rollback nếu có lỗi xảy ra
    console.error("Lỗi khi tạo đơn hàng:", error);
    // Phân loại lỗi để trả về message rõ ràng hơn nếu cần
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message:
          "Thông tin liên kết không hợp lệ (ví dụ: shop_id, user_id không tồn tại).",
      });
    }
    res.status(500).json({
      message:
        error.message ||
        "Đã xảy ra lỗi máy chủ khi tạo đơn hàng. Vui lòng thử lại.",
    });
  }
};

// Hàm helper tạo dữ liệu phân trang cho response
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: products } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, products, totalPages, currentPage };
};

// GET /api/orders/my-order - Lấy đơn hàng của người dùng hiện tại (phân trang)
const getUserOrders = async (req, res) => {
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
      distinct: true,
    });

    const response = getPagingData(data, page, limit);
    res.send(response);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng người dùng:", error);
    res.status(500).send({ message: "Đã xảy ra lỗi khi lấy đơn hàng." });
  }
};

// GET /api/orders/:orderId - Lấy chi tiết một đơn hàng
const getOrderDetails = async (req, res) => {
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

    // --- Authorization ---
    // 1. Người dùng là chủ sở hữu của orderorder
    const isOrderOwner = order.user_id === userId;
    // 2. Hoặc là admin
    const isAdmin = userRole === "admin";
    // 3. Hoặc là shop nhận order
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
const updateOrderStatus = async (req, res) => {
  const userId = req.user.user_id;
  const userRole = req.user.role;
  const orderId = req.params.orderId;
  const { status: newStatus, tracking_number } = req.body; // Allow updating tracking number when shipping

  // --- Xác thực ---
  if (!newStatus) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp trạng thái mới." });
  }

  const validStatuses = Order.getAttributes().status.values;
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
      return res.status(403).send({
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
      return res.status(400).send({
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
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
};
