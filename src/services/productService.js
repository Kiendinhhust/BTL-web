// src/services/productService.js
import axios from 'axios';

const API_URL = 'http://localhost:3434';

// Lấy tất cả sản phẩm (có phân trang)
export const getAllProducts = (page = 1, size = 10, title = '') => {
  return axios.get(`${API_URL}/api/products?page=${page}&size=${size}&title=${title}`);
};

// Lấy sản phẩm theo shop_id (có phân trang)
export const getProductsByShop = (shopId, page = 1, size = 10, title = '') => {
  return axios.get(`${API_URL}/api/products/shop/${shopId}?page=${page}&size=${size}&title=${title}`);
};

// Lấy chi tiết sản phẩm theo id
export const getProductById = (productId) => {
  return axios.get(`${API_URL}/api/products/${productId}`);
};

// Tạo sản phẩm mới
export const createProduct = (productData) => {
  // Đảm bảo gửi token trong header
  const token = localStorage.getItem('accessToken');
  return axios.post(`${API_URL}/api/products/create`, productData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Cập nhật sản phẩm
export const updateProduct = (productId, productData) => {
  const token = localStorage.getItem('accessToken');
  return axios.put(`${API_URL}/api/products/${productId}`, productData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Xóa sản phẩm
export const deleteProduct = (productId) => {
  const token = localStorage.getItem('accessToken');
  return axios.delete(`${API_URL}/api/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Thêm item (biến thể) cho sản phẩm
export const addItemToProduct = (productId, itemData) => {
  const token = localStorage.getItem('accessToken');
  return axios.post(`${API_URL}/api/products/add-item/${productId}`, itemData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Lấy danh sách item của sản phẩm
export const getItemsByProduct = (productId) => {
  return axios.get(`${API_URL}/api/products/item/${productId}`);
};
