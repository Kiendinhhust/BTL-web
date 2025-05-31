// import axios from "axios";
import axios from "../axios";
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchUserAddresses = (userId) => {
  return axios.get(`${API_URL}/api/address/${userId}/addresses`);
};

export const addUserAddress = (userId, addressData) => {
  return axios.post(`${API_URL}/api/address/${userId}/addresses`, addressData);
};

export const updateUserAddress = (userId, addressId, addressData) => {
  return axios.put(
    `${API_URL}/api/address/${userId}/addresses/${addressId}`,
    addressData
  );
};

export const deleteUserAddress = (userId, addressId) => {
  return axios.delete(
    `${API_URL}/api/address/${userId}/addresses/${addressId}`
  );
};

export const setDefaultAddress = (userId, addressId) => {
  return axios.put(
    `${API_URL}/api/address/${userId}/addresses/${addressId}/default`
  );
};
