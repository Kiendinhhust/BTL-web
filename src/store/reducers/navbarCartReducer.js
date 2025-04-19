import actionTypes from "../actions/actionTypes";
import { createBrowserHistory } from "history";
const history = createBrowserHistory();
const location = history.location;
const query = new URLSearchParams(location.search);
const initialState = {
  quantity: Number(0),
  search: query.get("title"),
  carts: [],
};

const navbarCartReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_CART:
      let indexAdd = state.carts.findIndex(
        (item) => action.payload.info.item_id === item.info.item_id
      );
      let newState1 = {
        ...state,
        quantity: Number(state.quantity) + Number(action.payload.quantity),
      };
      if (indexAdd !== -1) {
        newState1.carts[indexAdd] = {
          info: action.payload.info,
          quantity:
            Number(state.carts[indexAdd].quantity) +
            Number(action.payload.quantity),
          title: action.payload.title,
        };
      } else
        newState1 = {
          ...state,
          quantity: state.quantity + Number(action.payload.quantity),
          carts: [
            ...state.carts,
            {
              info: action.payload.info,
              quantity: Number(action.payload.quantity) || 1,
              title: action.payload.title,
            },
          ],
        };
      // localStorage.setItem("navbarCart", JSON.stringify(newState1));
      return {
        ...newState1,
      };
    case actionTypes.REMOVE_FROM_CART:
      let indexRemove = state.carts.findIndex(
        (item) => action.payload.id === item.info.item_id
      );
      const newState2 = {
        ...state,
      };
      newState2.carts.splice(indexRemove, 1);

      // localStorage.setItem("navbarCart", JSON.stringify(newState2));
      return {
        ...newState2,
      };
    case actionTypes.UPDATE_CART:
      let indexUpdate = state.carts.findIndex(
        (item) => action.payload.id === item.info.item_id
      );
      const newState3 = {
        ...state,
      };
      if (indexUpdate !== -1) {
        newState3.carts[indexUpdate] = {
          ...newState3.carts[indexUpdate],
          quantity: Number(action.payload.quantity) || 1,
        };
      }
      // localStorage.setItem("navbarCart", JSON.stringify(newState3));
      return {
        ...newState3,
      };
    case actionTypes.UPDATE_QUANTITY:
      const totalQuantity = state.carts.reduce(
        (sum, item) => sum + item.quantity, // `quantity` là giá trị của mỗi sản phẩm
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
