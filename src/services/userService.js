import axios from 'axios';

const API_URL = 'http://localhost:3434';


export const getUserById = (userId) => {
    return axios.get(`${API_URL}/api/user/${userId}`);
};


export const updateUserDetail = (userId, userData) => {
    return axios.put(`${API_URL}/api/user/detail/${userId}`, userData);
};



export const handleLoginApi = (username, password) => {
    return axios.post(`${API_URL}/auth/login`, { username, password },
        {withCredentials: true}
    );
};


export const handleRegisterApi = (username, email, password, resendOTP = false) => {
    if (resendOTP) {
        return axios.post(`${API_URL}/auth/resend-otp`, { email });
    }
    return axios.post(`${API_URL}/auth/register`, { username, email, password });
};


export const verifyOtpApi = (otp, email) => {
    return axios.post(`${API_URL}/auth/verify-otp?otp=${otp}&email=${email}`);
};


export const refreshTokenApi = () => {
    return axios.post(`${API_URL}/auth/refresh-token`);
};

// Function gọi API đăng xuất
export const logoutApi = () => {
    return axios.post(`${API_URL}/auth/logout`);
};
