const { User, UserInfo, UserAddress } = require('../models');

// Lấy danh sách user + thông tin của họ + địa chỉ
const getUserInfor = async (req, res) => {
    try {
        const user_id = req.user.user_id
        const user = await User.findOne({
            where: {user_id},
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: UserInfo, as: "user_info"}, // Lấy cả thông tin user
                { model: UserAddress, as: "user_addresses" } // Lấy cả địa chỉ của user
            ]
        });

        res.json(user); // Trả về JSON
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

module.exports = {
    getUserInfor
};