const express = require('express')
const cartController = require('../controller/cartController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()



router.get('/', cartController.getCart)
router.post('/add', cartController.addItemToCart)
router.put('/update/:itemId', cartController.updateCartItemQuantity)
router.delete('/:itemId', cartController.removeItemFromCart)
router.delete('/clear', cartController.clearCart)

module.exports = router