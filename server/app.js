require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./models')
const userAPI = require('./routes/userRouter')
const authAPI = require('./routes/authRouter')

const app = express();

// Middleware xử lý form
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Kết nối database
sequelize.authenticate()
    .then(() => console.log('Kết nối PostgreSQL thành công!'))
    .catch(err => console.error('Lỗi kết nối PostgreSQL:', err))

// Lấy danh sách users và thông tin của họ khi truy cập "/"
app.use('/api/user', userAPI);
app.use('/auth', authAPI)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
})