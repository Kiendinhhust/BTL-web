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

    for (const id in props.carts) {
      if (props.carts[id] > 0) {
        console.log(props.carts[id]);
        let itemInfo = props.products.find((product) => product.id === id);
        totalAmount += itemInfo.priceCents * props.carts[id];
      }
    }
    return totalAmount;
  };
  const handleUpdate = (e, id) => {
    console.log("handleUpdate ID:", id);
    console.log("handleUpdate Quantity:", e.target.value);
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
        {props.products.map((item, i) => {
          if (props.carts[item.id] > 0) {
            return (
              <React.Fragment key={i}>
                <div className="cartpage-format cartpage-format-main">
                  <img
                    className="cartpage-product-icon"
                    src={item.image}
                    alt=""
                  />
                  <p>{item.name}</p>
                  <p>{item.priceCents} VNĐ</p>
                  <input
                    value={props.carts[item.id]}
                    onChange={(e) => handleUpdate(e, item.id)}
                    className="cartpage-quantity"
                  />
                  <p>{item.priceCents * props.carts[item.id]} VNĐ</p>
                  <img
                    className="cartpage-remove-icon"
                    src={remove_icon}
                    onClick={() => {
                      props.removeFromCart({
                        id: item.id,
                        quantity: props.carts[item.id],
                      });
                    }}
                    alt=""
                  />
                </div>
                <hr />
              </React.Fragment>
            );
          }
          return null;
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
