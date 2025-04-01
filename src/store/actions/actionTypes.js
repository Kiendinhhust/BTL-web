const actionTypes = Object.freeze({
  //app
  APP_START_UP_COMPLETE: "APP_START_UP_COMPLETE",
  SET_CONTENT_OF_CONFIRM_MODAL: "SET_CONTENT_OF_CONFIRM_MODAL",

  //admin
  ADMIN_LOGIN_SUCCESS: "ADMIN_LOGIN_SUCCESS",
  ADMIN_LOGIN_FAIL: "ADMIN_LOGIN_FAIL",
  PROCESS_LOGOUT: "PROCESS_LOGOUT",

  //user
  ADD_USER_SUCCESS: "ADD_USER_SUCCESS",
  //navbar and cart
  ADD_TO_CART: "ADD_TO_CART",
  SEARCH_ACTION: "SEARCH_ACTION",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  //product
  FETCH_PRODUCT: "FETCH_PRODUCT",
  ADD_PRODUCT: "ADD_PRODUCT",
  REMOVE_PRODUCT: "REMOVE_PRODUCT",
});

export default actionTypes;
