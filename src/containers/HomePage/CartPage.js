import React, { useEffect } from "react";
import { connect } from "react-redux";
import "./CartPage.scss";
import remove_icon from "../../assets/images/icons/cross_icon.png";
import {
  removeFromCart,
  updateCart,
  updateQuantity,
} from "../../store/actions/navbarCartActions";
import { dispatch } from "../../redux";
const CartPage = (props) => {
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const id in props.carts) {
      if (props.carts[id] > 0) {
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
                  <p>${item.priceCents}</p>
                  <input
                    value={props.carts[item.id]}
                    onChange={(e) => handleUpdate(e, item.id)}
                    className="cartpage-quantity"
                  />
                  <p>${item.priceCents * props.carts[item.id]}</p>
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
                <p>${getTotalCartAmount()}</p>
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
              <h3>${getTotalCartAmount()}</h3>
            </div>
            <button>PROCEED TO CHECKOUT</button>
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    removeFromCart: (payload) => dispatch(removeFromCart(payload)),
    updateCart: (payload) => dispatch(updateCart(payload)),
    updateQuantity: () => dispatch(updateQuantity()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartPage);
