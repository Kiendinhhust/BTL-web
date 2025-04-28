const express = require('express')
const orderController = require('../controller/orderController')
const auth = require('../middleware/authMiddleware')


const router = express.Router()

router.use(auth.authenticateToken)

router.post('/create-order', orderController.createOrder)

module.exports = router