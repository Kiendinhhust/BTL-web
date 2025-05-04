const express = require('express')
const authController = require('../controller/authController')

const router = express.Router()

router.post('/login', authController.login);
router.post('/register', authController.register)
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-access-token', authController.refreshAccessToken);
router.post('/logout', authController.logout);

module.exports = router