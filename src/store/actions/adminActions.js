import actionTypes from './actionTypes';

export const adminLoginSuccess = (userInfo) => {
    // Lưu token vào localStorage
    if (userInfo && userInfo.accessToken) {
        localStorage.setItem('accessToken', userInfo.accessToken);
    }

    return {
        type: actionTypes.ADMIN_LOGIN_SUCCESS,
        userInfo: userInfo
    };
}

export const adminLoginFail = () => ({
    type: actionTypes.ADMIN_LOGIN_FAIL
})

export const processLogout = () => {
    // Xóa token khỏi localStorage khi đăng xuất
    localStorage.removeItem('accessToken');

    return {
        type: actionTypes.PROCESS_LOGOUT
    };
}