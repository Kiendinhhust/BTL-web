const express = require('express')
const cardController = require('../controller/cardController')

const router = express.Router()

router.get('/', cardController.getCart)
router.post('/add', cardController.addItemToCart)
router.put('/update/:itemId', cardController.updateCartItemQuantity)
router.delete('/:itemId', cardController.removeItemFromCart)
router.delete('/clear', cardController.clearCart)

module.exports = router