const express = require('express')
const cartController = require('../controller/cartController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()



// Get cart
router.get('/', auth.authenticateToken, cartController.getCart)

// Add item to cart
router.post('/add', auth.authenticateToken, cartController.addItemToCart)

// Update cart item
router.put('/update', auth.authenticateToken, cartController.updateCartItemQuantity)
// Also support the original route with itemId parameter
router.put('/update/:itemId', auth.authenticateToken, cartController.updateCartItemQuantity)

// Clear cart - must come before the /:itemId route to avoid conflicts
router.delete('/clear', auth.authenticateToken, cartController.clearCart)
// Also support GET method for clear (not recommended but for compatibility)
router.get('/clear', auth.authenticateToken, cartController.clearCart)

// Remove item from cart
router.delete('/remove/:itemId', auth.authenticateToken, cartController.removeItemFromCart)
// Original route for backward compatibility
router.delete('/:itemId', auth.authenticateToken, cartController.removeItemFromCart)

module.exports = router