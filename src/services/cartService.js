import axios from 'axios';
import store from '../redux';
import { updateUserInfo } from '../store/actions/adminActions';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3434';

// Helper function to get the access token from Redux state
const getAccessTokenFromRedux = () => {
  const state = store.getState();
  return state.admin.userInfo?.accessToken;
};

// Helper function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/refresh-token`,
      {},
      { withCredentials: true }
    );

    if (response.data && response.data.accessToken) {
      // Update the access token in Redux
      const state = store.getState();
      const userInfo = { ...state.admin.userInfo, accessToken: response.data.accessToken };
      store.dispatch(updateUserInfo(userInfo));

      return response.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
};

// Create an axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response &&
        error.response.status === 403 &&
        error.response.data &&
        error.response.data.refresh === true &&
        !originalRequest._retry) {

      originalRequest._retry = true;

      // Try to refresh the token
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // Update the authorization header with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Add an item to the cart
 * @param {Object} cartItem - The item to add to the cart
 * @param {number} cartItem.item_id - The ID of the item
 * @param {number} cartItem.quantity - The quantity to add
 * @param {number} cartItem.user_id - The ID of the user
 * @returns {Promise<Object>} - The response
 */
export const addItemToCart = async (cartItem) => {
  try {
    // Get access token from Redux
    const accessToken = getAccessTokenFromRedux();

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // We don't need to pass user_id in the request body anymore
    // The server will extract it from the JWT token
    const { user_id, ...itemData } = cartItem;

    const response = await axiosInstance.post(
      '/api/cart/add',
      itemData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi thêm sản phẩm vào giỏ hàng'
    };
  }
};

/**
 * Get the current user's cart
 * @returns {Promise<Object>} - The cart data
 */
export const getCart = async () => {
  try {
    // Get access token from Redux
    const accessToken = getAccessTokenFromRedux();

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const response = await axiosInstance.get(
      '/api/cart',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi lấy thông tin giỏ hàng'
    };
  }
};

/**
 * Update the quantity of an item in the cart
 * @param {Object} cartItem - The item to update
 * @param {number} cartItem.item_id - The ID of the item
 * @param {number} cartItem.quantity - The new quantity
 * @param {number} cartItem.user_id - The ID of the user
 * @returns {Promise<Object>} - The response
 */
export const updateCartItem = async (cartItem) => {
  try {
    // Get access token from Redux
    const accessToken = getAccessTokenFromRedux();

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

   
    const { user_id, ...itemData } = cartItem;

    const response = await axiosInstance.put(
      '/api/cart/update',
      itemData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi cập nhật sản phẩm trong giỏ hàng'
    };
  }
};

/**
 * Remove an item from the cart
 * @param {number} itemId - The ID of the item to remove
 * @returns {Promise<Object>} - The response
 */
export const removeCartItem = async (itemId) => {
  try {
    // Get access token from Redux
    const accessToken = getAccessTokenFromRedux();

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const response = await axiosInstance.delete(
      `/api/cart/${itemId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng'
    };
  }
};

/**
 * Clear the cart
 * @returns {Promise<Object>} - The response
 */
export const clearCart = async () => {
  try {
    // Get access token from Redux
    const accessToken = getAccessTokenFromRedux();

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const response = await axios.delete(
      `${API_URL}/api/cart/clear`,
      {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi xóa giỏ hàng'
    };
  }
};
