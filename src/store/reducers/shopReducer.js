import actionTypes from '../actions/actionTypes';

const initialState = {
  shops: [],
  isLoading: false,
  error: null
};

const shopReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_SHOPS_START:
      return {
        ...state,
        isLoading: true
      };
      
    case actionTypes.FETCH_SHOPS_SUCCESS:
      return {
        ...state,
        shops: action.shops,
        isLoading: false
      };
      
    case actionTypes.FETCH_SHOPS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: 'Failed to fetch shops'
      };
      
    case actionTypes.CREATE_SHOP_SUCCESS:
      return {
        ...state,
        shops: [...state.shops, action.shop]
      };
      
    case actionTypes.UPDATE_SHOP_SUCCESS:
      return {
        ...state,
        shops: state.shops.map(shop => 
          shop.shop_id === action.shop.shop_id ? action.shop : shop
        )
      };
      
    case actionTypes.DELETE_SHOP_SUCCESS:
      return {
        ...state,
        shops: state.shops.filter(shop => shop.shop_id !== action.shopId)
      };
      
    default:
      return state;
  }
};

export default shopReducer;
