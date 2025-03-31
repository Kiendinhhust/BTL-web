const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')


const router = express.Router()

router.get('/', userController.getAllUsers)
router.post('/login', authController.login)
router.post('/refresh-access-token', authController.refreshAccessToken)

module.exports = router