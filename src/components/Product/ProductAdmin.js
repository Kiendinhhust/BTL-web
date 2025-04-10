import React from "react";
import { connect } from "react-redux";
import cross_icon from "../../assets/images/icons/cross_icon.png";
import { removeProduct } from "../../store/actions/productActions";
import "./ProductAdmin.scss";
const ProductAdmin = (props) => {
  return (
    <div className="productadmin-container">
      <div className="productadmin-image-container">
        <img
          className="productadmin-image"
          src={props.image}
          alt={props.name}
        />
      </div>
      <div className="productadmin-name limit-text-to-2-lines">
        {props.name}
      </div>
      <div className="productadmin-rating-container">
        <img
          className="productadmin-rating-stars"
          src={`images/ratings/rating-${props.rating.stars * 10}.png`}
          alt=""
        />
        <div className="productadmin-rating-count link-primary">
          Product rating count: {props.rating.count}
        </div>
      </div>
      <div className="productadmin-price">
        {props.priceCents.toLocaleString("vi-VN")} VNĐ
      </div>

      <img
        onClick={() => {
          props.removeProduct({ id: props.id });
        }}
        className="productadmin-remove-icon"
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
