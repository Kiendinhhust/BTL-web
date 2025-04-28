const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()

router.use(auth.authenticateToken)

router.get('/get-user-infor', userController)

module.exports = router