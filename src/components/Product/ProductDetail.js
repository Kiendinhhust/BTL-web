import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/navbarCartActions";
import "./ProductDetail.scss";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
const ProductDetail = (props) => {
  const location = useLocation();

  // Tạo đối tượng URLSearchParams từ location.search
  const query = new URLSearchParams(location.search);
  const product = JSON.parse(query.get("product"));
  const items = JSON.parse(query.get("items"));
  const [info, setInfo] = useState(items[0]);
  // console.log(info);
  // const product = props.products.find((product) => product.product_id === id);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [cartQuantity, setCartQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("content");
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };
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
    props.addToCart({ quantity: cartQuantity, info, title: product.title });
  };
  useEffect(() => {
    return () => {
      clearTimeout(state.timeOut);
    };
  }, [state.timeOut]);

  return (
    <div className="productdetail-container">
      <div className="productdetail-image-container">
        <img
          className="productdetail-image"
          loading="lazy"
          src={info?.image_url}
          alt={product.title}
        />
      </div>

      <div className="productdetail-info">
        <div className="productdetail-name limit-text-to-2-lines">
          {product.title}
        </div>

        <div className="productdetail-rating-container">
          <div className="productdetail-rating-count link-primary">
            Product rating count: {product.rating}
          </div>
        </div>

        <div className="productdetail-price">
          {info?.price.toLocaleString("vi-VN")} VNĐ
        </div>

        <div className="productdetail-quantity-container">
          <label>Số lượng:</label>
          <select
            value={cartQuantity}
            onChange={(e) => setCartQuantity(e.target.value)}
            className={`select-container js-quantity-selector-${product.product_id}`}
          >
            {[...Array(10).keys()].map((i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="product-attributes-container">
          {items.map((item, index) => {
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
        </div>
        {state.checkCheckMark === true ? (
          <div
            className={`added-to-cart js-added-to-cart-${product.product_id}`}
          >
            <img
              className="productdetail-checkmark"
              src={checkmark}
              alt="checkmark"
            />
            <span className="productdetail-added">Added</span>
          </div>
        ) : (
          <br
            className={`added-to-cart js-added-to-cart-${product.product_id}`}
          />
        )}

        <button
          className={`addToCart-button button-primary js-add-to-cart`}
          onClick={() => handleAddToCart()}
        >
          Add to Cart
        </button>
      </div>

      {/* Phần này là tùy chọn, bạn có thể thêm nếu muốn hiển thị thông tin chi tiết hơn */}
      <div className="productdetail-tabs">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === "content" ? "active" : ""}`}
            onClick={() => handleTabChange("content")}
          >
            Mô tả
          </button>
          <button
            className={`tab-button ${activeTab === "detail" ? "active" : ""}`}
            onClick={() => handleTabChange("detail")}
          >
            Thông số kỹ thuật
          </button>
          <button
            className={`tab-button ${activeTab === "comment" ? "active" : ""}`}
            onClick={() => handleTabChange("comment")}
          >
            Đánh giá
          </button>
        </div>
        {activeTab === "content" && (
          <div className="tab-content active">
            <p>{product.description}</p>
          </div>
        )}
        {activeTab === "detail" && (
          <div className="tab-content active">
            <p>Detail.</p>
          </div>
        )}
        {activeTab === "comment" && (
          <div className="tab-content active">
            <p>Comment.</p>
          </div>
        )}
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail);
