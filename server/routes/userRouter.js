const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()

router.use(auth.authenticateToken)

router.get('/get-user-infor', userController.getUserInfor)

router.get('/', userController.getAllUsers)
router.get('/:userId', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.put('/detail/:userId', userController.updateUserDetail);
router.delete('/:userId', userController.deleteUser);

module.exports = router