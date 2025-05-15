const express = require('express');
const shopController = require('../controller/shopController');
const auth = require('../middleware/authMiddleware')

const router = express.Router();

router.use(auth.authenticateToken);

// Các routes cơ bản
router.post('/',  shopController.createShop);
router.get('/',  shopController.getAllShops);
router.get('/:id',  shopController.getShopById);
router.put('/:id',  shopController.updateShop);
router.delete('/:id', shopController.deleteShop);
router.get('/user/:userId', shopController.getShopByUserId); 

// Routes cho admin duyệt/từ chối shop
router.get('/admin/pending',  shopController.getPendingShops);
router.put('/:id/approve',  shopController.approveShop);
router.put('/:id/reject',  shopController.rejectShop);

// Hiển thị thống kê shop
router.get('/:shopId/statistics/overall', shopController.getShopOverall);
router.get('/:shopId/statistics/period', shopController.getShopRevenueAndOrdersByPeriod);

module.exports = router;