const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thulamhoai143@gmail.com',
        pass: 'quqr ssrv agas liws'
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔒 Xác nhận đăng ký - Nhập mã OTP của bạn',
        text: `Xin chào,\n\nCảm ơn bạn đã đăng ký. Mã OTP của bạn là: ${otp}\n\nVui lòng không chia sẻ mã này với ai.\n\nTrân trọng!`,
    };
    console.log(`Login gmail ${process.env.EMAIL_USER} pass ${process.env.EMAIL_PASS}`)
    await transporter.sendMail(mailOptions);
    console.log('Send email')
};

module.exports = { sendOTP };