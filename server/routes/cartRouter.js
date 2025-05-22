const express = require('express')
const cartController = require('../controller/cartController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()



router.get('/',auth.authenticateToken, cartController.getCart)
router.post('/add',auth.authenticateToken, cartController.addItemToCart)
router.put('/update/:itemId',auth.authenticateToken, cartController.updateCartItemQuantity)
router.delete('/:itemId',auth.authenticateToken, cartController.removeItemFromCart)
router.delete('/clear',auth.authenticateToken, cartController.clearCart)

module.exports = router