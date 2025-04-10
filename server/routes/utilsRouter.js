const express = require('express')
const multer = require('multer');

const storeController = require('../controller/storeController')
const router = express.Router()

// Cấu hình multer để lưu file tạm thời trong RAM
const storage = multer.memoryStorage();

// Chỉ cho phép file ảnh (jpg, jpeg, png, gif, webp)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng ảnh!'), false); // Reject file
  }
};
const upload = multer({ storage, fileFilter });

//router.get('/store/image/upload')
router.post('/store/image/upload', upload.single('image'), storeController.uploadSingleImage)
router.post('/store/image/delete',storeController.deleteImageByUrl)

module.exports = router
