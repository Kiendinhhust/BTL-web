import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/navbarCartActions";
import "./ItemShop.scss";
const ItemShop = (props) => {
  const info = props.item;
  // console.log(info);
  // const product = props.products.find((product) => product.product_id === id);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  console.log(props.item);
  const handleUpdate = () => {
    setState((prevState) => {
      prevState.timeOut && clearTimeout(prevState.timeOut);
      const timeOut = setTimeout(() => {
        setState((prevState) => ({ checkCheckMark: false }));
      }, 1000);
      return {
        checkCheckMark: true,
        timeOut,
      };
    });
    // props.addToCart({ quantity: cartQuantity, info, title: product.title });
  };
  useEffect(() => {
    return () => {
      clearTimeout(state.timeOut);
    };
  }, [state.timeOut]);

  return (
    <div className="itemshop-container">
      <div className="itemshop-image-container">
        <img
          className="itemshop-image"
          loading="lazy"
          src={info?.image_url}
          alt={info?.sku}
        />
      </div>

      <div className="itemshop-name">{info?.sku}</div>

      <div className="itemshop-price">
        {Number(info?.price).toLocaleString("vi-VN")} VNĐ
      </div>
      {state.checkCheckMark === true ? (
        <div className={`added-to-cart js-added-to-cart-${props.product_id}`}>
          <img className="itemshop-checkmark" src={checkmark} alt="checkmark" />
          <span className="itemshop-added">Updated</span>
        </div>
      ) : (
        <br className={`added-to-cart js-added-to-cart-${props.product_id}`} />
      )}

      <button
        className={`addToCart-button button-primary js-add-to-cart`}
        onClick={() => handleUpdate()}
      >
        Update
      </button>

      {/* Phần này là tùy chọn, bạn có thể thêm nếu muốn hiển thị thông tin chi tiết hơn */}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    cartQuantity: state.navbarCart.quantity,
    products: state.productR.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (payload) => dispatch(addToCart(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemShop);
