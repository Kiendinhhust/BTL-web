import actionTypes from "../actions/actionTypes";

const initialState = {
  quantity: Number(0),
  search: "",
  carts: [],
};

const navbarCartReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_CART:
      const newState1 = {
        ...state,
        quantity: state.quantity + Number(action.payload.quantity),
        carts: {
          ...state.carts,
          [action.payload.id]:
            (state.carts[action.payload.id] || 0) +
            Number(action.payload.quantity),
        },
      };
      // localStorage.setItem("navbarCart", JSON.stringify(newState1));
      return {
        ...newState1,
      };
    case actionTypes.REMOVE_FROM_CART:
      const newState2 = {
        ...state,
        quantity: state.quantity - Number(action.payload.quantity),
        carts: {
          ...state.carts,
          [action.payload.id]: 0,
        },
      };
      // localStorage.setItem("navbarCart", JSON.stringify(newState2));
      return {
        ...newState2,
      };
    case actionTypes.UPDATE_CART:
      const newState3 = {
        ...state,
        carts: {
          ...state.carts,
          [action.payload.id]: Number(action.payload.quantity || 1),
        },
      };
      // localStorage.setItem("navbarCart", JSON.stringify(newState3));
      return {
        ...newState3,
      };
    case actionTypes.UPDATE_QUANTITY:
      const totalQuantity = Object.values(state.carts).reduce(
        (sum, quantity) => sum + quantity, // `quantity` là giá trị của mỗi sản phẩm
        0
      );
      const newState4 = {
        ...state,
        quantity: Number(totalQuantity),
      };
      // localStorage.setItem("navbarCart", JSON.stringify(newState4));
      return {
        ...newState4,
      };
    case actionTypes.REMOVE_ALL_CART:
      const newState5 = {
        ...state,
        quantity: 0,
        carts: [],
      };
      // localStorage.removeItem("navbarCart");
      return {
        ...newState5,
      };
    case actionTypes.SEARCH_ACTION:
      return {
        ...state,
        search: action.payload.search,
      };
    // case actionTypes.FETCH_CART:
    //   // const navbarCart = JSON.parse(localStorage.getItem("navbarCart")) || {};
    //   return {
    //     ...state,
    //     ...navbarCart,
    //   };
    default:
      return { ...state, quantity: state.quantity };
  }
};
export default navbarCartReducer;
