import axios from "axios";
import actionTypes from "../actions/actionTypes";
import { accessToken, LoginHack } from "../../containers/System/LoginHack";
// const { v4: uuidv4 } = require("uuid");
const initialState = {
  orders: [],
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_ORDER:
      return {
        ...state,
        orders: action.payload.orders,
      };
    case actionTypes.MAKE_ORDER:
      // const newState1 = {
      //   ...state,
      //   orderProducts: { ...action.payload.orderProducts },
      // };
      // localStorage.setItem(
      //   `order-${action.payload.orderId}`,
      //   JSON.stringify(newState1.orderProducts)
      // );
      return {
        ...state,
        orders: [...state.orders, { ...action.payload.order }],
      };

    default:
      return { ...state };
  }
};
export default orderReducer;
