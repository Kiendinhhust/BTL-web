import actionTypes from '../actions/actionTypes';

const initialState = {
  users: [],
  isLoading: false,
  error: null
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_USERS_START:
      return {
        ...state,
        isLoading: true
      };
    
    case actionTypes.FETCH_USERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        users: action.users,
        error: null
      };
    
    case actionTypes.FETCH_USERS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: 'Lỗi khi tải dữ liệu người dùng!'
      };
    
    case actionTypes.CREATE_USER_SUCCESS:
    case actionTypes.UPDATE_USER_SUCCESS:
    case actionTypes.DELETE_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null
      };
    
    case actionTypes.CREATE_USER_FAILED:
    case actionTypes.UPDATE_USER_FAILED:
    case actionTypes.DELETE_USER_FAILED:
      return {
        ...state,
        isLoading: false,
        error: 'Có lỗi xảy ra!'
      };
    
    default:
      return state;
  }
};

export default userReducer;
