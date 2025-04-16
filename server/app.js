require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const { sequelize } = require('./models')
const userAPI = require('./routes/userRouter')
const authAPI = require('./routes/authRouter')
const shopAPI = require('./routes/shopRouter')
const userAddressAPI = require('./routes/userAddressRouter')
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  // Cho phép frontend của bạn
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Cho phép gửi cookies
  }));

// Middleware xử lý form
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser());


// Kết nối database
sequelize.authenticate()
    .then(() => console.log('Kết nối PostgreSQL thành công!'))
    .catch(err => console.error('Lỗi kết nối PostgreSQL:', err))

// Lấy danh sách users và thông tin của họ khi truy cập "/"
app.use('/api/user', userAPI);
app.use('/auth', authAPI);
app.use('/api/shop', shopAPI);
app.use('/api/address', userAddressAPI);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
})
