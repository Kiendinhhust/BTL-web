import React from "react";
import { connect } from "react-redux";
import "./HomePage.scss";
import Product from "../../components/Product/Product";
const HomePage = (props) => {
  const filteredProducts = props.products.filter((product) =>
    product.name.toLowerCase().includes(props.search.toLowerCase())
  );
  return (
    <div className="products-container">
      {filteredProducts.map((product) => (
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
};

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.admin.isLoggedIn,
    search: state.navbarCart.search,
    products: state.productR.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
