import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3434';

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
    if (!cartItem.user_id) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    const response = await axios.post(
      `${API_URL}/api/cart/add`,
      cartItem,
      {
        withCredentials: true,
        // headers: {
        //   'Content-Type': 'application/json',
        //   'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        // }
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
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const response = await axios.get(
      `${API_URL}/api/cart`,
      {
        withCredentials: true,
      //   headers: {
      //     'Authorization': `Bearer ${accessToken}`
      //   }
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
    if (!cartItem.user_id) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const response = await axios.put(
      `${API_URL}/api/cart/update`,
      cartItem,
      {
        withCredentials: true,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`
      //   }
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
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const response = await axios.delete(
      `${API_URL}/api/cart/remove/${itemId}`,
      {
        withCredentials: true,
        // headers: {
        //   'Authorization': `Bearer ${accessToken}`
        // }
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
    const response = await axios.delete(
      `${API_URL}/api/cart/clear`,
      { withCredentials: true }
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
