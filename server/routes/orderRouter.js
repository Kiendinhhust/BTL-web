const express = require("express");
const orderController = require("../controller/orderController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.use(auth.authenticateToken);

router.post("/create-order", orderController.createOrder);
router.get("/my-order", orderController.getUserOrders);
router.get("/:orderId", orderController.getOrderDetails);
router.put("/:orderId/status", orderController.updateOrderStatus);

module.exports = router;
