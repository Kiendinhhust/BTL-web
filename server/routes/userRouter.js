const express = require("express");
const userController = require("../controller/userController");
const auth = require('../middleware/authMiddleware')
const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:userId", userController.updateUser);
router.put("/detail/:userId", userController.updateUserDetail);
router.delete("/:userId", userController.deleteUser);

// --- Các route quản lý Shipper (Yêu cầu quyền Admin) ---
router.use('/shippers', auth.authenticateToken)
router.get('/shippers/all', auth.authorizeRole(['admin', 'seller']), userController.getAllShippers);
router.get('/shippers/find', auth.authorizeRole(['admin', 'seller']), userController.findShipperByPhoneNumber);
router.get('/shippers/:shipperId', auth.authorizeRole(['admin', 'seller']), userController.getShipperById);
router.put('/shippers/:userId/set-role', userController.setUserAsShipper);
router.put('/shippers/:userId/remove-role', auth.authorizeRole(['admin']), userController.removeShipperRole);


module.exports = router;