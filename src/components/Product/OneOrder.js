import React from "react";
import { connect } from "react-redux";
import "./OneOrder.scss";
const OneOrder = (props) => {
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const id in props.order) {
      if (props.order[id] > 0) {
        let itemInfo = props.products.find((product) => product.id === id);
        totalAmount += itemInfo.priceCents * props.order[id];
      }
    }
    return totalAmount;
  };

  return (
    <div className="oneOrder">
      <div className="oneOrder-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
      </div>
      <hr />
      <div>
        {props.products.map((item, i) => {
          if (props.order[item.id] > 0) {
            return (
              <React.Fragment key={i}>
                <div className="oneOrder-format oneOrder-format-main">
                  <img
                    className="oneOrder-product-icon"
                    src={item.image}
                    alt=""
                  />
                  <p>{item.name}</p>
                  <p>{item.priceCents} VNĐ</p>
                  <button className="oneOrder-quantity">
                    {props.order[item.id]}
                  </button>
                  <p>{item.priceCents * props.order[item.id]} VNĐ</p>
                </div>
                <hr />
              </React.Fragment>
            );
          }
          return null;
        })}
        <div className="oneOrder-down">
          <div className="oneOrder-total">
            <h1>Cart Totals</h1>
            <div>
              <div className="oneOrder-total-item">
                <p>Subtotal</p>
                <p>{getTotalCartAmount()} VNĐ</p>
              </div>
              <hr />
              <div className="oneOrder-total-item">
                <p>Shipping Fee</p>
                <p>Free</p>
              </div>
              <hr />
            </div>
            <div className="oneOrder-total-item">
              <h3>Total</h3>
              <h3>{getTotalCartAmount()} VNĐ</h3>
            </div>
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
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(OneOrder);
