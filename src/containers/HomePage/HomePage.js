import React, { Component, useState } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Header from "./Header"; // Đảm bảo đường dẫn đúng tới file Header.js
import { products } from "../../assets/data/products";
import "./HomePage.scss";
import Product from "../../components/Product/Product";
class HomePage extends Component {
  render() {
    return (
      <div className="products-container">
        {products.map((product) => (
          <Product
            key={product.id}
            id={product.id}
            rating={product.rating}
            name={product.name}
            image={product.image}
            priceCents={product.priceCents}
            keywords={product.keywords}
          />
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
