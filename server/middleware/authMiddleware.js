const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Xác thực Token
const authenticateToken = async (req, res, next) => {
    // Lấy token từ header Authorization: Bearer TOKEN
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Lấy phần token sau 'Bearer '
    //Authorization: "Bearer + TOKEN"
    if (token == null) {
        token = req.cookies.accessToken
    }
    
    if (token == null) {
        // Không có token -> Chưa đăng nhập
        return res.status(401).json({ error: 'Yêu cầu chưa được xác thực (Không tìm thấy token).' });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token hợp lệ, tìm thông tin user tương ứng
        const user = await User.findByPk(decoded.userId, {
            // Loại bỏ password_hash
             attributes: { exclude: ['password_hash'] }
        });
        console.log(decoded)
        if (!user) {
            return res.status(403).json({ error: 'Token hợp lệ nhưng không tìm thấy người dùng.' });
        }

        // Gắn thông tin user vào request để các middleware/handler sau có thể sử dụng
        req.user = user.get({ plain: true });
        next(); // Chuyển sang middleware hoặc route handler tiếp theo

    } catch (error) {
        console.error("Lỗi xác thực token:", error.name, error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token đã hết hạn.', refress: true });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Token không hợp lệ.' });
        }
        // Lỗi khác
        return res.status(500).json({ error: 'Lỗi hệ thống khi xác thực token.' });
    }
};

// 2. Middleware phân quyền dựa trên vai trò (Role)
//    Đây là một factory function: nhận vào danh sách các role được phép
// Trả về middleware function
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        // Middleware này phải chạy SAU authenticateToken, nên req.user đã có
        if (!req.user || !req.user.role) {
             // Trường hợp bất thường nếu authenticateToken lỗi hoặc user không có role
            return res.status(403).json({ error: 'Không thể xác định vai trò người dùng.' });
        }

        const userRole = req.user.role; 

        // Kiểm tra quyền người dùng
        if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.includes(userRole)) {
            next(); // Role hợp lệ, cho phép tiếp tục
        } else {
            // Role không hợp lệ
            res.status(403).json({ error: 'Bạn không có quyền truy cập tài nguyên này.' });
        }
    };
};


module.exports = {
    authenticateToken,
    authorizeRole
};