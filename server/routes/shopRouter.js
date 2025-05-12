const express = require('express');
const shopController = require('../controller/shopController');

const router = express.Router();

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

module.exports = router;