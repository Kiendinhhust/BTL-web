import React from "react";
import { connect } from "react-redux";
import cross_icon from "../../assets/images/icons/cross_icon.png";
import { removeProduct } from "../../store/actions/productActions";
import "./Product.scss";
const ProductAdmin = (props) => {
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
        {(props.priceCents / 1000).toFixed(3)} VNĐ
      </div>
      <img
        onClick={() => {
          props.removeProduct({ id: props.id });
        }}
        className="listproduct-remove-icon"
        src={cross_icon}
        alt=""
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return { removeProduct: (payload) => dispatch(removeProduct(payload)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductAdmin);
