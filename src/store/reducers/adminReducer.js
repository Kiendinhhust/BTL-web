import actionTypes from "../actions/actionTypes";

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  userDetail: null,
  isLoadingUserDetail: false,
  userDetailError: null
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADMIN_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        userInfo: action.userInfo
      };
    case actionTypes.ADMIN_LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null
      };
    case actionTypes.PROCESS_LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
        userDetail: null
      };

    // UserDetail actions
    case actionTypes.FETCH_USER_DETAIL_START:
      return {
        ...state,
        isLoadingUserDetail: true,
        userDetailError: null
      };

    case actionTypes.FETCH_USER_DETAIL_SUCCESS:
      return {
        ...state,
        isLoadingUserDetail: false,
        userDetail: action.userDetail,
        userDetailError: null
      };

    case actionTypes.FETCH_USER_DETAIL_FAILED:
      return {
        ...state,
        isLoadingUserDetail: false,
        userDetailError: action.error
      };

    default:
      return state;
  }
};

export default appReducer;
