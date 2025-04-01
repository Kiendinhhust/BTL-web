import actionTypes from "../actions/actionTypes";

const initialState = {
  quantity: Number(0),
  search: "",
  carts: [],
};

const navbarCartReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_CART:
      return {
        ...state,
        quantity: state.quantity + Number(action.payload.quantity),
        carts: {
          ...state.carts,
          [action.payload.id]:
            (state.carts[action.payload.id] || 0) +
            Number(action.payload.quantity),
        },
      };
    case actionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        quantity: state.quantity - Number(action.payload.quantity),
        carts: {
          ...state.carts,
          [action.payload.id]: 0,
        },
      };
    case actionTypes.SEARCH_ACTION:
      return {
        ...state,
        search: action.payload.search,
      };
    default:
      return { ...state, quantity: state.quantity };
  }
};
export default navbarCartReducer;
