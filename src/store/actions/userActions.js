import actionTypes from "./actionTypes";
import axios from "axios";
import {
  fetchAllUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../../services/adminService";
const API_URL = "http://localhost:3434";

// Fetch all users
export const fetchAllUsersSuccess = (users) => ({
  type: actionTypes.FETCH_USERS_SUCCESS,
  users,
});

export const fetchAllUsersFailed = () => ({
  type: actionTypes.FETCH_USERS_FAILED,
});

export const fetchAllUsersStart = () => {
  return async (dispatch) => {
    try {
      const res = await fetchAllUsersApi();
      if (res && res.data) {
        dispatch(fetchAllUsersSuccess(res.data));
      } else {
        dispatch(fetchAllUsersFailed());
      }
    } catch (e) {
      console.error("Error fetching users:", e);
      dispatch(fetchAllUsersFailed());
    }
  };
};

// Create user
export const createUserSuccess = () => ({
  type: actionTypes.CREATE_USER_SUCCESS,
});

export const createUserFailed = () => ({
  type: actionTypes.CREATE_USER_FAILED,
});

export const createUser = (userData) => {
  return async (dispatch) => {
    try {
      const res = await createUserApi(userData);
      if (res && res.data) {
        dispatch(createUserSuccess());
        dispatch(fetchAllUsersStart());
        return res.data;
      } else {
        dispatch(createUserFailed());
        return {
          success: false,
          message: "Tạo người dùng thất bại!",
        };
      }
    } catch (e) {
      dispatch(createUserFailed());
      console.error("Error creating user:", e);
      return {
        success: false,
        message: e.response?.data?.error || "Tạo người dùng thất bại!",
        errorMessage:
          e.response?.data?.errorMessage ||
          e.response?.data?.error ||
          "Tạo người dùng thất bại!",
      };
    }
  };
};

// Update user
export const updateUserSuccess = () => ({
  type: actionTypes.UPDATE_USER_SUCCESS,
});

export const updateUserFailed = () => ({
  type: actionTypes.UPDATE_USER_FAILED,
});

export const updateUser = (userId, userData) => {
  return async (dispatch) => {
    try {
      const res = await updateUserApi(userId, userData);
      if (res && res.data) {
        dispatch(updateUserSuccess());
        dispatch(fetchAllUsersStart());
        return res.data;
      } else {
        dispatch(updateUserFailed());
        return {
          success: false,
          message: "Cập nhật người dùng thất bại!",
        };
      }
    } catch (e) {
      dispatch(updateUserFailed());
      console.error("Error updating user:", e);
      return {
        success: false,
        message: e.response?.data?.error || "Cập nhật người dùng thất bại!",
        errorMessage:
          e.response?.data?.errorMessage ||
          e.response?.data?.error ||
          "Cập nhật người dùng thất bại!",
      };
    }
  };
};

// Delete user
export const deleteUserSuccess = () => ({
  type: actionTypes.DELETE_USER_SUCCESS,
});

export const deleteUserFailed = () => ({
  type: actionTypes.DELETE_USER_FAILED,
});

export const deleteUser = (userId) => {
  return async (dispatch) => {
    try {
      const res = await deleteUserApi(userId);
      if (res && res.data) {
        dispatch(deleteUserSuccess());
        dispatch(fetchAllUsersStart());
        return {
          success: true,
          message: "Xóa người dùng thành công!",
        };
      } else {
        dispatch(deleteUserFailed());
        return {
          success: false,
          message: "Xóa người dùng thất bại!",
        };
      }
    } catch (e) {
      dispatch(deleteUserFailed());
      console.error("Error deleting user:", e);
      return {
        success: false,
        message: e.response?.data?.error || "Xóa người dùng thất bại!",
      };
    }
  };
};
