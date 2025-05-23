// import axios from "axios";
import axios from "../axios";
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchAllUsersApi = () => {
  return axios.get(`${API_URL}/api/user`);
};

export const createUserApi = (userData) => {
  return axios.post(`${API_URL}/api/user`, userData);
};

export const updateUserApi = (userId, userData) => {
  return axios.put(`${API_URL}/api/user/${userId}`, userData);
};

export const deleteUserApi = (userId) => {
  return axios.delete(`${API_URL}/api/user/${userId}`);
};
