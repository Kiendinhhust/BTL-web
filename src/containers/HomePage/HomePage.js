import React, { Component, useState } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Header from "./Header"; // Đảm bảo đường dẫn đúng tới file Header.js
import { products } from "../../assets/data/products";
import "./HomePage.scss";
import checkmark from "../../assets/images/icons/checkmark.png";
class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkCheckmark: false,
      cartValue: 0, // Khởi tạo state
      timeOut: null,
    };
  }
  handleAddToCart = (id, event) => {
    const itemValue = event.target
      .closest(".product-container")
      ?.querySelector(".product-quantity-container select")?.value;
    this.setState((prevState) => {
      prevState.timeOut && clearTimeout(prevState.timeOut);
      const timeOut = setTimeout(() => {
        this.setState((prevState) => ({ checkCheckmark: "" }));
      }, 1000);
      return {
        checkCheckmark: id,
        timeOut,
        cartValue: (prevState.cartValue += itemValue),
      };
    });
  };
  render() {
    return (
      <div className="products-container">
        {products.map((product) => (
          <div key={product.id} className="product-container">
            <div className="product-image-container">
              <img
                className="product-image"
                src={product.image}
                alt={product.name}
              />
            </div>
            <div className="product-name limit-text-to-2-lines">
              {product.name}
            </div>
            <div className="product-rating-container">
              <img
                className="product-rating-stars"
                src={`images/ratings/rating-${product.rating.stars * 10}.png`}
                alt=""
              />
              <div className="product-rating-count link-primary">
                Product rating count: {product.rating.count}
              </div>
            </div>
            <div className="product-price">
              {(product.priceCents / 1000).toFixed(3)} VNĐ
            </div>
            <div className="product-quantity-container">
              <select className={`js-quantity-selector-${product.id}`}>
                {[...Array(10).keys()].map((i) => (
                  <option key={i} value={i + 1} selected={i === 0}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            {product.id === this.state.checkCheckmark && (
              <div className={`added-to-cart js-added-to-cart-${product.id}`}>
                <img
                  className="product-checkmark"
                  src={checkmark}
                  alt="checkmark"
                />{" "}
                Added
              </div>
            )}
            <button
              className={`add-to-cart-button button-primary js-add-to-cart `}
              data-product-id={product.id}
              onClick={(event) => {
                this.handleAddToCart(product.id, event);
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.admin.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
