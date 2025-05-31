const express = require('express')
const { upload } = require('../config/multerConfig');
const { listImages } = require('../utils/cloudinaryHelper') 
const storeController = require('../controller/storeController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()

//router.use(auth.authenticateToken)
router.get('/', (req, res) => {
  res.send("uitls api alive")
})
router.post('/store/image/upload', upload.single('image'), storeController.uploadSingleImage)
router.post('/store/image/delete', storeController.deleteImageByPublicId)
router.get('/store/image/list', async (req, res) => {
  try {
    const prefix = req.query.folder || 'uploads';
    const images = await listImages(prefix);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/store/image/:public_id(*)', storeController.getImageByPublicId); // <-- route mới
module.exports = router
