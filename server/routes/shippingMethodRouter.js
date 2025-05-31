const express = require('express');
const shippingMethodController = require('../controller/shippingMethodController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(auth.authenticateToken);
router.get('/', shippingMethodController.getAllShippingMethods);
router.get('/:id', shippingMethodController.getShippingMethodById);
router.post('/', shippingMethodController.createShippingMethod);
router.put('/:id', shippingMethodController.updateShippingMethod);
router.delete('/:id',  shippingMethodController.deleteShippingMethod);
router.patch('/:id/toggle-status', shippingMethodController.toggleShippingMethodStatus);

module.exports = router;
