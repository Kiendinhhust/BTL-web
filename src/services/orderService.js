import axios from 'axios';
import store from '../redux';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3434';

// Helper function to get the access token from Redux state
const getAccessTokenFromRedux = () => {
  const state = store.getState();
  return state.admin.userInfo?.accessToken;
};

// Create an axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add a request interceptor to include the authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessTokenFromRedux();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Create a new order
 * @param {Object} orderData - The order data
 * @param {number} orderData.shipping_address_id - The ID of the shipping address
 * @param {number} orderData.shipping_method_id - The ID of the shipping method
 * @param {string} orderData.payment_method - The payment method (cod, credit_card, e_wallet, bank_transfer)
 * @param {string} orderData.note - Optional note for the order
 * @param {Array} orderData.items - Array of items to order [{item_id, quantity}]
 * @param {boolean} orderData.clear_cart - Whether to clear the cart after creating the order
 * @returns {Promise<Object>} - The response
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(
      '/api/order/create-order',
      orderData
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi khi tạo đơn hàng'
    };
  }
};

/**
 * Get user's orders
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} - The response
 */
export const getUserOrders = async (params = { page: 1, size: 10 }) => {
  try {
    const response = await axiosInstance.get(
      '/api/order/my-order',
      { params }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng'
    };
  }
};

/**
 * Get order details
 * @param {number} orderId - The ID of the order
 * @returns {Promise<Object>} - The response
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `/api/order/${orderId}`
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Error getting order details for order ${orderId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng'
    };
  }
};

/**
 * Update order status
 * @param {number} orderId - The ID of the order
 * @param {string} status - The new status
 * @param {string} statusNote - Optional note for the status change
 * @returns {Promise<Object>} - The response
 */
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await axiosInstance.put(
      `/api/order/${orderId}/status`,
      statusData
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng'
    };
  }
};

/**
 * Get shipping methods
 * @returns {Promise<Object>} - The response
 */
export const getShippingMethods = async () => {
  try {
    const response = await axiosInstance.get('/api/shipping-methods');

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting shipping methods:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi khi lấy phương thức vận chuyển'
    };
  }
};

/**
 * Get shop orders
 * @param {number} shopId - The ID of the shop
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.size - Page size
 * @returns {Promise<Object>} - The response
 */
export const getShopOrders = async (shopId, params = { page: 1, size: 10 }) => {
  try {
    const response = await axiosInstance.get(
      `/api/order/shop/${shopId}`,
      { params }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error getting shop orders for shop ${shopId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của cửa hàng'
    };
  }
};

export default {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getShippingMethods,
  getShopOrders
};
