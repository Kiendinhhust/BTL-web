const {User, UserInfor} = require('../models')

// Lấy danh sách user + thông tin của họ
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: UserInfor }] // Lấy cả thông tin user
        });

        res.json(users); // Trả về JSON
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

module.exports = {
    getAllUsers
}