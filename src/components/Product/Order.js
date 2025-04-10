import React from "react";
import { connect } from "react-redux";
import "./Order.scss";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import OneOrder from "./OneOrder";
const Order = (props) => {
  const order = props.orders[props.match.params.id];
  console.log(order);
  return (
    <div className="order">
      <h1 className="order-title">Payment Successful</h1>
      <OneOrder order={order} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.admin.isLoggedIn,
    search: state.navbarCart.search,
    carts: state.navbarCart.carts,
    cartQuantity: state.navbarCart.quantity,
    products: state.productR.products,
    orders: state.order.orders,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Order));
