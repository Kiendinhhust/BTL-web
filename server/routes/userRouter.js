const express = require('express')
const userController = require('../controller/userController')

const router = express.Router()

router.get('/', userController.getAllUsers)
router.get('/:userId', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);
module.exports = router