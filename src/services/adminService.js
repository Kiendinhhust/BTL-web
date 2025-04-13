
import axios from 'axios';

const API_URL = 'http://localhost:3434';


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