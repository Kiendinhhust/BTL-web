const express = require('express')
const userAddressController = require('../controller/userAddressController')

const router = express.Router()

router.get('/:userId/addresses', userAddressController.getUserAddresses);
router.post('/:userId/addresses', userAddressController.addUserAddress);
router.put('/:userId/addresses/:addressId', userAddressController.updateUserAddress);
router.delete('/:userId/addresses/:addressId', userAddressController.deleteUserAddress);
router.put('/:userId/addresses/:addressId/default', userAddressController.setDefaultAddress);

module.exports = router;