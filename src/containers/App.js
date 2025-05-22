import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import { ConnectedRouter as Router } from "connected-react-router";
import { history } from "../redux";
import { ToastContainer } from "react-toastify";
import {
  userIsAuthenticated,
  userIsNotAuthenticated,
} from "../hoc/authentication";
import { path } from "../utils";
import Login from "../routes/Login";
import Header from "./Header/Header";
import System from "../routes/System";
import SellerSystem from "../routes/SellerSystem";
import BuyerSystem from "../routes/BuyerSystem";
import Register from "../routes/Register.js";
import VerifyOTP from "../routes/VerifyOTP.js";
import HomePage from "./HomePage/HomePage.js";
import CartPage from "./CartPage/CartPage.js";
import MyOrders from '../containers/MyOrders/MyOrders'
import Order from "../components/Product/Order";
import ProductDetail from "../components/Product/ProductDetail";
import { default as HomePageHeader } from "./HomePage/Header.js";
import { CustomToastCloseButton } from "../components/CustomToast";
import ConfirmModal from "../components/ConfirmModal";
import Footer from "./Footer/Footer";
import "./App.scss";

import ItemManage from "./System/ItemManage.js";

class App extends Component {
  handlePersistorState = () => {
    const { persistor } = this.props;
    let { bootstrapped } = persistor.getState();
    if (bootstrapped) {
      if (this.props.onBeforeLift) {
        Promise.resolve(this.props.onBeforeLift())
          .then(() => this.setState({ bootstrapped: true }))
          .catch(() => this.setState({ bootstrapped: true }));
      } else {
        this.setState({ bootstrapped: true });
      }
    }
  };

  componentDidMount() {
    this.handlePersistorState();
  }

  componentDidUpdate(prevProps) {}

  render() {
    const { location } = this.props;
    const excludedRoutes = ["/login", "/register", "/verify-otp"];
    return (
      <Fragment>
        <Router history={history}>
          <div className="main-container">
            <ConfirmModal />

            {!excludedRoutes.includes(location.pathname) &&
              (this.props.isLoggedIn ? <Header /> : <HomePageHeader />)}

            <div className="content-container">
              <div className="custom-scrollbar">
                <Switch>
                  <Route
                    path={path.LOGIN}
                    component={userIsNotAuthenticated(Login)}
                  />
                  <Route
                    path={path.REGISTER}
                    component={userIsNotAuthenticated(Register)}
                  />
                  <Route
                    path={path.VERIFY_OTP}
                    component={userIsNotAuthenticated(VerifyOTP)}
                  />
                  <Route
                    path={path.SYSTEM}
                    component={userIsAuthenticated(System)}
                  />
                 
                  <Route
                    path={"/system/item-manage"}
                    component={userIsAuthenticated(ItemManage)}
                  />
                  <Route path={path.CART} component={CartPage} />
                  <Route path={"/myorders"} component={MyOrders} />
                  <Route
                    path={"/order/:id"}
                    component={userIsNotAuthenticated(Order)}
                  />
                  <Route path={"/productdetail"} component={ProductDetail} />
                  <Route
                    path={path.SELLER}
                    component={userIsAuthenticated(SellerSystem)}
                  />
                  <Route
                    path={path.BUYER}
                    component={userIsAuthenticated(BuyerSystem)}
                  />
                  <Route path={path.HOME} exact component={HomePage} />
                  <Route path={path.HOMEPAGE} component={HomePage} />

                  <Route component={() => <Redirect to="/" />} />
                </Switch>

                <div className="page-content">{/* Nội dung trang */}</div>

                {/* Footer luôn ở cuối trang */}
                {!excludedRoutes.includes(location.pathname) && <Footer />}
              </div>
            </div>

            <ToastContainer
              className="toast-container"
              toastClassName="toast-item"
              bodyClassName="toast-item-body"
              autoClose={false}
              hideProgressBar={true}
              pauseOnHover={false}
              pauseOnFocusLoss={true}
              closeOnClick={false}
              draggable={false}
              closeButton={<CustomToastCloseButton />}
            />
          </div>
        </Router>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    started: state.app.started,
    isLoggedIn: state.admin.isLoggedIn,
    userInfo: state.admin.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // Các action có thể được thêm vào đây nếu cần
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
