import actionTypes from './actionTypes';
import { getUserById } from '../../services/userService';
import { updateUserDetail as updateUserDetailService } from '../../services/userService';
export const fetchUserDetailStart = () => ({
    type: actionTypes.FETCH_USER_DETAIL_START
});

export const fetchUserDetailSuccess = (userData) => ({
    type: actionTypes.FETCH_USER_DETAIL_SUCCESS,
    payload: userData
});

export const fetchUserDetailFailure = (error) => ({
    type: actionTypes.FETCH_USER_DETAIL_FAILURE,
    payload: error
});

export const updateUserDetailSuccess = (userData) => ({
    type: actionTypes.UPDATE_USER_DETAIL_SUCCESS,
    payload: userData
});

export const updateUserDetailFailure = (error) => ({
    type: actionTypes.UPDATE_USER_DETAIL_FAILURE,
    payload: error
});


export const fetchUserDetail = (userId) => {
    return async (dispatch) => {
        dispatch(fetchUserDetailStart());
        try {
            const response = await getUserById(userId);
            if (response && response.data) {
                dispatch(fetchUserDetailSuccess(response.data));
                return {
                    success: true,
                    data: response.data
                };
            } else {
                dispatch(fetchUserDetailFailure('Không tìm thấy thông tin người dùng'));
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                };
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            dispatch(fetchUserDetailFailure(error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng'));
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng'
            };
        }
    };
};

export const updateUserDetail = (userId, userData) => {
    return async (dispatch) => {
        try {
            const response = await updateUserDetailService(userId, userData);
            if (response && response.data) {
                dispatch(updateUserDetailSuccess(response.data));
                return {
                    success: true,
                    message: 'Cập nhật thông tin thành công',
                    data: response.data
                };
            } else {
                dispatch(updateUserDetailFailure('Cập nhật thông tin thất bại'));
                return {
                    success: false,
                    message: 'Cập nhật thông tin thất bại'
                };
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin người dùng:', error);
            dispatch(updateUserDetailFailure(error.response?.data?.message || 'Lỗi khi cập nhật thông tin người dùng'));
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi cập nhật thông tin người dùng'
            };
        }
    };
};