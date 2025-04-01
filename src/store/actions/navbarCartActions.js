import actionTypes from "./actionTypes";
export const addToCart = (payload) => ({
  type: actionTypes.ADD_TO_CART,
  payload,
});
export const removeFromCart = (payload) => ({
  type: actionTypes.REMOVE_FROM_CART,
  payload,
});
export const searchAction = (payload) => ({
  type: actionTypes.SEARCH_ACTION,
  payload,
});
export const updateCart = (payload) => ({
  type: actionTypes.UPDATE_CART,
  payload,
});
export const updateQuantity = () => ({
  type: actionTypes.UPDATE_QUANTITY,
});
export const fetchCart = () => ({
  type: actionTypes.FETCH_CART,
});
