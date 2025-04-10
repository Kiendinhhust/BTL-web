import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/navbarCartActions";
import "./ProductDetail.scss";
const ProductDetail = (props) => {
  const id = props.match.params.id;
  const product = props.products.find((product) => product.id === id);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [cartQuantity, setCartQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("content");
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };
  const handleAddToCart = (id) => {
    setState((prevState) => {
      prevState.timeOut && clearTimeout(prevState.timeOut);
      const timeOut = setTimeout(() => {
        setState((prevState) => ({ checkCheckMark: "" }));
      }, 1000);
      return {
        checkCheckMark: id,
        timeOut,
      };
    });
    props.addToCart({ quantity: cartQuantity, id });
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
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="productdetail-info">
        <div className="productdetail-name limit-text-to-2-lines">
          {product.name}
        </div>

        <div className="productdetail-rating-container">
          <div className="productdetail-rating-count link-primary">
            Product rating count: {product.rating.count}
          </div>
        </div>

        <div className="productdetail-price">
          {product.priceCents.toLocaleString("vi-VN")} VNĐ
        </div>

        <div className="productdetail-quantity-container">
          <label>Số lượng:</label>
          <select
            value={cartQuantity}
            onChange={(e) => setCartQuantity(e.target.value)}
            className={`select-container js-quantity-selector-${product.id}`}
          >
            {[...Array(10).keys()].map((i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        {product.id === state.checkCheckMark ? (
          <div className={`added-to-cart js-added-to-cart-${product.id}`}>
            <img
              className="productdetail-checkmark"
              src={checkmark}
              alt="checkmark"
            />
            <span className="productdetail-added">Added</span>
          </div>
        ) : (
          <br className={`added-to-cart js-added-to-cart-${product.id}`} />
        )}

        <button
          className={`addToCart-button button-primary js-add-to-cart`}
          data-products-id={product.id}
          onClick={() => handleAddToCart(product.id)}
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
