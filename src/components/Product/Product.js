import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/navbarCartActions";
import "./Product.scss";

const Product = (props) => {
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [cartQuantity, setCartQuantity] = useState(1);

  const handleAddToCart = (id) => {
    setState((prevState) => {
      prevState.timeOut && clearTimeout(prevState.timeOut);
      const timeOut = setTimeout(() => {
        setState((prevState) => ({ checkCheckMark: "" }));
      }, 1000);
      return {
        checkCheckMark: id,
        timeOut,
      };
    });
    props.addToCart({ quantity: cartQuantity, id });
  };

  useEffect(() => {
    return () => {
      clearTimeout(state.timeOut);
    };
  }, [state.timeOut]);

  return (
    <div className="props-container">
      <div className="product-image-container">
        <img className="product-image" src={props.image} alt={props.name} />
      </div>
      <div className="product-name limit-text-to-2-lines">{props.name}</div>
      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          src={`images/ratings/rating-${props.rating.stars * 10}.png`}
          alt=""
        />
        <div className="product-rating-count link-primary">
          Product rating count: {props.rating.count}
        </div>
      </div>
      <div className="product-price">
        {props.priceCents.toLocaleString("vi-VN")} VNĐ
      </div>
      <div className="product-quantity-container">
        <select
          value={cartQuantity}
          onChange={(e) => setCartQuantity(e.target.value)}
          className={`select-container js-quantity-selector-${props.id}`}
        >
          {[...Array(10).keys()].map((i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      {props.id === state.checkCheckMark && (
        <div className={`added-to-cart js-added-to-cart-${props.id}`}>
          <img className="product-checkmark" src={checkmark} alt="checkmark" />{" "}
          Added
        </div>
      )}
      <button
        className={`addToCart-button button-primary js-add-to-cart`}
        data-products-id={props.id}
        onClick={() => handleAddToCart(props.id)}
      >
        Add to Cart
      </button>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    cartQuantity: state.navbarCart.quantity,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (payload) => dispatch(addToCart(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Product);
