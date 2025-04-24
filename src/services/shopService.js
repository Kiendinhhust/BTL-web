import axios from 'axios';

const API_URL = 'http://localhost:3434';

export const getAllShops = () => {
  return axios.get(`${API_URL}/api/shop`);
};

export const getShopById = (shopId) => {
  return axios.get(`${API_URL}/api/shop/${shopId}`);
};

export const createShop = (shopData) => {
  return axios.post(`${API_URL}/api/shop`, shopData);
};

export const updateShop = (shopId, shopData) => {
  return axios.put(`${API_URL}/api/shop/${shopId}`, shopData);
};

export const deleteShop = (shopId) => {
  return axios.delete(`${API_URL}/api/shop/${shopId}`);
};
