import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import "./MyOrder.scss";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import { fetchOrder } from "../../store/actions/orderActions";
import { accessToken, LoginHack } from "../../containers/System/LoginHack";
import axios from "axios";

const MyOrder = (props) => {
  const hasCalledAPI = useRef(false);
  useEffect(() => {
    const fetchOrderFun = async () => {
      let fetchOrder;
      await LoginHack;
      await axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/order/my-order`, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        })
        .then((res) => {
          fetchOrder = res.data.products;
        })
        .catch(function (error) {
          console.log(error);
        });
      props.fetchOrder({ orders: fetchOrder });
      // console.log("FETCH", props.orders);
    };
    if (!hasCalledAPI.current) {
      fetchOrderFun();
      hasCalledAPI.current = true;
    }
  }, [props]);
  return (
    <div className="myOrder">
      {/* {props.orders.reverse().map((order, index) => {
        // console.log(order);
        return (
          <React.Fragment key={order?.order_id}>
            <h1 className="myOrder-title">Order: {order?.order_id}</h1>
            <OneOrder order={order} />
            <hr className="dash" />
          </React.Fragment>
        );
      })} */}
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
  return { fetchOrder: (payload) => dispatch(fetchOrder(payload)) };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MyOrder));
