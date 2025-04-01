import React, { Component } from "react";
import { connect } from "react-redux";
import ProductAdmin from "../../components/Product/ProductAdmin";
class ProductManage extends Component {
  render() {
    return (
      <div className="products-container">
        {this.props.products.map((product) => (
          <ProductAdmin
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
    products: state.productR.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductManage);
