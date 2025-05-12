import actionTypes from "./actionTypes";
export const makeOrder = (payload) => ({
  type: actionTypes.MAKE_ORDER,
  payload,
});
export const fetchOrder = (payload) => ({
  type: actionTypes.FETCH_ORDER,
  payload,
});
