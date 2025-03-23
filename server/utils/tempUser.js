const tempUsers = new Map(); // Lưu OTP và thông tin đăng ký tạm thời

const saveTempUser = (email, username, password, otp) => {
    tempUsers.set(email, {username, password, otp });
};

const getTempUser = (email) => tempUsers.get(email);

const deleteTempUser = (email) => {
    tempUsers.delete(email);
};

const allTempUser = () => {
    return tempUsers;
}

module.exports = { saveTempUser, getTempUser, deleteTempUser, allTempUser};