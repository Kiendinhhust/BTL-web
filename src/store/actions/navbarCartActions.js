import actionTypes from "./actionTypes";
export const addToCart = (payload) => ({
  type: actionTypes.ADD_TO_CART,
  payload,
});
export const removeFromCart = (payload) => ({
  type: actionTypes.REMOVE_FROM_CART,
  payload,
});
export const removeAllCart = () => ({
  type: actionTypes.REMOVE_ALL_CART,
});
export const searchAction = (payload) => ({
  type: actionTypes.SEARCH_ACTION,
  payload,
});
export const updateCart = (payload) => ({
  type: actionTypes.UPDATE_CART,
  payload,
});
export const updateQuantity = (payload) => ({
  type: actionTypes.UPDATE_QUANTITY,
  payload,
});
export const fetchCart = () => ({
  type: actionTypes.FETCH_CART,
});
