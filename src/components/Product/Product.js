import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/navbarCartActions";
import "./Product.scss";
import productImageNull from "../../assets/images/icons/product.png";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";

const Product = (props) => {
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [info, setInfo] = useState(null);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [cartQuantity, setCartQuantity] = useState(1);
  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BACKEND_URL}/api/products/item/${props.product.product_id}`,
      withCredentials: true,
    }).then((response) => {
      setItems(response.data);
      setInfo(response.data[0]);
      console.log(response.data[0]);
    });
  }, [props.product.product_id]);
  const handleAddToCart = () => {
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
    props.addToCart({
      quantity: cartQuantity,
      info,
      title: props.product.title,
    });
  };
  useEffect(() => {
    return () => {
      clearTimeout(state.timeOut);
    };
  }, [state.timeOut]);

  return (
    <div className="product-container">
      <div className="product-image-container">
        <img
          className="product-image"
          loading="lazy"
          src={info?.image_url || productImageNull}
          alt={`${info?.sku || ""} ${info?.attributes["Màu"] || ""} ${
            info?.attributes.Size || ""
          }`}
          onClick={() =>
            history.push(
              `/productdetail?product=${encodeURIComponent(
                JSON.stringify(props.product)
              )}&items=${encodeURIComponent(JSON.stringify(items))}`
            )
          }
        />
      </div>
      <div className="product-name limit-text-to-2-lines">
        {props.product.title}
      </div>
      <div className="product-rating-container">
        <div className="product-rating-count link-primary">
          Product rating count: {props.product.rating}
        </div>
      </div>
      {/* <div className="product-price">
        {info?.priceCents.toLocaleString("vi-VN")} VNĐ
      </div> */}
      <div className="product-quantity-container">
        <select
          value={cartQuantity}
          onChange={(e) => setCartQuantity(e.target.value)}
          className={`select-container js-quantity-selector-${info?.id}`}
        >
          {[...Array(10).keys()].map((i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      <div className="product-attributes-container">
        {items.slice(0, 2).map((item, index) => {
          const key = Object.keys(item?.attributes);
          const isSelected = info?.item_id === item?.item_id; // Kiểm tra xem item này có đang được chọn không

          return (
            <button
              key={index}
              className={`product-attributes-button ${
                isSelected ? "selected" : ""
              }`}
              onClick={() => setInfo(item)}
            >
              {key.length > 0 && item?.attributes[key[0]]
                ? item?.attributes[key[0]]
                : ""}
              {key.length > 1 && item?.attributes[key[1]]
                ? ` - ${item?.attributes[key[1]]}`
                : ""}
            </button>
          );
        })}
        {items.length > 2 ? <button className="product-etc">...</button> : null}
      </div>
      {state.checkCheckMark === true ? (
        <div
          className={`added-to-cart js-added-to-cart-${props.product.product_id}`}
        >
          <img className="product-checkmark" src={checkmark} alt="checkmark" />{" "}
          <span className="product-added">Added</span>
        </div>
      ) : (
        <br
          className={`added-to-cart js-added-to-cart-${props.product.product_id}`}
        />
      )}
      <button
        className={`addToCart-button button-primary js-add-to-cart`}
        onClick={() => handleAddToCart()}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(Product));
