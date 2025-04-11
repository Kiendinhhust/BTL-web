const express = require('express');
const shopController = require('../controller/shopController');
const router = express.Router();

router.post('/', shopController.createShop);
router.get('/', shopController.getAllShops);
router.get('/:id', shopController.getShopById);
router.put('/:id', shopController.updateShop);
router.delete('/:id', shopController.deleteShop);

module.exports = router;
