const express = require('express')
const productController = require('../controller/productController')
const auth = require('../middleware/authMiddleware')

const multer = require('multer');

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

const router = express.Router()

    router.get('/status', (req, res) => {
        res.send('Product Route 200 OK')
    })

    // Tạo sản phẩm mớimới
    router.post('/create', auth.authenticateToken, productController.createProduct);

    // Hiển thị sản phẩm theo trang (có tìm kiếm theo title)
    router.get('/', productController.getAllProducts);

    // Tìm sản phẩm theo id
    router.get('/:id', productController.getProductById);

    // Cập nhật sản phẩm theo id
    router.put('/:id', auth.authenticateToken, productController.updateProduct);

    // Xóa sản phẩm theo id
    router.delete('/:id', auth.authenticateToken, productController.deleteProduct);

    // Thêm mặt hàng vào sản phẩmphẩm
    router.post('add-item/:productId', auth.authenticateToken, upload.single('image'),productController.createItem);
    // Tìm các mặt hàng của sản phẩm
    router.get('item/:productId', productController.getItemsByProduct);
    

module.exports = router
