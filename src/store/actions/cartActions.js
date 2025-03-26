import actionTypes from "./actionTypes";
export const addToCart = (quantity) => ({
  type: actionTypes.ADD_TO_CART,
  payload: {
    quantity,
  },
});
