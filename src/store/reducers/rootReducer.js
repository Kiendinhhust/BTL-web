import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import appReducer from "./appReducer";
import adminReducer from "./adminReducer";
import userReducer from "./userReducer";

import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import navbarCartReducer from "./navbarCartReducer";
import productReducer from "./productReducer";
import orderReducer from "./orderReducer";
import userDetailReducer from "./userDetailReducer";
import userAddressReducer from "./userAddressReducer";
import shopReducer from "./shopReducer";

const persistCommonConfig = {
  storage: storage,
  stateReconciler: autoMergeLevel2,
};

const adminPersistConfig = {
  ...persistCommonConfig,
  key: "admin",
  whitelist: ["isLoggedIn", "userInfo"],
};
const orderPersistConfig = {
  ...persistCommonConfig,
  key: "orders",
  whitelist: ["orders"],
};
const navbarCartPersistConfig = {
  ...persistCommonConfig,
  key: "navbarCart",
  whitelist: ["quantity", "carts"],
};
const rootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    admin: persistReducer(adminPersistConfig, adminReducer),
    app: appReducer,
    user: userReducer,
    navbarCart: persistReducer(navbarCartPersistConfig, navbarCartReducer),
    productR: productReducer,
    order: persistReducer(orderPersistConfig, orderReducer),
    userDetail: userDetailReducer,
    userAddress: userAddressReducer,
    shop: shopReducer,
  });
export default rootReducer;
