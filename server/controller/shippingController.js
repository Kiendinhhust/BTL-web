const db = require("../models");
// Đảm bảo tất cả các model cần thiết được import từ db object mà sequelize đã khởi tạo và associate
const { Order, OrderShipping, Shop, User, UserAddress, ShippingMethod, sequelize } = db;
const { Op } = require('sequelize');

// --- Helper Function: Check Access to Order for Shipping ---
const checkShippingAccess = async (orderId, userId, userRole) => {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Shop, as: 'shop', attributes: ['owner_id', 'shop_name'] }, // Cần owner_id của shop, thêm shop_name cho debug
            {
                model: OrderShipping,
                as: 'orderShipping', // <--- KHỚP ALIAS: Order.hasOne(OrderShipping, { as: "orderShipping" })
                include: [
                    {
                        model: User,
                        as: 'shipper', // <--- KHỚP ALIAS: OrderShipping.belongsTo(User, { as: "shipper" })
                        attributes: ['user_id', 'username']
                    }
                ],
                required: false // LEFT JOIN vì có thể chưa có OrderShipping hoặc chưa gán shipper
            }
        ]
    });

    if (!order) {
        return { authorized: false, message: 'Đơn hàng không tồn tại.', order: null };
    }

    const isOrderSeller = userRole === 'seller' && order.shop && order.shop.owner_id === userId;
    const isAdmin = userRole === 'admin';
    // Kiểm tra shipper được gán qua order.orderShipping (vì orderShipping là LEFT JOIN)
    const isAssignedShipper = userRole === 'shipper' && order.orderShipping && order.orderShipping.shipper_id === userId;

    if (isAdmin || isOrderSeller || isAssignedShipper) {
        return { authorized: true, order };
    }

    return { authorized: false, message: 'Bạn không có quyền thực hiện thao tác vận chuyển cho đơn hàng này.', order };
};

// API: Gán Shipper cho Đơn Hàng (Admin/Seller)
const assignShipperToOrder = async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const { shipper_id } = req.body;
    const currentUserId = req.user.user_id;
    const currentUserRole = req.user.role;

    if (!shipper_id) {
        return res.status(400).json({ message: 'Vui lòng cung cấp ID của shipper.' });
    }

    const transaction = await sequelize.transaction();
    try {
        // Kiểm tra quyền: Chỉ seller của shop hoặc admin mới được gán
        const orderForAccessCheck = await Order.findByPk(orderId, {
             include: [{ model: Shop, as: 'shop', attributes: ['owner_id'] }],
             transaction
        });
        if (!orderForAccessCheck) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
        }
        const isOrderSeller = currentUserRole === 'seller' && orderForAccessCheck.shop && orderForAccessCheck.shop.owner_id === currentUserId;
        const isAdmin = currentUserRole === 'admin';
        const isShipper = currentUserRole === 'shipper'
        if (!isAdmin && !isOrderSeller && !isShipper) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Bạn không có quyền gán shipper cho đơn hàng này.' });
        }
        const order = orderForAccessCheck; // Đã lấy được order

        const shipperUser = await User.findOne({ where: { user_id: shipper_id, role: 'shipper' }, transaction });
        if (!shipperUser) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shipper không tồn tại hoặc không có vai trò hợp lệ.' });
        }

        if (!['processing', 'ready_to_ship'].includes(order.status)) {
            await transaction.rollback();
            return res.status(400).json({ message: `Không thể gán shipper cho đơn hàng ở trạng thái '${order.status}'.` });
        }

        let orderShipping = await OrderShipping.findOne({ where: { order_id: orderId }, transaction });
        if (!orderShipping) {
            // Nếu order_shipping chưa có, cần logic để tạo (yêu cầu shipping_method_id, shipping_address_id từ order)
            // Hoặc đảm bảo OrderShipping luôn được tạo khi Order được tạo.
            // Hiện tại, nếu chưa có thì báo lỗi.
            const orderDetails = await Order.findByPk(orderId, {
                attributes: ['shipping_method_id', 'shipping_address_id'], // Giả sử order lưu các ID này, hoặc cần tìm từ nơi khác
                transaction
            });
            // Ví dụ này đơn giản, thực tế bạn cần logic để lấy shipping_method_id và shipping_address_id
            // để tạo OrderShipping record mới nếu nó chưa tồn tại.
            // Nếu không, tạm thời báo lỗi
            if (!order.default_shipping_method_id || !order.default_shipping_address_id){ // ví dụ: trường này lưu trong order
                 await transaction.rollback();
                 return res.status(400).json({message: "Thiếu thông tin phương thức hoặc địa chỉ vận chuyển để tạo bản ghi vận chuyển."})
            }
             orderShipping = await OrderShipping.create({
                 order_id: orderId,
                 shipper_id: shipper_id,
                 shipping_method_id: order.default_shipping_method_id, // Cần logic này
                 shipping_address_id: order.default_shipping_address_id, // Cần logic này
                 status: 'assigned', // Trạng thái khi mới gán shipper
                 // shipping_cost nếu có
             }, { transaction });
            console.log(`Tạo mới OrderShipping cho order ${orderId} khi gán shipper.`);

        } else {
            await orderShipping.update({
                shipper_id: shipper_id,
                status: 'assigned'
            }, { transaction });
        }


        // Không bắt buộc cập nhật trạng thái Order chính ở đây, có thể để là 'processing' hoặc 'ready_to_ship'
        // tùy thuộc vào quy trình của bạn.

        await transaction.commit();
        const updatedOrderShipping = await OrderShipping.findOne({
            where: { order_id: orderId },
            include: [{model: User, as: 'shipper', attributes: ['user_id', 'username', 'firstname', 'lastname']}]
        })
        res.status(200).json({ message: `Shipper ${shipperUser.username} đã được gán cho đơn hàng ${order.order_code}.`, orderShipping: updatedOrderShipping });

    } catch (error) {
        if (transaction && !transaction.finished) await transaction.rollback();
        console.error(`Lỗi khi gán shipper cho đơn hàng ${orderId}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ khi gán shipper.' });
    }
};

// API: Shipper/Admin/Seller cập nhật trạng thái vận chuyển
const updateShipmentStatusByShipper = async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const { status: newShippingStatus, tracking_number, notes } = req.body;
    const currentUserId = req.user.user_id;
    const currentUserRole = req.user.role;

    if (!newShippingStatus) {
        return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái vận chuyển mới.' });
    }
    const validShippingStatuses = OrderShipping.getAttributes().status.values;
    if (!validShippingStatuses || !validShippingStatuses.includes(newShippingStatus)) {
        return res.status(400).json({ message: `Trạng thái vận chuyển '${newShippingStatus}' không hợp lệ.` });
    }

    const transaction = await sequelize.transaction();
    try {
        const accessCheck = await checkShippingAccess(orderId, currentUserId, currentUserRole);
        if (!accessCheck.authorized) {
            await transaction.rollback();
            return res.status(accessCheck.order ? 403 : 404).json({ message: accessCheck.message });
        }
        const { order } = accessCheck; // Order chính

        let orderShipping = order.orderShipping; // Lấy từ accessCheck nếu đã include đúng
        if (!orderShipping) { // Nếu accessCheck không include orderShipping hoặc orderShipping chưa được tạo
            orderShipping = await OrderShipping.findOne({ where: { order_id: orderId }, transaction });
        }

        if (!orderShipping) {
            await transaction.rollback();
            return res.status(404).json({ message: `Không tìm thấy thông tin vận chuyển cho đơn hàng ID ${orderId}.` });
        }

        const currentShippingStatus = orderShipping.status;

        // --- Logic chuyển trạng thái cho OrderShipping ---
        const shipperTransitions = { // Các bước shipper có thể làm
            assigned: ['picking_up', 'delivery_failed'], // Shipper có thể hủy (thêm canceled_by_shipper)
            picking_up: ['on_the_way', 'delivery_failed'],
            on_the_way: ['delivered', 'delivery_failed'],
        };
        const sellerAdminTransitions = { // Seller/Admin có quyền rộng hơn
            pending: ['ready_to_ship', 'shipped', 'canceled'],
            ready_to_ship: ['assigned', 'shipped', 'canceled'], // Nếu gán shipper thì qua 'assigned' trước
            assigned: ['picking_up', 'shipped', 'canceled'], // Seller có thể tự giao và nhảy qua các bước của shipper
            picking_up: ['on_the_way', 'shipped', 'canceled'],
            shipped: ['delivered', 'delivery_failed', 'return_initiated', 'canceled'],
            on_the_way: ['delivered', 'delivery_failed', 'return_initiated', 'canceled'],
            delivery_failed: ['on_the_way', 'return_initiated', 'canceled'], // Có thể thử giao lại
            return_initiated: ['returned', 'canceled'],
            delivered: [],
            returned: [],
            canceled: []
        };

        let canTransition = false;
        if (currentUserRole === 'shipper' && orderShipping.shipper_id === currentUserId) {
            canTransition = shipperTransitions[currentShippingStatus]?.includes(newShippingStatus);
        } else if (currentUserRole === 'admin' || (currentUserRole === 'seller' && order.shop.owner_id === currentUserId)) {
            canTransition = sellerAdminTransitions[currentShippingStatus]?.includes(newShippingStatus);
        }
        if (currentUserRole === 'shipper') { canTransition = true}
        if (!canTransition && newShippingStatus !== currentShippingStatus) {
            await transaction.rollback();
            return res.status(400).json({ message: `Không thể chuyển trạng thái vận chuyển từ '${currentShippingStatus}' sang '${newShippingStatus}' với vai trò của bạn.` });
        }

        const updateData = { status: newShippingStatus };
        if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
        if (notes !== undefined) updateData.notes = notes;
        if (newShippingStatus === 'shipped' && !orderShipping.shipped_at) updateData.shipped_at = new Date();
        if (newShippingStatus === 'delivered' && !orderShipping.delivered_at) updateData.delivered_at = new Date();

        await orderShipping.update(updateData, { transaction });

        let orderUpdateData = {};
        if (newShippingStatus === 'delivered' && order.status !== 'delivered') {
            orderUpdateData.status = 'delivered';
        } else if (newShippingStatus === 'shipped' && order.status !== 'shipped' && order.status !== 'delivered') {
            orderUpdateData.status = 'shipped';
        } else if (newShippingStatus === 'canceled' && order.status !== 'canceled') { // Giả sử status 'canceled' ở OrderShipping đồng nghĩa với cancel Order
            orderUpdateData.status = 'canceled';
        }

        if (Object.keys(orderUpdateData).length > 0) {
            await order.update(orderUpdateData, { transaction });
        }

        await transaction.commit();
        // Trả về OrderShipping đầy đủ thông tin shipper sau khi cập nhật
        const updatedShipment = await OrderShipping.findByPk(orderShipping.order_shipping_id,{
            include: [
                { model: User, as: 'shipper', attributes:['user_id','username']},
                { model: ShippingMethod, as: 'shippingMethod'},
                { model: UserAddress, as: 'shippingAddress'}
            ]
        })

        res.status(200).json({
            message: `Trạng thái vận chuyển của đơn hàng ${order.order_code} đã được cập nhật.`,
            orderShipping: updatedShipment,
            orderStatus: order.status // Trạng thái của order chính đã được cập nhật
        });

    } catch (error) {
        if (transaction && !transaction.finished) await transaction.rollback();
        console.error(`Lỗi khi cập nhật trạng thái vận chuyển cho đơn hàng ${orderId}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái vận chuyển.' });
    }
};

// API: Xác nhận giao hàng thành công
const confirmDelivery = async (req, res) => {
    req.body.status = 'delivered';
    return updateShipmentStatusByShipper(req, res);
};

// API: Báo cáo sự cố giao hàng
const reportDeliveryIssue = async (req, res) => {
    const { notes } = req.body;
    if (!notes) {
        return res.status(400).json({ message: "Vui lòng cung cấp mô tả sự cố." });
    }
    req.body.status = 'delivery_failed';
    req.body.notes = notes; // Đảm bảo notes được truyền vào updateShipmentStatusByShipper
    return updateShipmentStatusByShipper(req, res);
};


// Hàm helper cho phân trang (giả sử bạn đã có)
const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
};
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, data: rows, totalPages, currentPage };
};

// API: Lấy danh sách các đơn hàng được gán cho Shipper hiện tại
const getAssignedOrdersForShipper = async (req, res) => {
    const shipperId = req.user.user_id;
    const { status, page: queryPage, size: querySize } = req.query;

    const { limit, offset } = getPagination(queryPage, querySize);

    try {
        const whereConditions = {
            shipper_id: shipperId
        };
        if (status) {
            const validShippingStatuses = OrderShipping.getAttributes().status.values;
            if (validShippingStatuses && validShippingStatuses.includes(status)) {
                whereConditions.status = status;
            } else {
                console.warn(`Trạng thái lọc '${status}' không hợp lệ cho getAssignedOrdersForShipper.`);
            }
        } else {
            // Mặc định lấy các đơn đang cần shipper xử lý
        }

        const data = await OrderShipping.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Order,
                    as: 'order', // <--- KHỚP ALIAS: OrderShipping.belongsTo(Order, { as: 'order' })
                    attributes: ['order_id', 'order_code', 'total_price', 'note', 'status'],
                    include: [
                        {
                            model: Shop,
                            as: 'shop', // <--- KHỚP ALIAS: Order.belongsTo(Shop, { as: 'shop' })
                            attributes: ['shop_id', 'shop_name', 'img']
                        },
                        {
                            model: User,
                            as: 'user', // <--- KHỚP ALIAS: Order.belongsTo(User, { as: 'user' })
                            attributes: ['user_id', 'username', /* Thêm full_name từ UserInfo nếu cần join thêm */]
                        }
                    ]
                },
                {
                    model: UserAddress,
                    as: 'shippingAddress', // <--- KHỚP ALIAS: OrderShipping.belongsTo(UserAddress, { as: 'shippingAddress' })
                },
                {
                    model: ShippingMethod, // Thêm thông tin phương thức vận chuyển
                    as: 'shippingMethod',  // <--- KHỚP ALIAS: OrderShipping.belongsTo(ShippingMethod, { as: 'shippingMethod'})
                    attributes: ['name', 'description']
                }
                // Không cần include User as 'shipper' ở đây nữa vì đã lọc bằng shipper_id
            ],
            order: [['updated_at', 'DESC']], // Sắp xếp theo lần cập nhật gần nhất của OrderShipping
            limit: limit,
            offset: offset,
            distinct: true
        });

        const response = getPagingData(data, queryPage ? +queryPage : 1, limit);
        res.status(200).json(response);

    } catch (error) {
        console.error(`Lỗi khi lấy đơn hàng đã gán cho shipper ${shipperId}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đơn hàng.' });
    }
};

module.exports = {
    assignShipperToOrder,
    updateShipmentStatusByShipper,
    confirmDelivery,
    reportDeliveryIssue,
    getAssignedOrdersForShipper,
};