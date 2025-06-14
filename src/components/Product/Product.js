import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import {
  addToCart,
  updateQuantity,
} from "../../store/actions/navbarCartActions";
import "./Product.scss";
import productImageNull from "../../assets/images/icons/product.png";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { toast } from "react-toastify";
import { addItemToCart, getCart } from "../../services/cartService";

const Product = (props) => {
  const history = useHistory();
  const [info, setInfo] = useState(null);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [cartQuantity, setCartQuantity] = useState(1);

  // Use items passed from HomePage
  const items = Array.isArray(props.items) ? props.items : [];
  // console.log("Items:", items);
  useEffect(() => {
    // console.log("Product items:", items);

    // Set the first item as default if available
    if (items && items.length > 0 && !info) {
      setInfo(items[0]);
    }
  }, [items, info]);

  // Safely format price to avoid NaN
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString("vi-VN");
  };
  const handleAddToCart = async () => {
    setState((prevState) => {
      console.log(items);
      // Clear previous timeout if exists
      if (prevState.timeOut) {
        clearTimeout(prevState.timeOut);
      }

      // Set new timeout
      const timeOut = setTimeout(() => {
        setState(() => ({ checkCheckMark: false, timeOut: null }));
      }, 100000);

      return {
        checkCheckMark: true,
        timeOut,
      };
    });
    if (!info || !info.item_id) {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    // Check if user is logged in and has an access token
    const accessToken = props.userInfo?.accessToken;
    if (!accessToken) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    // Show visual feedback
    setState((prevState) => {
      if (prevState.timeOut) {
        clearTimeout(prevState.timeOut);
      }
      const timeOut = setTimeout(() => {
        setState(() => ({ checkCheckMark: false, timeOut: null }));
      }, 1000);
      return {
        checkCheckMark: true,
        timeOut,
      };
    });

    // Add to Redux store for UI updates
    // props.addToCart({ quantity: cartQuantity, info, title: product.title });

    // Add to server-side cart using cartService
    try {
      const cartItem = {
        item_id: info.item_id,
        quantity: parseInt(cartQuantity),
        // No need to include user_id, it will be extracted from the JWT token
      };

      const result = await addItemToCart(cartItem);

      if (result.success) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else {
        toast.error(result.error || "Không thể thêm sản phẩm vào giỏ hàng", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    const cartRes = await getCart();
    const totalQuantity = cartRes.data.items.reduce(
      (sum, item) => sum + item.quantity, // `quantity` là giá trị của mỗi sản phẩm
      0
    );
    // console.log(totalQuantity);
    props.updateQuantity({ quantity: totalQuantity });
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
          src={info?.imageUrl || info?.image_url || productImageNull}
          alt={`${info?.sku || ""} ${info?.attributes?.["Màu"] || ""} ${
            info?.attributes?.Size || ""
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
      <div className="product-name">{props.product.title}</div>

      <div className="product-shop">
        <i className="fas fa-store"></i>
        <span>
          {props.product.Shop?.shop_name || "Cửa hàng không xác định"}
        </span>
      </div>

      <div className="product-rating-container">
        <div className="stars-container">
          {[...Array(5)].map((_, index) => (
            <i
              key={index}
              className={`fas fa-star ${
                index < Math.round(props.product.rating || 0) ? "filled" : ""
              }`}
            ></i>
          ))}
          <span className="rating-value">({props.product.rating || 0})</span>
        </div>
      </div>
      <div className="product-price">
        {info?.sale_price ? (
          <>
            <span className="original-price">
              {formatPrice(info.price)} VNĐ
            </span>
            <span className="sale-price">
              {formatPrice(info.sale_price)} VNĐ
            </span>
          </>
        ) : (
          <>
            <span className="original-price">
              <div></div>
            </span>
            <span>{formatPrice(info?.price)} VNĐ</span>
          </>
        )}
      </div>
      <div className="product-stock">
        <i className="fas fa-cubes"></i>
        <span>Còn lại: {info?.stock || 0}</span>
      </div>
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
      <div className="product-variant-info">
        {info && (
          <div className="variant-details">
            {info.attributes && Object.keys(info.attributes).length > 0 && (
              <div className="variant-attributes">
                {Object.entries(info.attributes).map(([key, value], idx) => (
                  <div key={idx} className="attribute-item">
                    <span className="attribute-key">{key}:</span>
                    <span className="attribute-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="product-attributes-container">
        <div className="attributes-title">Chọn biến thể:</div>
        <div className="attributes-buttons">
          {Array.isArray(items) && items.length > 0 ? (
            items
              .slice(0, 2)
              .filter((item) => item.stock > 0)
              .map((item, index) => {
                // Get attribute values for display
                let displayText = item.sku || `Biến thể ${index + 1}`;

                if (
                  item.attributes &&
                  Object.keys(item.attributes).length > 0
                ) {
                  const attributeValues = Object.values(item.attributes);
                  if (attributeValues.length > 0) {
                    displayText = attributeValues.join(" - ");
                  }
                }

                const isSelected = info?.item_id === item?.item_id;

                return (
                  <button
                    key={index}
                    className={`product-attributes-button ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setInfo(item)}
                    title={`${item.sku || ""} - ${formatPrice(
                      item.price
                    )} VNĐ - SL: ${item.stock || 0}`}
                  >
                    {displayText}
                  </button>
                );
              })
          ) : (
            <div className="no-variants">Không có biến thể</div>
          )}
          {items.length === 0 && <div style={{ height: "48px" }} />}
          {items.length > 2 ? (
            <button className="product-etc">...</button>
          ) : null}
        </div>
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
      <div className="addToCart-container">
        {items.filter((item) => item.stock > 0).length > 0 && (
          <button
            className={`addToCart-button button-primary js-add-to-cart`}
            onClick={() => handleAddToCart()}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    cartQuantity: state.navbarCart.quantity,
    userInfo: state.admin.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (payload) => dispatch(addToCart(payload)),
    updateQuantity: (payload) => dispatch(updateQuantity(payload)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(Product));
