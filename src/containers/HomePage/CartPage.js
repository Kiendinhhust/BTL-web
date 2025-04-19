import React from "react";
import { connect } from "react-redux";
import "./CartPage.scss";
import remove_icon from "../../assets/images/icons/cross_icon.png";
import {
  removeAllCart,
  removeFromCart,
  updateCart,
  updateQuantity,
} from "../../store/actions/navbarCartActions";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { makeOrder } from "../../store/actions/orderActions";
const CartPage = (props) => {
  const history = useHistory();
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in props.carts) {
      if (item.quantity > 0) {
        totalAmount += item.price * item.quantity;
      }
    }
    return totalAmount;
  };
  const handleUpdate = (e, id) => {
    props.updateCart({
      quantity: e.target.value,
      id,
    });
    props.updateQuantity();
  };
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  return (
    <div className="cartpage">
      <div className="cartpage-format-main ">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      <div>
        {props.carts.map((item, i) => {
          return (
            <React.Fragment key={i}>
              <div className="cartpage-format cartpage-format-main">
                <img
                  className="cartpage-product-icon"
                  src={item.info.image_url}
                  alt=""
                />
                <p>{item.title}</p>
                <p>{item.info.price} VNĐ</p>
                <input
                  value={item.quantity}
                  onChange={(e) => handleUpdate(e, item.info.item_id)}
                  className="cartpage-quantity"
                />
                <p>{item.info.price * item.quantity} VNĐ</p>
                <img
                  className="cartpage-remove-icon"
                  src={remove_icon}
                  onClick={() => {
                    props.removeFromCart({
                      id: item.info.item_id,
                    });
                    props.updateQuantity();
                  }}
                  alt=""
                />
              </div>
              <hr />
            </React.Fragment>
          );
        })}
        <div className="cartpage-down">
          <div className="cartpage-total">
            <h1>Cart Totals</h1>
            <div>
              <div className="cartpage-total-item">
                <p>Subtotal</p>
                <p>{getTotalCartAmount()} VNĐ</p>
              </div>
              <hr />
              <div className="cartpage-total-item">
                <p>Shipping Fee</p>
                <p>Free</p>
              </div>
              <hr />
            </div>
            <div className="cartpage-total-item">
              <h3>Total</h3>
              <h3>{getTotalCartAmount()} VNĐ</h3>
            </div>

            <button
              onClick={() => {
                const orderId = generateUUID();
                const orderProducts = { ...props.carts };
                props.makeOrder({
                  orderProducts,
                  orderId,
                });
                props.removeAllCart();
                history.push(`/order/${orderId}`);
              }}
              className="cartpage-checkout"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
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
    orderProducts: state.order.orderProducts,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    removeFromCart: (payload) => dispatch(removeFromCart(payload)),
    updateCart: (payload) => dispatch(updateCart(payload)),
    updateQuantity: () => dispatch(updateQuantity()),
    removeAllCart: () => dispatch(removeAllCart()),
    makeOrder: (payload) => dispatch(makeOrder(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartPage);
