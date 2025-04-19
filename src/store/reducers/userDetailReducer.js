import actionTypes from '../actions/actionTypes';

const initialState = {
    userInfo: {},
    isLoading: false,
    error: null,
};

const userDetailReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_USER_DETAIL_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case actionTypes.FETCH_USER_DETAIL_SUCCESS:
            return {
                ...state,
                userInfo: action.payload,
                isLoading: false,
                error: null,
            };
        case actionTypes.FETCH_USER_DETAIL_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        case actionTypes.UPDATE_USER_DETAIL_SUCCESS:
            return {
                ...state,
                userInfo: { ...state.userInfo, ...action.payload },
                isLoading: false,
                error: null,
            };
        case actionTypes.UPDATE_USER_DETAIL_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default userDetailReducer;
