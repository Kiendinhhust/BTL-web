import actionTypes from './actionTypes';
import {
  getAllShops,
  createShop,
  updateShop,
  deleteShop,
  approveShop,
  rejectShop
} from '../../services/shopService';

export const fetchAllShopsStart = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: actionTypes.FETCH_SHOPS_START });

      let res = await getAllShops();

      if (res && res.data) {
        dispatch(fetchAllShopsSuccess(res.data));
      } else {
        dispatch(fetchAllShopsFailed());
      }
    } catch (e) {
      dispatch(fetchAllShopsFailed());
      console.error('Error fetching shops:', e);
    }
  };
};

export const fetchAllShopsSuccess = (data) => ({
  type: actionTypes.FETCH_SHOPS_SUCCESS,
  shops: data
});

export const fetchAllShopsFailed = () => ({
  type: actionTypes.FETCH_SHOPS_FAILED
});

export const createNewShop = (data) => {
  return async (dispatch) => {
    try {
      let res = await createShop(data);

      if (res && res.data) {
        dispatch({
          type: actionTypes.CREATE_SHOP_SUCCESS,
          shop: res.data
        });

        return {
          success: true,
          message: 'Shop created successfully!'
        };
      } else {
        dispatch({ type: actionTypes.CREATE_SHOP_FAILED });
        return {
          success: false,
          message: 'Failed to create shop!'
        };
      }
    } catch (e) {
      dispatch({ type: actionTypes.CREATE_SHOP_FAILED });
      console.error('Error creating shop:', e);
      return {
        success: false,
        message: e.response?.data?.message || 'Error creating shop!'
      };
    }
  };
};

export const updateShopInfo = (shopId, data) => {
  return async (dispatch) => {
    try {
      let res = await updateShop(shopId, data);

      if (res && res.data) {
        dispatch({
          type: actionTypes.UPDATE_SHOP_SUCCESS,
          shop: res.data
        });

        return {
          success: true,
          message: 'Shop updated successfully!'
        };
      } else {
        dispatch({ type: actionTypes.UPDATE_SHOP_FAILED });
        return {
          success: false,
          message: 'Failed to update shop!'
        };
      }
    } catch (e) {
      dispatch({ type: actionTypes.UPDATE_SHOP_FAILED });
      console.error('Error updating shop:', e);
      return {
        success: false,
        message: e.response?.data?.message || 'Error updating shop!'
      };
    }
  };
};

export const deleteShopById = (shopId) => {
  return async (dispatch) => {
    try {
      let res = await deleteShop(shopId);

      if (res && res.data) {
        dispatch({
          type: actionTypes.DELETE_SHOP_SUCCESS,
          shopId: shopId
        });

        return {
          success: true,
          message: 'Shop deleted successfully!'
        };
      } else {
        dispatch({ type: actionTypes.DELETE_SHOP_FAILED });
        return {
          success: false,
          message: 'Failed to delete shop!'
        };
      }
    } catch (e) {
      dispatch({ type: actionTypes.DELETE_SHOP_FAILED });
      console.error('Error deleting shop:', e);
      return {
        success: false,
        message: e.response?.data?.message || 'Error deleting shop!'
      };
    }
  };
};

// Duyệt shop
export const approveShopById = (shopId) => {
  return async (dispatch) => {
    try {
      let res = await approveShop(shopId);

      if (res && res.data && res.data.success) {
        dispatch({
          type: actionTypes.APPROVE_SHOP_SUCCESS,
          shopId: shopId
        });

        return {
          success: true,
          message: res.data.message || 'Shop đã được duyệt thành công!'
        };
      } else {
        dispatch({ type: actionTypes.APPROVE_SHOP_FAILED });
        return {
          success: false,
          message: res.data?.message || 'Không thể duyệt shop!'
        };
      }
    } catch (e) {
      dispatch({ type: actionTypes.APPROVE_SHOP_FAILED });
      console.error('Error approving shop:', e);
      return {
        success: false,
        message: e.response?.data?.message || 'Lỗi khi duyệt shop!'
      };
    }
  };
};

// Từ chối shop
export const rejectShopById = (shopId, reason) => {
  return async (dispatch) => {
    try {
      let res = await rejectShop(shopId, { reason });

      if (res && res.data && res.data.success) {
        dispatch({
          type: actionTypes.REJECT_SHOP_SUCCESS,
          shopId: shopId
        });

        return {
          success: true,
          message: res.data.message || 'Shop đã bị từ chối!'
        };
      } else {
        dispatch({ type: actionTypes.REJECT_SHOP_FAILED });
        return {
          success: false,
          message: res.data?.message || 'Không thể từ chối shop!'
        };
      }
    } catch (e) {
      dispatch({ type: actionTypes.REJECT_SHOP_FAILED });
      console.error('Error rejecting shop:', e);
      return {
        success: false,
        message: e.response?.data?.message || 'Lỗi khi từ chối shop!'
      };
    }
  };
};
