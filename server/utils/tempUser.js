const tempUsers = new Map(); // Lưu OTP và thông tin đăng ký tạm thời

const saveTempUser = (email, username, password, otp) => {
  // Thêm timestamp để có thể xóa các OTP hết hạn
  const timestamp = Date.now();
  tempUsers.set(email, { username, password, otp, timestamp });

  // Tự động xóa OTP sau 10 phút
  setTimeout(() => {
    if (tempUsers.has(email)) {
      const userData = tempUsers.get(email);
      if (userData && userData.timestamp === timestamp) {
        tempUsers.delete(email);
        console.log(`OTP cho email ${email} đã hết hạn và bị xóa`);
      }
    }
  }, 10 * 60 * 1000); // 10 phút
};

const getTempUser = (email) => {
  const userData = tempUsers.get(email);
  if (userData) {
    // Kiểm tra xem OTP có hết hạn không (10 phút)
    const now = Date.now();
    const otpAge = now - userData.timestamp;
    if (otpAge > 10 * 60 * 1000) {
      // 10 phút
      tempUsers.delete(email);
      return null;
    }
  }
  return userData;
};

const deleteTempUser = (email) => {
  tempUsers.delete(email);
};

const allTempUser = () => {
  return tempUsers;
};

// Hàm kiểm tra xem username có đang được sử dụng trong tempUsers không
const isUsernameInTemp = (username) => {
  for (const [email, userData] of tempUsers) {
    if (userData.username === username) {
      // Kiểm tra xem có hết hạn không
      const now = Date.now();
      const otpAge = now - userData.timestamp;
      if (otpAge <= 10 * 60 * 1000) {
        // Chưa hết hạn
        return true;
      } else {
        // Đã hết hạn, xóa luôn
        tempUsers.delete(email);
      }
    }
  }
  return false;
};

module.exports = {
  saveTempUser,
  getTempUser,
  deleteTempUser,
  allTempUser,
  isUsernameInTemp,
};
