import React from "react";
import ReactDOM from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import "./styles/styles.scss";
import { ConnectedRouter } from "connected-react-router";
import App from "./containers/App";
import * as serviceWorker from "./serviceWorker";
import IntlProviderWrapper from "./hoc/IntlProviderWrapper";
import { PersistGate } from "redux-persist/integration/react";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import reduxStore, { persistor, history } from "./redux";

const renderApp = () => {
  ReactDOM.render(
    <Provider store={reduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <IntlProviderWrapper>
          <ConnectedRouter history={history}>
            <App persistor={persistor} />
          </ConnectedRouter>
        </IntlProviderWrapper>
      </PersistGate>
    </Provider>,
    document.getElementById("root")
  );
};

renderApp();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
