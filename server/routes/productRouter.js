const express = require('express')
const productController = require('../controller/productController')

const router = express.Router()

    router.get('/status', (req, res) => {
        res.send('Product Route 200 OK')
    })

    // Tạo sản phẩm mớimới
    router.post('/create', productController.createProduct);

    // Hiển thị sản phẩm theo trang (có tìm kiếm theo title)
    router.get('/', productController.getAllProducts);

    // Tìm sản phẩm theo id
    router.get('/:id', productController.getProductById);

    // Cập nhật sản phẩm theo id
    router.put('/:id', productController.updateProduct);

    // Xóa sản phẩm theo id
    router.delete('/:id', productController.deleteProduct);

    // Thêm mặt hàng vào sản phẩmphẩm
    router.post('add-item/:productId', productController.createItem);
    // Tìm các mặt hàng của sản phẩm
    router.get('item/:productId', productController.getItemsByProduct);
    

module.exports = router
