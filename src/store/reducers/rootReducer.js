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

const persistCommonConfig = {
  storage: storage,
  stateReconciler: autoMergeLevel2,
};

const adminPersistConfig = {
  ...persistCommonConfig,
  key: "admin",
  whitelist: ["isLoggedIn", "adminInfo"],
};

const rootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    admin: persistReducer(adminPersistConfig, adminReducer),
    user: userReducer,
    app: appReducer,
    navbarCart: navbarCartReducer,
    productR: productReducer,
  });
export default rootReducer;
