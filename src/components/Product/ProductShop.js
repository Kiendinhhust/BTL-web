import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import cross_icon from "../../assets/images/icons/cross_icon.png";
import { removeProduct } from "../../store/actions/productActions";
import "./ProductShop.scss";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
const ProductShop = (props) => {
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [info, setInfo] = useState(null);
  const [inputValue, setInputValue] = useState(props.product.title);
  const handleInput = (content) => {
    setInputValue(content);
    // Thực hiện các xử lý khác nếu cần
  };
  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BACKEND_URL}/api/products/item/${props.product.product_id}`,
    }).then((response) => {
      setItems(response.data);
      setInfo(response.data[0]);
      console.log(response.data[0]);
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
          src={info?.image_url}
          alt="info?.sku"
        />
      </div>
      <div
        className="productshop-name limit-text-to-2-lines"
        contentEditable={true}
        onInput={(e) => handleInput(e.target.textContent)}
      >
        {props.product.title}
      </div>
      {/* <div className="productshop-price">
        {info?.price.toLocaleString("vi-VN")} VNĐ
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
        <button className={`productshop-manageitem`} onClick={() => {}}>
          Update
        </button>
      </div>

      <img
        onClick={() => {
          // props.removeProduct({ id: props.id });
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
