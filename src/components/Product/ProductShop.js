import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import checkmark from "../../assets/images/icons/checkmark.png";

import cross_icon from "../../assets/images/icons/cross_icon.png";
import { removeProduct } from "../../store/actions/productActions";
import "./ProductShop.scss";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import productImageNull from "../../assets/images/icons/product.png";
import axios from "axios";
import { accessToken, LoginHack } from "../../containers/System/LoginHack";
const ProductShop = (props) => {
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [info, setInfo] = useState(null);
  const [productTitle, setProductTitle] = useState(props.product.title);
  const [productDescription, setProductDescription] = useState(
    props.product.description
  );
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
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
  };
  const handleProductTitle = (e) => {
    setProductTitle(e.target.value);
    // Thực hiện các xử lý khác nếu cần
  };
  const handleProductDescription = (e) => {
    setProductDescription(e.target.value);
    // Thực hiện các xử lý khác nếu cần
  };
  const handleProductRemove = async (id) => {
    await LoginHack;
    await axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
        },
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    history.push(window.location.pathname + window.location.search);
  };
  const handleProductUpdate = async (id) => {
    await LoginHack;
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/products/${id}`,
        {
          title: productTitle,
          description: productDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        }
      )
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    handleUpdate();
    // history.push(window.location.pathname + window.location.search);
  };
  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BACKEND_URL}/api/products/item/${props.product.product_id}`,
    }).then((response) => {
      setItems(response.data);
      setInfo(response.data[0]);
    });
  }, [props.product.product_id]);
  return (
    <div className="productshop-container">
      <div className="productshop-image-container">
        {/* <img
          className="productshop-image"
          loading="lazy"
          src={info?.image_url || null}
          alt={props.productshop.title}
          onClick={() =>
            history.push(
              `/productdetail?product=${encodeURIComponent(
                JSON.stringify(props.product)
              )}&items=${encodeURIComponent(JSON.stringify(items))}`
            )
          }
        /> */}
        <img
          className="productshop-image"
          src={info?.image_url || productImageNull}
          onClick={() =>
            history.push(
              `/system/item-manage?product_id=${props.product.product_id}&shop_id=${props.shop_id}`
            )
          }
          alt="info?.sku"
        />
      </div>
      <div className="productshop-name">Name</div>
      <input
        className="productshop-name limit-text-to-2-lines"
        value={productTitle}
        onChange={handleProductTitle}
      />
      <div className="productshop-name">Description</div>
      <input
        className="productshop-name limit-text-to-2-lines"
        value={productDescription}
        onChange={handleProductDescription}
      />
      {/* <div className="productshop-price">
        {Number(info?.price).toLocaleString("vi-VN")} VNĐ
      </div> */}

      <div className="productshop-attributes-container">
        {items.slice(0, 2).map((item, index) => {
          const key = Object.keys(item?.attributes);
          const isSelected = info?.item_id === item?.item_id; // Kiểm tra xem item này có đang được chọn không

          return (
            <button
              key={index}
              className={`productshop-attributes-button ${
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
        {items.length > 2 ? (
          <button className="productshop-etc">...</button>
        ) : null}
      </div>
      {state.checkCheckMark === true ? (
        <div className={`added-to-cart js-added-to-cart-${props.product_id}`}>
          <img className="itemshop-checkmark" src={checkmark} alt="checkmark" />
          <span className="itemshop-added">Updated</span>
        </div>
      ) : (
        <br className={`added-to-cart js-added-to-cart-${props.product_id}`} />
      )}
      <div className={`productshop-manageitem-container`}>
        <button
          className={`productshop-manageitem`}
          onClick={() =>
            history.push(
              `/system/item-manage?product_id=${props.product.product_id}&shop_id=${props.shop_id}`
            )
          }
        >
          Manage Item
        </button>

        <button
          className={`productshop-manageitem`}
          onClick={() => handleProductUpdate(props.product.product_id)}
        >
          Update
        </button>
      </div>

      <img
        onClick={() => {
          handleProductRemove(props.product.product_id);
        }}
        className="productshop-remove-icon"
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductShop);
