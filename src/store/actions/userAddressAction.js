import actionTypes from './actionTypes';
import {
    fetchUserAddresses,
    addUserAddress as addAddressService,
    updateUserAddress as updateAddressService,
    deleteUserAddress as deleteAddressService,
    setDefaultAddress as setDefaultAddressService
  } from '../../services/userAddressService';

// Action creators
export const fetchUserAddressesSuccess = (addresses) => ({
  type: actionTypes.FETCH_USER_ADDRESSES_SUCCESS,
  payload: addresses
});

export const fetchUserAddressesFailure = (error) => ({
  type: actionTypes.FETCH_USER_ADDRESSES_FAILURE,
  payload: error
});

export const addUserAddressSuccess = (address) => ({
  type: actionTypes.ADD_USER_ADDRESS_SUCCESS,
  payload: address
});

export const addUserAddressFailure = (error) => ({
  type: actionTypes.ADD_USER_ADDRESS_FAILURE,
  payload: error
});

export const updateUserAddressSuccess = (address) => ({
  type: actionTypes.UPDATE_USER_ADDRESS_SUCCESS,
  payload: address
});

export const updateUserAddressFailure = (error) => ({
  type: actionTypes.UPDATE_USER_ADDRESS_FAILURE,
  payload: error
});

export const deleteUserAddressSuccess = (addressId) => ({
  type: actionTypes.DELETE_USER_ADDRESS_SUCCESS,
  payload: addressId
});

export const deleteUserAddressFailure = (error) => ({
  type: actionTypes.DELETE_USER_ADDRESS_FAILURE,
  payload: error
});

export const setDefaultAddressSuccess = (addressId) => ({
  type: actionTypes.SET_DEFAULT_ADDRESS_SUCCESS,
  payload: addressId
});

export const setDefaultAddressFailure = (error) => ({
  type: actionTypes.SET_DEFAULT_ADDRESS_FAILURE,
  payload: error
});

// Thunk actions
export const getUserAddresses = (userId) => {
  return async (dispatch) => {
    try {
      const response = await fetchUserAddresses(userId);
      if (response?.data) {
        dispatch(fetchUserAddressesSuccess(response.data));
        return { success: true, data: response.data };
      }
      dispatch(fetchUserAddressesFailure('Không tìm thấy địa chỉ'));
      return { success: false, message: 'Không tìm thấy địa chỉ' };
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi lấy địa chỉ';
      dispatch(fetchUserAddressesFailure(errorMsg));
      return { success: false, message: errorMsg };
    }
  };
};

export const addUserAddress = (userId, addressData) => {
  return async (dispatch) => {
    try {
      const response = await addAddressService(userId, addressData);
      if (response?.data) {
        dispatch(addUserAddressSuccess(response.data));
        return { 
          success: true, 
          message: 'Thêm địa chỉ thành công', 
          data: response.data 
        };
      }
      dispatch(addUserAddressFailure('Thêm địa chỉ thất bại'));
      return { success: false, message: 'Thêm địa chỉ thất bại' };
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi thêm địa chỉ';
      dispatch(addUserAddressFailure(errorMsg));
      return { success: false, message: errorMsg };
    }
  };
};

export const updateUserAddress = (userId, addressId, addressData) => {
  return async (dispatch) => {
    try {
      const response = await updateAddressService(userId, addressId, addressData);
      if (response?.data) {
        dispatch(updateUserAddressSuccess(response.data));
        return { 
          success: true, 
          message: 'Cập nhật địa chỉ thành công', 
          data: response.data 
        };
      }
      dispatch(updateUserAddressFailure('Cập nhật địa chỉ thất bại'));
      return { success: false, message: 'Cập nhật địa chỉ thất bại' };
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật địa chỉ';
      dispatch(updateUserAddressFailure(errorMsg));
      return { success: false, message: errorMsg };
    }
  };
};

export const deleteUserAddress = (userId, addressId) => {
  return async (dispatch) => {
    try {
      const response = await deleteAddressService(userId, addressId);
      if (response?.status === 200) {
        dispatch(deleteUserAddressSuccess(addressId));
        return { success: true, message: 'Xóa địa chỉ thành công' };
      }
      dispatch(deleteUserAddressFailure('Xóa địa chỉ thất bại'));
      return { success: false, message: 'Xóa địa chỉ thất bại' };
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi xóa địa chỉ';
      dispatch(deleteUserAddressFailure(errorMsg));
      return { success: false, message: errorMsg };
    }
  };
};

export const setDefaultAddress = (userId, addressId) => {
  return async (dispatch) => {
    try {
      const response = await setDefaultAddressService(userId, addressId);
      if (response?.status === 200) {
        dispatch(setDefaultAddressSuccess(addressId));
        return { success: true, message: 'Đặt địa chỉ mặc định thành công' };
      }
      dispatch(setDefaultAddressFailure('Đặt địa chỉ mặc định thất bại'));
      return { success: false, message: 'Đặt địa chỉ mặc định thất bại' };
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi đặt địa chỉ mặc định';
      dispatch(setDefaultAddressFailure(errorMsg));
      return { success: false, message: errorMsg };
    }
  };
};
