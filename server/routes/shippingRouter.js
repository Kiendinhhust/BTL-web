const express = require('express');
const router = express.Router();
const shippingController = require('../controller/shippingController'); // Đường dẫn tới controller
const auth = require('../middleware/authMiddleware'); // Middleware xác thực

// Áp dụng middleware xác thực cho tất cả các route
router.use(auth.authenticateToken);

// Gán shipper cho đơn hàng (Seller hoặc Admin)
router.put('/orders/:orderId/assign-shipper', auth.authorizeRole(["seller"]), shippingController.assignShipperToOrder);

// Cập nhật trạng thái vận chuyển (Seller hoặc Admin cập nhật chung)
router.put('/orders/:orderId/shipment/status', shippingController.updateShipmentStatusByShipper);

// Xác nhận giao hàng thành công (Seller hoặc Admin)
router.post('/orders/:orderId/shipment/confirm-delivery', shippingController.confirmDelivery);

// Báo cáo sự cố giao hàng (Seller hoặc Admin)
router.post('/orders/:orderId/shipment/report-issue', shippingController.reportDeliveryIssue);

// Lấy danh sách đơn hàng được gán cho shipper (Dành cho Shipper)
router.get('/shipper/my-assignments', auth.authorizeRole(["shipper"]), shippingController.getAssignedOrdersForShipper); // Mở khi có shipper_id

module.exports = router;