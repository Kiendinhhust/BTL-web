const express = require('express')
const orderController = require('../controller/orderController')
const auth = require('../middleware/authMiddleware')


const router = express.Router()

// router.use(auth.authenticateToken)

router.post('/create-order',auth.authenticateToken, orderController.createOrder)
router.get('/my-order',auth.authenticateToken, orderController.getUserOrders)
router.get('/shop/:shopId',auth.authenticateToken, orderController.getShopOrders)
router.get('/:orderId',auth.authenticateToken, orderController.getOrderDetails)
router.put('/:orderId/status', auth.authenticateToken, orderController.updateOrderStatus)

router.post('/review', auth.authenticateToken, orderController.createProductReview);

module.exports = router