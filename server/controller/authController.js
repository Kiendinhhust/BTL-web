const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, UserInfo, Shop, sequelize } = require("../models");
const { sendOTP } = require("../utils/mailer");
const {
  saveTempUser,
  getTempUser,
  deleteTempUser,
  allTempUser,
} = require("../utils/tempUser");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Đăng ký - Gửi OTP nhưng KHÔNG lưu vào database ngay
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findOne({ where: { username } })) {
      return res.status(400).json({ error: "Username đã tồn tại!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    saveTempUser(email, username, hashedPassword, otp);
    const result = await sendOTP(email, otp);
    console.log("Kết quả gửi email:", result);
    res.json({ message: "OTP đã được gửi đến email của bạn!" });
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

    if (!tempUser || tempUser.otp !== otp) {
      return res.status(400).json({ error: "Mã OTP không hợp lệ!" });
    }

    // Tạo user
    const user = await User.create({
      username: tempUser.username,
      password_hash: tempUser.password,
      role: "admin",
    });
    await UserInfo.create({
      user_id: user.user_id,
      email: email,
    });

    console.log("User created:", user.user_id);
    deleteTempUser(email);

    await transaction.commit();

    // Tạo token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Tài khoản đã được tạo!", token });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);

    await transaction.rollback();
    res.status(500).json({ error: "Lỗi xác thực OTP!" });
  }
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Token có hiệu lực 7 ngày
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  }); // Refresh Token có hiệu lực 7 ngày
};

// Đăng nhập (Login)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
      include: [{ model: UserInfo }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Tên đăng nhập hoặc mật khẩu không đúng!" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Tên đăng nhập hoặc mật khẩu không đúng!" });
    }
    console.log("check", process.env.JWT_SECRET, user);
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);
    const shop = await Shop.findOne({
      where: { owner_id: user.user_id },
      order: [["shop_id", "DESC"]],
    });
    // Lưu Refresh Token trong HttpOnly Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Chỉ bật secure khi chạy production
      sameSite: "Strict", // Chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    console.log("check", res.cookies);

    res.json({
      message: "Đăng nhập thành công!",
      accessToken,
      refreshToken,
      userId: user.user_id,
      username: user.username,
      email: user.UserInfo ? user.UserInfo.email : null,
      shop: shop ? shop.shop_id : null,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Lỗi đăng nhập!" });
  }
};

// Refresh Access Token
const refreshAccessToken = (req, res) => {
  // Try to get the refresh token from cookies first
  let refreshToken = req.cookies.refreshToken;

  // If not in cookies, try to get it from the Authorization header
  if (!refreshToken) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      refreshToken = authHeader.substring(7);
    }
  }

  // If still no refresh token, check if it's in the request body
  if (!refreshToken && req.body.refreshToken) {
    refreshToken = req.body.refreshToken;
  }

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: "Chưa đăng nhập! Không tìm thấy refresh token."
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error("Error refreshing token:", error);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: "Refresh Token đã hết hạn. Vui lòng đăng nhập lại."
      });
    }

    res.status(403).json({
      success: false,
      error: "Refresh Token không hợp lệ!"
    });
  }
};

// Đăng xuất (Logout)
const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken"); // Xóa cookie chứa Refresh Token
    res.json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi đăng xuất!" });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  refreshAccessToken,
  logout,
};
