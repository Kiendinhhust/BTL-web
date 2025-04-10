import actionTypes from "./actionTypes";
export const makeOrder = (payload) => ({
  type: actionTypes.MAKE_ORDER,
  payload,
});
