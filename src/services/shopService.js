// import axios from 'axios';
import axios from "../axios";

export const getAllShops = () => {
  return axios.get(`/api/shop`);
};

export const getShopById = (shopId) => {
  return axios.get(`/api/shop/${shopId}`);
};

export const createShop = (shopData) => {
  return axios.post(`/api/shop`, shopData);
};

export const updateShop = (shopId, shopData) => {
  return axios.put(`/api/shop/${shopId}`, shopData);
};

export const getShopByUserId = (userId) => {
  return axios.get(`/api/shop/user/${userId}`);
}

export const deleteShop = (shopId) => {
  return axios.delete(`/api/shop/${shopId}`);
};

// Duyệt shop
export const approveShop = (shopId) => {
  return axios.put(`/api/shop/${shopId}/approve`);
};

// Từ chối shop
export const rejectShop = (shopId, data) => {
  return axios.put(`/api/shop/${shopId}/reject`, data);
};

// Lấy danh sách shop đang chờ duyệt
export const getPendingShops = () => {
  return axios.get(`/api/shop/admin/pending`);
};
