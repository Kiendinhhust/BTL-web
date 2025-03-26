import actionTypes from "../actions/actionTypes";

const initialState = {
  quantity: Number(0),
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_CART:
      return {
        ...state,
        quantity: state.quantity + Number(action.payload.quantity),
      };
    default:
      return { ...state, quantity: state.quantity };
  }
};
export default cartReducer;
