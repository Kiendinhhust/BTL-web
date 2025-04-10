const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')


const router = express.Router()

router.get('/', userController.getAllUsers)
router.get('/:userId', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.put('/detail/:userId', userController.updateUserDetail);
router.delete('/:userId', userController.deleteUser);
router.post('/login', authController.login)
router.post('/refresh-access-token', authController.refreshAccessToken)

module.exports = router