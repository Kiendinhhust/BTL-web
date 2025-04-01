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
    case actionTypes.UPDATE_CART:
      console.log("UPDATE_CART payload:", action.payload);
      return {
        ...state,
        carts: {
          ...state.carts,
          [action.payload.id]: Number(action.payload.quantity || 1),
        },
      };
    case actionTypes.UPDATE_QUANTITY:
      const totalQuantity = Object.values(state.carts).reduce(
        (sum, quantity) => sum + quantity, // `quantity` là giá trị của mỗi sản phẩm
        0
      );
      return {
        ...state,
        quantity: Number(totalQuantity),
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
