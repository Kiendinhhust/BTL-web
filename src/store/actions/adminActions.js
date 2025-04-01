import actionTypes from './actionTypes';

export const adminLoginSuccess = (userInfo) => ({
    type: actionTypes.ADMIN_LOGIN_SUCCESS,
    userInfo: userInfo
})

export const adminLoginFail = () => ({
    type: actionTypes.ADMIN_LOGIN_FAIL
})

export const processLogout = () => ({
    type: actionTypes.PROCESS_LOGOUT
})