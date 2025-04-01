import React from "react";
import { connect } from "react-redux";
import "./CartPage.scss";
import remove_icon from "../../assets/images/icons/cross_icon.png";
import { removeFromCart } from "../../store/actions/navbarCartActions";
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
        {props.products.map((e, i) => {
          if (props.carts[e.id] > 0) {
            return (
              <React.Fragment key={i}>
                <div className="cartpage-format cartpage-format-main">
                  <img className="cartpage-product-icon" src={e.image} alt="" />
                  <p>{e.name}</p>
                  <p>${e.priceCents}</p>
                  <button className="cartpage-quantity">
                    {props.carts[e.id]}
                  </button>
                  <p>${e.priceCents * props.carts[e.id]}</p>
                  <img
                    className="cartpage-remove-icon"
                    src={remove_icon}
                    onClick={() => {
                      props.removeFromCart({
                        id: e.id,
                        quantity: props.carts[e.id],
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
  return { removeFromCart: (payload) => dispatch(removeFromCart(payload)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartPage);
