const db = require("../models");
const { Cart, Item, Product, Shop, User } = db;
const { Op } = require('sequelize');

// Lấy toàn bộ giỏ hàng của người dùng
const getCart = async (req, res) => {
    const userId = req.user.user_id; // Lấy từ authenticateToken middleware

    try {
        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Item,
                    as: 'item',
                    attributes: ['item_id', 'price', 'stock', 'image_url', 'sale_price', 'attributes'], // Lấy thông tin cần thiết của Item
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['product_id', 'title', 'slug'], // Lấy thông tin cần thiết của Product
                        include: [{
                             model: Shop,
                             as: 'shop',
                             attributes: ['shop_id', 'shop_name'] // Lấy thông tin Shop nếu cần
                        }]
                    }]
                }
            ],
            order: [['created_at', 'DESC']] // Sắp xếp theo mới nhất
        });

        // Tính toán tổng tiền tạm tính (có thể làm ở frontend hoặc thêm logic ở đây)

        res.status(200).send(cartItems);
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).send({ message: "Đã xảy ra lỗi khi lấy thông tin giỏ hàng." });
    }
};


// Thêm sản phẩm vào giỏ hoặc cập nhật số lượng
const addItemToCart = async (req, res) => {
    const userId = req.user.user_id;
    const { item_id, quantity: requestedQuantity } = req.body;

    // --- Validation ---
    if (!item_id || requestedQuantity === undefined || requestedQuantity === null) {
        return res.status(400).send({ message: "Vui lòng cung cấp ID mặt hàng và số lượng." });
    }
    const quantity = parseInt(requestedQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send({ message: "Số lượng phải là số nguyên dương." });
    }

    try {
        // 1. Kiểm tra Item tồn tại và đủ hàng tồn kho
        const item = await Item.findByPk(item_id);
        if (!item) {
            return res.status(404).send({ message: `Mặt hàng với ID ${item_id} không tồn tại.` });
        }


        // 2. Tìm xem item đã có trong giỏ hàng của user chưa
        const existingCartItem = await Cart.findOne({
            where: {
                user_id: userId,
                item_id: item_id
            }
        });

        let finalCartItem;
        let message = "";

        if (existingCartItem) {
            // --- Item đã có trong giỏ -> Cập nhật số lượng ---
            const newQuantity = existingCartItem.quantity + quantity;

             // Kiểm tra lại tồn kho với số lượng *mới*
             if (item.stock < newQuantity) {
                 return res.status(400).send({ message: `Không đủ hàng tồn kho. Chỉ còn ${item.stock} sản phẩm. Bạn đã có ${existingCartItem.quantity} trong giỏ.` });
             }

            existingCartItem.quantity = newQuantity;
            await existingCartItem.save(); // Lưu thay đổi
            finalCartItem = existingCartItem;
            message = "Đã cập nhật số lượng sản phẩm trong giỏ hàng.";
        } else {
            // --- Item chưa có trong giỏ -> Thêm mới ---

            // Kiểm tra tồn kho cho số lượng ban đầu
            if (item.stock < quantity) {
                 return res.status(400).send({ message: `Không đủ hàng tồn kho. Chỉ còn ${item.stock} sản phẩm.` });
            }

            finalCartItem = await Cart.create({
                user_id: userId,
                item_id: item_id,
                quantity: quantity
            });
             message = "Đã thêm sản phẩm vào giỏ hàng.";
        }

         // Lấy lại thông tin chi tiết để trả về (bao gồm item, product)
        const cartItemDetails = await Cart.findByPk(finalCartItem.cart_id, {
             include: [
                 {
                     model: Item, as: 'item', attributes: ['item_id', 'price', 'stock', 'image_url', 'sale_price', 'attributes'],
                    include: [{ model: Product, as: 'product', attributes: ['product_id', 'title', 'slug'] }]
                 }
             ]
        });

        res.status(existingCartItem ? 200 : 201).send({ message, cartItem: cartItemDetails }); // 200 OK if updated, 201 Created if new

    } catch (error) {
        console.error("Lỗi khi thêm/cập nhật giỏ hàng:", error);
         // Bắt lỗi unique constraint (dù findOne nên xử lý trước)
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).send({ message: "Lỗi trùng lặp mặt hàng trong giỏ (Conflict)." }); // 409 Conflict
        }
        res.status(500).send({ message: "Đã xảy ra lỗi khi xử lý giỏ hàng." });
    }
};

// Cập nhật số lượng một item trong giỏ
const updateCartItemQuantity = async (req, res) => {
    const userId = req.user.user_id;
    const itemId = req.params.itemId; // Lấy item_id từ URL
    const { quantity: newQuantity } = req.body;

    // --- Validation ---
    if (newQuantity === undefined || newQuantity === null) {
        return res.status(400).send({ message: "Vui lòng cung cấp số lượng mới." });
    }
     const quantity = parseInt(newQuantity, 10);
     if (isNaN(quantity) || quantity <= 0) {
        // Nếu số lượng <= 0, coi như là yêu cầu xóa item
        // Gọi hàm xóa hoặc thực hiện xóa trực tiếp
         try {
             const numDeleted = await Cart.destroy({ where: { user_id: userId, item_id: itemId } });
             if (numDeleted > 0) {
                 return res.status(200).send({ message: "Đã xóa sản phẩm khỏi giỏ hàng do số lượng <= 0." });
             } else {
                  return res.status(404).send({ message: "Không tìm thấy sản phẩm trong giỏ hàng để xóa." });
             }
         } catch (deleteError){
              console.error("Lỗi khi xóa cart item (quantity<=0):", deleteError);
             return res.status(500).send({ message: "Lỗi khi xóa sản phẩm khỏi giỏ hàng." });
         }
    }

    try {
         // 1. Tìm item trong giỏ hàng
        const cartItem = await Cart.findOne({
            where: { user_id: userId, item_id: itemId }
        });

        if (!cartItem) {
            return res.status(404).send({ message: "Không tìm thấy mặt hàng này trong giỏ hàng của bạn." });
        }

        // 2. Kiểm tra tồn kho của mặt hàng gốc
        const item = await Item.findByPk(itemId);
        if (!item) {
             // Edge case: Item bị xóa sau khi thêm vào giỏ? Nên xóa khỏi giỏ hàng.
            await cartItem.destroy(); // Xóa mục giỏ hàng không hợp lệ
             return res.status(404).send({ message: "Mặt hàng gốc không còn tồn tại. Đã xóa khỏi giỏ hàng." });
        }
        if (item.stock < quantity) {
            return res.status(400).send({ message: `Không đủ hàng tồn kho. Chỉ còn ${item.stock} sản phẩm.` });
        }

        // 3. Cập nhật số lượng
        cartItem.quantity = quantity;
        await cartItem.save();

         // Lấy lại thông tin chi tiết để trả về
         const updatedCartItemDetails = await Cart.findByPk(cartItem.cart_id, { include: [{model: Item, as: 'item'}] });


        res.status(200).send({ message: "Đã cập nhật số lượng thành công.", cartItem: updatedCartItemDetails });

    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng giỏ hàng:", error);
        res.status(500).send({ message: "Đã xảy ra lỗi khi cập nhật số lượng giỏ hàng." });
    }
};


// Xóa một item khỏi giỏ hàng
const removeItemFromCart = async (req, res) => {
    const userId = req.user.user_id;
    const itemId = req.params.itemId; // Lấy item_id từ URL

    try {
        const numDeleted = await Cart.destroy({
            where: {
                user_id: userId,
                item_id: itemId
            }
        });

        if (numDeleted === 1) {
            res.status(200).send({ message: "Đã xóa sản phẩm khỏi giỏ hàng thành công." }); // Hoặc 204 No Content nếu không cần message
        } else {
            res.status(404).send({ message: "Không tìm thấy sản phẩm này trong giỏ hàng của bạn." });
        }
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).send({ message: "Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng." });
    }
};

// Xóa toàn bộ giỏ hàng của người dùng
const clearCart = async (req, res) => {
    const userId = req.user.user_id;

    try {
        const numsDeleted = await Cart.destroy({
            where: { user_id: userId }
        });
        res.status(200).send({ message: `Đã xóa ${numsDeleted} sản phẩm khỏi giỏ hàng.` });
    } catch (error) {
        console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
        res.status(500).send({ message: "Đã xảy ra lỗi khi xóa giỏ hàng." });
    }
};


module.exports = {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearCart
}