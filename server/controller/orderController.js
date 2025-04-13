const db = require("../models");

const {
  User, Order, OrderItem, Item, Product, Shop, UserAddress,
  OrderShipping, Payment, ShippingMethod, sequelize
} = db;
const { Op } = db.Sequelize;

// --- TẠO ĐƠN HÀNG ---
const createOrder = async (req, res) => {
  const userId = req.user.user_id; // Lấy ID người dùng từ middleware xác thực

  // --- 1. Kiểm tra dữ liệu đầu vào ---
  const {
    shipping_address_id,         // ID địa chỉ giao hàng
    shipping_method_id,          // ID phương thức vận chuyển (tùy chọn)
    payment_method = 'cod',      // Mặc định là thanh toán khi nhận hàng (COD)
    note,                        // Ghi chú đơn hàng
    items: orderItemsInput       // Danh sách mặt hàng [{ item_id, quantity }]
  } = req.body;

  // Kiểm tra địa chỉ giao hàng
  if (!shipping_address_id) {
    return res.status(400).json({ message: "Vui lòng chọn địa chỉ giao hàng." });
  }

  // Kiểm tra danh sách sản phẩm
  if (!orderItemsInput || !Array.isArray(orderItemsInput) || orderItemsInput.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống hoặc định dạng mặt hàng không hợp lệ." });
  }

  // Kiểm tra từng sản phẩm trong giỏ
  for (const item of orderItemsInput) {
    if (!item.item_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ message: "Thông tin mặt hàng không hợp lệ (thiếu id hoặc số lượng không hợp lệ)." });
    }
  }

  // Kiểm tra phương thức thanh toán có hợp lệ không
  const validPaymentMethods = ['cod', 'credit_card', 'e_wallet', 'bank_transfer'];
  if (!validPaymentMethods.includes(payment_method)) {
    return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
  }

  let transaction;

  try {
    // --- 2. Kiểm tra địa chỉ giao hàng có hợp lệ và thuộc người dùng không ---
    const shippingAddress = await UserAddress.findOne({
      where: { address_id: shipping_address_id, user_id: userId }
    });

    if (!shippingAddress) {
      return res.status(403).json({ message: "Địa chỉ giao hàng không hợp lệ hoặc không thuộc về bạn." });
    }

    // --- 3. Bắt đầu giao dịch cơ sở dữ liệu ---
    transaction = await sequelize.transaction();

    // --- 4. Lấy thông tin mặt hàng, kiểm tra tồn kho, gom nhóm theo cửa hàng ---
    let fetchedItemsDetails = [];
    let totalSubtotal = 0;
    let shopId = null;
    const itemIds = orderItemsInput.map(i => i.item_id);

    const itemsFromDb = await Item.findAll({
      where: { item_id: { [Op.in]: itemIds } },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['product_id', 'shop_id', 'title'],
        include: [{ model: Shop, as: 'shop', attributes: ['shop_id'] }]
      }],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    const itemsMap = new Map(itemsFromDb.map(i => [i.item_id, i]));

    for (const inputItem of orderItemsInput) {
      const dbItem = itemsMap.get(inputItem.item_id);

      if (!dbItem) {
        await transaction.rollback();
        return res.status(404).json({ message: `Mặt hàng với ID ${inputItem.item_id} không tìm thấy.` });
      }

      if (!dbItem.product || !dbItem.product.shop || !dbItem.product.shop.shop_id) {
        await transaction.rollback();
        return res.status(500).json({ message: `Không thể xác định cửa hàng cho mặt hàng ID ${dbItem.item_id}.` });
      }

      const currentShopId = dbItem.product.shop.shop_id;
      if (shopId === null) {
        shopId = currentShopId;
      } else if (shopId !== currentShopId) {
        await transaction.rollback();
        return res.status(400).json({ message: "Chỉ hỗ trợ đặt hàng từ một cửa hàng duy nhất trong một lần." });
      }

      // Kiểm tra tồn kho
      if (dbItem.stock < inputItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Không đủ số lượng tồn kho cho mặt hàng ${dbItem.product.title} (ID: ${dbItem.item_id}). Chỉ còn ${dbItem.stock}.`
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
        item_image_url: dbItem.image_url
      });
    }

    // --- 5. Tính phí vận chuyển và tổng tiền ---
    let shippingFee = 0;
    if (shipping_method_id) {
      const method = await ShippingMethod.findByPk(shipping_method_id, { transaction });
      if (method) {
        shippingFee = parseFloat(method.cost);
      } else {
        console.warn(`Shipping method ID ${shipping_method_id} not found.`);
      }
    } else {
      shippingFee = totalSubtotal > 500000 ? 0 : 30000; // VD: miễn phí vận chuyển nếu >= 500k
    }

    const discountAmount = 0; // TODO: Thêm logic khuyến mãi sau
    const totalPrice = totalSubtotal + shippingFee - discountAmount;

    // --- 6. Tạo bản ghi đơn hàng ---
    const newOrder = await Order.create({
      user_id: userId,
      shop_id: shopId,
      subtotal_price: totalSubtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_price: totalPrice,
      note,
      status: 'pending'
    }, { transaction });

    // --- 7. Tạo OrderItem và giảm tồn kho ---
    const orderItemPromises = [];
    const stockDecrementPromises = [];

    for (const detail of fetchedItemsDetails) {
      const { dbItem, quantity, priceAtOrder, product_id, productTitle, item_attributes, item_image_url } = detail;

      orderItemPromises.push(
        OrderItem.create({
          order_id: newOrder.order_id,
          item_id: dbItem.item_id,
          product_id,
          quantity,
          price: priceAtOrder,
          item_name: `${productTitle}${item_attributes ? ' (' + Object.values(item_attributes).join(', ') + ')' : ''}`,
          item_image_url,
          item_attributes
        }, { transaction })
      );

      stockDecrementPromises.push(
        Item.decrement(
          { stock: quantity },
          { where: { item_id: dbItem.item_id }, transaction }
        )
      );
    }

    await Promise.all(orderItemPromises);
    await Promise.all(stockDecrementPromises);

    // --- 8. Tạo bản ghi thông tin vận chuyển nếu có ---
    if (shipping_method_id) {
      await OrderShipping.create({
        order_id: newOrder.order_id,
        shipping_method_id,
        shipping_address_id,
        shipping_cost: shippingFee,
        status: 'pending'
      }, { transaction });
    }

    // --- 9. Tạo bản ghi thanh toán ---
    const initialPaymentStatus = (payment_method === 'cod') ? 'pending' : 'pending'; // Có thể thay đổi sau
    await Payment.create({
      order_id: newOrder.order_id,
      user_id: userId,
      amount: totalPrice,
      payment_method,
      status: initialPaymentStatus
    }, { transaction });

    // --- 10. Xóa giỏ hàng ---

    // --- 11. Xác nhận giao dịch ---
    await transaction.commit();

    // --- 12. Phản hồi về đơn hàng vừa tạo ---
    const createdOrderDetails = await Order.findByPk(newOrder.order_id, {
      include: [
        { model: OrderItem, as: 'orderItems', include: [{ model: Item, as: 'item' }] },
        { model: OrderShipping, as: 'shippingInfo', include: [{ model: UserAddress, as: 'address' }] },
        { model: Payment, as: 'payments' }
      ]
    });

    res.status(201).json(createdOrderDetails);

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi máy chủ khi tạo đơn hàng." });
  }
};

module.exports = {
    createOrder
}