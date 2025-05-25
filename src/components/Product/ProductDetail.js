import React, { useEffect, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import {
  addToCart,
  updateCart,
  updateQuantity,
} from "../../store/actions/navbarCartActions";
import "./ProductDetail.scss";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import productImageNull from "../../assets/images/icons/product.png";
import { getImageByPublicId } from "../../services/storeService";
import { addItemToCart, getCart } from "../../services/cartService";
import { toast } from "react-toastify";

const ProductDetail = (props) => {
  const location = useLocation();

  // Tạo đối tượng URLSearchParams từ location.search
  const query = new URLSearchParams(location.search);
  const product = JSON.parse(query.get("product"));
  const items = JSON.parse(query.get("items"));
  const [info, setInfo] = useState(null);
  const [processedItems, setProcessedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [cartQuantity, setCartQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("content");

  // Process items to get image URLs
  useEffect(() => {
    const processItems = async () => {
      if (!items || !Array.isArray(items)) {
        setProcessedItems([]);
        setLoading(false);
        return;
      }

      try {
        const processed = await Promise.all(
          items.map(async (item) => {
            if (!item) return null;

            let imageUrl = null;

            if (item.image_url) {
              try {
                const imageResult = await getImageByPublicId(item.image_url);
                if (imageResult.success) {
                  imageUrl = imageResult.url;
                }
              } catch (imgError) {
                console.error("Error fetching item image:", imgError);
              }
            }

            return {
              ...item,
              imageUrl,
            };
          })
        );

        // Filter out any null items
        const filteredItems = processed.filter((item) => item !== null);

        setProcessedItems(filteredItems);

        // Set the first item as default if available
        if (filteredItems.length > 0) {
          setInfo(filteredItems[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error processing items:", error);
        setProcessedItems([]);
        setLoading(false);
      }
    };

    processItems();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleAddToCart = async () => {
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
    console.log(totalQuantity);
    props.updateQuantity({ quantity: totalQuantity });
  };

  useEffect(() => {
    return () => {
      if (state.timeOut) {
        clearTimeout(state.timeOut);
      }
    };
  }, [state.timeOut]);

  // Safely format price to avoid NaN
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString("vi-VN");
  };

  return (
    <div className="productdetail-container">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      ) : (
        <>
          <div className="productdetail-image-container">
            <img
              className="productdetail-image"
              loading="lazy"
              src={info?.imageUrl || info?.image_url || productImageNull}
              alt={product.title}
            />
          </div>

          <div className="productdetail-info">
            <div className="productdetail-name limit-text-to-2-lines">
              {product.title}
            </div>

            <div className="productdetail-shop">
              <i className="fas fa-store"></i>
              <span>
                {product.Shop?.shop_name || "Cửa hàng không xác định"}
              </span>
            </div>

            <div className="productdetail-rating-container">
              <div className="stars-container">
                {[...Array(5)].map((_, index) => (
                  <i
                    key={index}
                    className={`fas fa-star ${
                      index < Math.round(product.rating || 0) ? "filled" : ""
                    }`}
                  ></i>
                ))}
                <span className="rating-value">({product.rating || 0})</span>
              </div>
            </div>

            <div className="productdetail-price">
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
                <span>{formatPrice(info?.price)} VNĐ</span>
              )}
            </div>

            <div className="productdetail-stock">
              <i className="fas fa-cubes"></i>
              <span>Còn lại: {info?.stock || 0}</span>
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

            <div className="variant-details">
              {info && info.sku && (
                <div className="variant-sku">
                  <span className="label">SKU:</span>
                  <span className="value">{info.sku}</span>
                </div>
              )}

              {info &&
                info.attributes &&
                Object.keys(info.attributes).length > 0 && (
                  <div className="variant-attributes">
                    {Object.entries(info.attributes).map(
                      ([key, value], idx) => (
                        <div key={idx} className="attribute-item">
                          <span className="attribute-key">{key}:</span>
                          <span className="attribute-value">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>

            <div className="product-attributes-container">
              <div className="attributes-title">Chọn biến thể:</div>
              <div className="attributes-buttons">
                {processedItems.map((item, index) => {
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
                })}
              </div>
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
                className={`tab-button ${
                  activeTab === "content" ? "active" : ""
                }`}
                onClick={() => handleTabChange("content")}
              >
                Mô tả
              </button>
              <button
                className={`tab-button ${
                  activeTab === "detail" ? "active" : ""
                }`}
                onClick={() => handleTabChange("detail")}
              >
                Thông số kỹ thuật
              </button>
              <button
                className={`tab-button ${
                  activeTab === "comment" ? "active" : ""
                }`}
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
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    cartQuantity: state.navbarCart.quantity,
    products: state.productR.products,
    userInfo: state.admin.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (payload) => dispatch(addToCart(payload)),
    updateQuantity: (payload) => dispatch(updateQuantity(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail);
