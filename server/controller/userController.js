const { User, UserInfo, UserAddress } = require('../models');

// Lấy danh sách user + thông tin của họ + địa chỉ
const getAllUsers = async (req, res) => {
    try {
        console.log(req.user)
        const users = await User.findAll({
            include: [
                { model: UserInfo }, // Lấy cả thông tin user
                { model: UserAddress } // Lấy cả địa chỉ của user
            ]
        });

        res.json(users); // Trả về JSON
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

module.exports = {
    getAllUsers
};