const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');
const { sendOTP } = require('../utils/mailer');
const { saveTempUser, getTempUser, deleteTempUser, allTempUser } = require('../utils/tempUser');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Đăng ký - Gửi OTP nhưng KHÔNG lưu vào database ngay
const register = async (req, res) => {
    try {
        const { username ,email, password } = req.body;
        if (await User.findOne({ where: { username } })) {
            return res.status(400).json({ error: 'Username đã tồn tại!' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        saveTempUser(email, username, hashedPassword, otp);
        await sendOTP(email, otp);

        res.json({ message: 'OTP đã được gửi đến email của bạn!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xác nhận OTP - Nếu đúng mới tạo user
const verifyOTP = async (req, res) => {
    // Bắt đầu transaction
    const transaction = await sequelize.transaction();
    try {
        const { otp, email } = req.query;
        const tempUser = getTempUser(email);
        console.log(allTempUser());

        if (!tempUser || tempUser.otp !== otp) {
            return res.status(400).json({ error: 'Mã OTP không hợp lệ!' });
        }

        // Tạo user
        const user = await User.create({
            username: tempUser.username,
            hash_password: tempUser.password,
            role: 'user'
        });

        console.log('User created:', user.id);
        deleteTempUser(email);

        await transaction.commit();

        // Tạo token JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Tài khoản đã được tạo!', token });
    } catch (error) {
        console.error('Lỗi xác thực OTP:', error);

        await transaction.rollback();
        res.status(500).json({ error: 'Lỗi xác thực OTP!' });
    }
};

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }); // Token có hiệu lực 15 phút
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // Refresh Token có hiệu lực 7 ngày
};

// Đăng nhập (Login)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
        }

        const isMatch = await bcrypt.compare(password, user.hash_password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Lưu Refresh Token trong HttpOnly Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ bật secure khi chạy production
            sameSite: 'Strict', // Chống CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.json({ message: 'Đăng nhập thành công!', accessToken });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi đăng nhập!' });
    }
};

// Refresh Access Token
const refreshAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Chưa đăng nhập!' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken(decoded.userId);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: 'Refresh Token không hợp lệ!' });
    }
};

// Đăng xuất (Logout)
const logout = async (req, res) => {
    try {
        res.clearCookie('refreshToken'); // Xóa cookie chứa Refresh Token
        res.json({ message: 'Đăng xuất thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi đăng xuất!' });
    }
};

module.exports = {
    register,
    verifyOTP,
    login,
    refreshAccessToken,
    logout
};