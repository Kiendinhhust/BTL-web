require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const { sequelize } = require("./models");

// Auth và bảo mậtmật
const sanitize = require("./middleware/sanitize");
const auth = require("./middleware/authMiddleware");

const userAPI = require("./routes/userRouter");
const authAPI = require("./routes/authRouter");
const productAPI = require("./routes/productRouter");
const utilsAPI = require("./routes/utilsRouter");
const shopAPI = require("./routes/shopRouter");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"], // Cho phép frontend của bạn
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Cho phép gửi cookies
  })
);

// Xử lý bảo mật và xác thực
app.use(sanitize.sanitizeBody);
app.use("/api", auth.authenticateToken);

// Middleware xử lý form
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

// Kết nối database
sequelize
  .authenticate()
  .then(() => console.log("Kết nối PostgreSQL thành công!"))
  .catch((err) => console.error("Lỗi kết nối PostgreSQL:", err));

// Cấu hình router, api
app.use("/api/user", userAPI);
app.use("/auth", authAPI);
app.use("/api/products", productAPI);
app.use("/api/utils", utilsAPI);
//app.use('/api/order', )
app.use("/auth", authAPI);
app.use("/api/shop", shopAPI);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
