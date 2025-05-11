const express = require('express')
const { upload } = require('../config/multerConfig');

const storeController = require('../controller/storeController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()

//router.use(auth.authenticateToken)
router.get('/', (req, res) => {
  res.send("uitls api alive")
})
router.post('/store/image/upload', upload.single('image'), storeController.uploadSingleImage)
router.post('/store/image/delete', storeController.deleteImageByUrl)

module.exports = router
