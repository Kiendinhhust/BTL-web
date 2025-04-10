import React from "react";
import { connect } from "react-redux";
import "./MyOrder.scss";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import OneOrder from "./OneOrder";
const MyOrder = (props) => {
  return (
    <div className="myOrder">
      {Object.entries(props.orders)
        .reverse()
        .map(([orderId, order]) => {
          // console.log(order);
          return (
            <React.Fragment key={orderId}>
              <h1 className="myOrder-title">Order: {orderId}</h1>
              <OneOrder order={order} />
              <hr className="dash" />
            </React.Fragment>
          );
        })}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MyOrder));
