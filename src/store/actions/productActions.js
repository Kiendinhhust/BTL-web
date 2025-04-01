import actionTypes from "./actionTypes";
export const fetchProduct = () => ({
  type: actionTypes.FETCH_PRODUCT,
});
export const addProduct = (payload) => ({
  type: actionTypes.ADD_PRODUCT,
  payload,
});
export const removeProduct = (payload) => ({
  type: actionTypes.REMOVE_PRODUCT,
  payload,
});
