import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast, Slide } from "react-toastify";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../services/cartService";
import { getImageByPublicId } from "../../services/storeService";
import { createOrder, getShippingMethods } from "../../services/orderService";
import { getUserAddresses } from "../../store/actions/userAddressAction";
import "./CartPage.scss";
import productImageNull from "../../assets/images/icons/product.png";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import {
  addToCart,
  updateQuantity,
} from "../../store/actions/navbarCartActions";
const CartPage = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNote, setOrderNote] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment, 4: Review
  const [processingOrder, setProcessingOrder] = useState(false);
  const history = useHistory();
  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      // Check if user is logged in and has an access token
      const accessToken = props.userInfo?.accessToken;
      if (!accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await getCart();
        console.log("Cart data:", result);

        if (result.success) {
          // The server now returns items directly in the result.data.items
          setCartItems(result.data.items || []);
        } else {
          toast.error(result.error || "Không thể tải giỏ hàng", {
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
        // const totalQuantity = result.data.items.reduce(
        //   (sum, item) => sum + item.quantity, // `quantity` là giá trị của mỗi sản phẩm
        //   0
        // );
        // console.log(totalQuantity);
        // props.updateQuantity({ quantity: totalQuantity });
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Đã xảy ra lỗi khi tải giỏ hàng", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [props.userInfo]);
  useEffect(() => {
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity, // `quantity` là giá trị của mỗi sản phẩm
      0
    );
    console.log(totalQuantity);
    props.updateQuantity({ quantity: totalQuantity });
  }, [cartItems]);

  // Load images for cart items
  useEffect(() => {
    const loadImages = async () => {
      const newImageCache = { ...imageCache };
      let cacheUpdated = false;

      for (const item of cartItems) {
        if (item.image_url && !newImageCache[item.image_url]) {
          try {
            const imageResult = await getImageByPublicId(item.image_url);
            if (imageResult.success) {
              newImageCache[item.image_url] = imageResult.url;
              cacheUpdated = true;
            }
          } catch (error) {
            console.error(
              `Error loading image for item ${item.item_id}:`,
              error
            );
          }
        }
      }

      if (cacheUpdated) {
        setImageCache(newImageCache);
      }
    };

    if (cartItems.length > 0) {
      loadImages();
    }
  }, [cartItems, imageCache]);

  // Handle quantity change
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Check if user is logged in and has an access token
    const accessToken = props.userInfo?.accessToken;
    if (!accessToken) {
      toast.warning("Vui lòng đăng nhập để cập nhật giỏ hàng", {
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

    const result = await updateCartItem({
      item_id: itemId,
      quantity: newQuantity,
      // No need to include user_id, it will be extracted from the JWT token
    });

    if (result.success) {
      // Update local state
      setCartItems(
        cartItems.map((item) =>
          item.item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Cập nhật số lượng thành công", {
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
      toast.error(result.error || "Không thể cập nhật số lượng", {
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
  };

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    // Check if user is logged in and has an access token
    const accessToken = props.userInfo?.accessToken;
    if (!accessToken) {
      toast.warning("Vui lòng đăng nhập để cập nhật giỏ hàng", {
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

    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")
    ) {
      try {
        const result = await removeCartItem(itemId);

        if (result.success) {
          // Update local state
          setCartItems(cartItems.filter((item) => item.item_id !== itemId));
          toast.success("Đã xóa sản phẩm khỏi giỏ hàng", {
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
          toast.error(result.error || "Không thể xóa sản phẩm", {
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
        console.error("Error removing item from cart:", error);
        toast.error("Đã xảy ra lỗi khi xóa sản phẩm", {
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
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    // Check if user is logged in and has an access token
    const accessToken = props.userInfo?.accessToken;
    if (!accessToken) {
      toast.warning("Vui lòng đăng nhập để cập nhật giỏ hàng", {
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

    if (
      window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")
    ) {
      try {
        const result = await clearCart();

        if (result.success) {
          setCartItems([]);
          toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng", {
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
          toast.error(result.error || "Không thể xóa giỏ hàng", {
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
        console.error("Error clearing cart:", error);
        toast.error("Đã xảy ra lỗi khi xóa giỏ hàng", {
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
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.sale_price || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString("vi-VN");
  };

  // Fetch shipping methods
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const result = await getShippingMethods();
        console.log("Shipping methods response:", result);

        if (result.success && result.data && result.data.success) {
          // Extract the methods array from the nested response
          const methods = result.data.methods || [];
          console.log("Shipping methods:", methods);

          setShippingMethods(methods);

          // Set default shipping method if available
          if (methods.length > 0) {
            setSelectedShippingMethod(parseInt(methods[0].shipping_method_id));
          }
        } else {
          console.error(
            "Error fetching shipping methods:",
            result.error || "Unknown error"
          );
          toast.error("Không thể tải phương thức vận chuyển", {
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
        console.error("Error fetching shipping methods:", error);
        toast.error("Đã xảy ra lỗi khi tải phương thức vận chuyển", {
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
    };

    // Only fetch shipping methods when moving to shipping step
    if (checkoutStep === 2) {
      fetchShippingMethods();
    }
  }, [checkoutStep]);

  // Fetch user addresses
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        // Make sure we have a userId
        if (!props.userInfo || !props.userInfo.userId) {
          console.error("No userId available");
          toast.error(
            "Không thể tải địa chỉ giao hàng: Không có thông tin người dùng",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeButton: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
          return;
        }

        console.log("Fetching addresses for userId:", props.userInfo.userId);

        // Use the getUserAddresses action to fetch addresses with userId
        const result = await props.getUserAddresses(props.userInfo.userId);
        console.log("User addresses response:", result);

        if (result && result.data && result.data.length > 0) {
          console.log("User addresses:", result.data);
          setUserAddresses(result.data);

          // Always set the first address as default
          setShippingAddress(parseInt(result.data[0].address_id));

          // Log the selected address for debugging
          console.log(
            "Selected shipping address ID:",
            result.data[0].address_id
          );
        } else {
          // If no addresses found, show a message
          console.warn("No addresses found or error in response:", result);
          toast.warning(
            "Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeButton: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
        }
      } catch (error) {
        console.error("Error fetching user addresses:", error);
        toast.error("Đã xảy ra lỗi khi tải địa chỉ giao hàng", {
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
    };

    // Only fetch user addresses when moving to shipping step
    if (checkoutStep === 2) {
      fetchUserAddresses();
    }
  }, [checkoutStep, props.userInfo]);

  // Handle moving to next checkout step
  const handleNextStep = () => {
    setCheckoutStep((prevStep) => prevStep + 1);
  };

  // Handle moving to previous checkout step
  const handlePrevStep = () => {
    setCheckoutStep((prevStep) => prevStep - 1);
  };

  // Handle shipping method selection
  const handleShippingMethodChange = (e) => {
    setSelectedShippingMethod(parseInt(e.target.value));
  };

  // Handle shipping address selection
  const handleShippingAddressChange = (e) => {
    const addressId = parseInt(e.target.value);
    console.log("Selected shipping address ID:", addressId);
    setShippingAddress(addressId);
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle order note change
  const handleOrderNoteChange = (e) => {
    setOrderNote(e.target.value);
  };

  // Handle checkout
  const handleCheckout = () => {
    // Start checkout process by moving to shipping step
    setCheckoutStep(2);
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng", {
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

    if (!selectedShippingMethod) {
      toast.error("Vui lòng chọn phương thức vận chuyển", {
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

    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán", {
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

    // Prepare order data
    const orderData = {
      shipping_address_id: shippingAddress, // This should be the address_id from UserAddress
      shipping_method_id: selectedShippingMethod,
      payment_method: paymentMethod,
      note: orderNote,
      items: cartItems.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
      })),
      clear_cart: true, // Clear cart after order is created
    };

    console.log("Placing order with data:", orderData);

    setProcessingOrder(true);

    try {
      const result = await createOrder(orderData);

      if (result.success) {
        toast.success("Đặt hàng thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        // Redirect to order details page
        history.push(`/orders/${result.data.order.order_id}`);
      } else {
        toast.error(result.error || "Đặt hàng thất bại. Vui lòng thử lại.", {
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
      console.error("Error placing order:", error);
      toast.error("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Render different content based on checkout step
  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 1: // Cart
        return (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.item_id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={imageCache[item.image_url] || productImageNull}
                      alt={item.product_title || "Product"}
                    />
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">{item.product_title}</h3>

                    {item.shop_name && (
                      <div className="item-shop">
                        <i className="fas fa-store"></i>
                        <span>{item.shop_name}</span>
                      </div>
                    )}

                    {item.sku && (
                      <div className="item-sku">
                        <span className="label">SKU:</span>
                        <span className="value">{item.sku}</span>
                      </div>
                    )}

                    {item.attributes && (
                      <div className="item-attributes">
                        {Object.entries(
                          typeof item.attributes === "string"
                            ? JSON.parse(item.attributes)
                            : item.attributes
                        ).map(([key, value], idx) => (
                          <div key={idx} className="attribute-item">
                            <span className="attribute-key">{key}:</span>
                            <span className="attribute-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="item-price">
                    {item.sale_price ? (
                      <>
                        <span className="original-price">
                          {formatPrice(item.price)} VNĐ
                        </span>
                        <span className="sale-price">
                          {formatPrice(item.sale_price)} VNĐ
                        </span>
                      </>
                    ) : (
                      <span>{formatPrice(item.price)} VNĐ</span>
                    )}
                  </div>

                  <div className="item-quantity">
                    <button
                      className="quantity-btn decrease"
                      onClick={() =>
                        handleQuantityChange(item.item_id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>

                    <span className="quantity-value">{item.quantity}</span>

                    <button
                      className="quantity-btn increase"
                      onClick={() =>
                        handleQuantityChange(item.item_id, item.quantity + 1)
                      }
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>

                  <div className="item-total">
                    {formatPrice(
                      (item.sale_price || item.price) * item.quantity
                    )}{" "}
                    VNĐ
                  </div>

                  <button
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.item_id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span className="summary-label">Tổng tiền:</span>
                <span className="summary-value">
                  {formatPrice(calculateTotal())} VNĐ
                </span>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Tiến hành thanh toán
              </button>

              <button
                className="continue-shopping-btn"
                onClick={() => history.push("/")}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </>
        );

      case 2: // Shipping
        return (
          <div className="checkout-step shipping-step">
            <h2>Thông tin giao hàng</h2>

            <div className="checkout-section">
              <h3>Địa chỉ giao hàng</h3>
              {userAddresses.length > 0 ? (
                <div className="address-selection">
                  {userAddresses.map((address) => (
                    <div
                      key={address.address_id}
                      className={`address-option ${
                        shippingAddress === parseInt(address.address_id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setShippingAddress(parseInt(address.address_id))
                      }
                    >
                      <input
                        type="radio"
                        id={`address-${address.address_id}`}
                        name="shipping-address"
                        value={address.address_id}
                        checked={
                          shippingAddress === parseInt(address.address_id)
                        }
                        onChange={handleShippingAddressChange}
                      />
                      <label htmlFor={`address-${address.address_id}`}>
                        <div className="address-details">
                          <p className="address-type">
                            {address.type === "home"
                              ? "Nhà riêng"
                              : address.type === "office"
                              ? "Văn phòng"
                              : "Địa chỉ khác"}
                          </p>
                          <p className="address-line">
                            {address.address_infor}
                          </p>
                          {shippingAddress === parseInt(address.address_id) && (
                            <p className="address-selected">✓ Đã chọn</p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-addresses">
                  <p>Bạn chưa có địa chỉ giao hàng nào.</p>
                  <button className="add-address-btn">Thêm địa chỉ mới</button>
                </div>
              )}
            </div>

            <div className="checkout-section">
              <h3>Phương thức vận chuyển</h3>
              {shippingMethods.length > 0 ? (
                <div className="shipping-method-selection">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.shipping_method_id}
                      className={`shipping-method-option ${
                        selectedShippingMethod ===
                        parseInt(method.shipping_method_id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedShippingMethod(
                          parseInt(method.shipping_method_id)
                        )
                      }
                    >
                      <input
                        type="radio"
                        id={`method-${method.shipping_method_id}`}
                        name="shipping-method"
                        value={method.shipping_method_id}
                        checked={
                          selectedShippingMethod ===
                          parseInt(method.shipping_method_id)
                        }
                        onChange={handleShippingMethodChange}
                      />
                      <label htmlFor={`method-${method.shipping_method_id}`}>
                        <div className="method-details">
                          <p className="method-name">{method.name}</p>
                          <p className="method-description">
                            {method.description}
                          </p>
                          <p className="method-delivery">
                            Thời gian giao hàng: {method.min_delivery_days} -{" "}
                            {method.max_delivery_days} ngày
                          </p>
                          <p className="method-cost">
                            {formatPrice(method.cost)} VNĐ
                          </p>
                          {selectedShippingMethod ===
                            parseInt(method.shipping_method_id) && (
                            <p className="method-selected">✓ Đã chọn</p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-shipping-methods">
                  <p>Không có phương thức vận chuyển nào khả dụng.</p>
                </div>
              )}
            </div>

            <div className="checkout-buttons">
              <button className="back-btn" onClick={handlePrevStep}>
                Quay lại
              </button>
              <button className="next-btn" onClick={handleNextStep}>
                Tiếp tục
              </button>
            </div>
          </div>
        );

      case 3: // Payment
        return (
          <div className="checkout-step payment-step">
            <h2>Phương thức thanh toán</h2>

            <div className="payment-methods">
              <div className="payment-method-option">
                <input
                  type="radio"
                  id="payment-cod"
                  name="payment-method"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="payment-cod">
                  <div className="method-details">
                    <p className="method-name">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="method-description">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </label>
              </div>

              <div className="payment-method-option">
                <input
                  type="radio"
                  id="payment-credit-card"
                  name="payment-method"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="payment-credit-card">
                  <div className="method-details">
                    <p className="method-name">Thẻ tín dụng/Ghi nợ</p>
                    <p className="method-description">
                      Thanh toán an toàn với thẻ của bạn
                    </p>
                  </div>
                </label>
              </div>

              <div className="payment-method-option">
                <input
                  type="radio"
                  id="payment-e-wallet"
                  name="payment-method"
                  value="e_wallet"
                  checked={paymentMethod === "e_wallet"}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="payment-e-wallet">
                  <div className="method-details">
                    <p className="method-name">Ví điện tử</p>
                    <p className="method-description">
                      Thanh toán qua ví điện tử (MoMo, ZaloPay, VNPay...)
                    </p>
                  </div>
                </label>
              </div>

              <div className="payment-method-option">
                <input
                  type="radio"
                  id="payment-bank-transfer"
                  name="payment-method"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="payment-bank-transfer">
                  <div className="method-details">
                    <p className="method-name">Chuyển khoản ngân hàng</p>
                    <p className="method-description">
                      Thanh toán bằng chuyển khoản ngân hàng
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="order-note">
              <h3>Ghi chú đơn hàng</h3>
              <textarea
                placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
                value={orderNote}
                onChange={handleOrderNoteChange}
              ></textarea>
            </div>

            <div className="checkout-buttons">
              <button className="back-btn" onClick={handlePrevStep}>
                Quay lại
              </button>
              <button className="next-btn" onClick={handleNextStep}>
                Xem lại đơn hàng
              </button>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="checkout-step review-step">
            <h2>Xác nhận đơn hàng</h2>

            <div className="review-section">
              <h3>Sản phẩm</h3>
              <div className="review-items">
                {cartItems.map((item) => (
                  <div key={item.item_id} className="review-item">
                    <div className="item-image">
                      <img
                        src={imageCache[item.image_url] || productImageNull}
                        alt={item.product_title || "Product"}
                      />
                    </div>
                    <div className="item-info">
                      <p className="item-title">{item.product_title}</p>
                      <p className="item-sku">SKU: {item.sku}</p>
                      {item.attributes && (
                        <div className="item-attributes">
                          {Object.entries(
                            typeof item.attributes === "string"
                              ? JSON.parse(item.attributes)
                              : item.attributes
                          ).map(([key, value], idx) => (
                            <span key={idx} className="attribute-item">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="item-quantity">
                      <span>SL: {item.quantity}</span>
                    </div>
                    <div className="item-price">
                      {formatPrice(
                        (item.sale_price || item.price) * item.quantity
                      )}{" "}
                      VNĐ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="review-section">
              <h3>Địa chỉ giao hàng</h3>
              {userAddresses.find(
                (addr) => parseInt(addr.address_id) === shippingAddress
              ) && (
                <div className="review-address">
                  {(() => {
                    const address = userAddresses.find(
                      (addr) => parseInt(addr.address_id) === shippingAddress
                    );
                    return (
                      <>
                        <p className="address-type">
                          {address.type === "home"
                            ? "Nhà riêng"
                            : address.type === "office"
                            ? "Văn phòng"
                            : "Địa chỉ khác"}
                        </p>
                        <p className="address-line">{address.address_infor}</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="review-section">
              <h3>Phương thức vận chuyển</h3>
              {shippingMethods.find(
                (method) =>
                  parseInt(method.shipping_method_id) === selectedShippingMethod
              ) && (
                <div className="review-shipping-method">
                  {(() => {
                    const method = shippingMethods.find(
                      (m) =>
                        parseInt(m.shipping_method_id) ===
                        selectedShippingMethod
                    );
                    return (
                      <>
                        <p className="method-name">{method.name}</p>
                        <p className="method-delivery">
                          Thời gian giao hàng: {method.min_delivery_days} -{" "}
                          {method.max_delivery_days} ngày
                        </p>
                        <p className="method-cost">
                          {formatPrice(method.cost)} VNĐ
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="review-section">
              <h3>Phương thức thanh toán</h3>
              <div className="review-payment-method">
                {(() => {
                  switch (paymentMethod) {
                    case "cod":
                      return <p>Thanh toán khi nhận hàng (COD)</p>;
                    case "credit_card":
                      return <p>Thẻ tín dụng/Ghi nợ</p>;
                    case "e_wallet":
                      return <p>Ví điện tử</p>;
                    case "bank_transfer":
                      return <p>Chuyển khoản ngân hàng</p>;
                    default:
                      return <p>Chưa chọn phương thức thanh toán</p>;
                  }
                })()}
              </div>
            </div>

            {orderNote && (
              <div className="review-section">
                <h3>Ghi chú đơn hàng</h3>
                <div className="review-note">
                  <p>{orderNote}</p>
                </div>
              </div>
            )}

            <div className="review-summary">
              <div className="summary-row">
                <span className="summary-label">Tổng tiền hàng:</span>
                <span className="summary-value">
                  {formatPrice(calculateTotal())} VNĐ
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">
                  {shippingMethods.find(
                    (method) =>
                      parseInt(method.shipping_method_id) ===
                      selectedShippingMethod
                  )
                    ? formatPrice(
                        shippingMethods.find(
                          (method) =>
                            parseInt(method.shipping_method_id) ===
                            selectedShippingMethod
                        ).cost
                      )
                    : "0"}{" "}
                  VNĐ
                </span>
              </div>

              <div className="summary-row total">
                <span className="summary-label">Tổng thanh toán:</span>
                <span className="summary-value">
                  {formatPrice(
                    calculateTotal() +
                      (shippingMethods.find(
                        (method) =>
                          parseInt(method.shipping_method_id) ===
                          selectedShippingMethod
                      )
                        ? parseFloat(
                            shippingMethods.find(
                              (method) =>
                                parseInt(method.shipping_method_id) ===
                                selectedShippingMethod
                            ).cost
                          )
                        : 0)
                  )}{" "}
                  VNĐ
                </span>
              </div>
            </div>

            <div className="checkout-buttons">
              <button className="back-btn" onClick={handlePrevStep}>
                Quay lại
              </button>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={processingOrder}
              >
                {processingOrder ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>
          {checkoutStep === 1 && "Giỏ hàng của bạn"}
          {checkoutStep === 2 && "Thông tin giao hàng"}
          {checkoutStep === 3 && "Phương thức thanh toán"}
          {checkoutStep === 4 && "Xác nhận đơn hàng"}
        </h1>
        {checkoutStep === 1 && cartItems.length > 0 && (
          <button className="clear-cart-btn" onClick={handleClearCart}>
            <i className="fas fa-trash-alt"></i> Xóa tất cả
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      ) : cartItems.length === 0 && checkoutStep === 1 ? (
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <p>Giỏ hàng của bạn đang trống</p>
          <button
            className="continue-shopping-btn"
            onClick={() => history.push("/")}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        renderCheckoutStep()
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: state.admin.userInfo,
  cart: state.navbarCart.carts,
});

const mapDispatchToProps = (dispatch) => ({
  getUserAddresses: (userId) => dispatch(getUserAddresses(userId)),
  addToCart: (payload) => dispatch(addToCart(payload)),
  updateQuantity: (payload) => dispatch(updateQuantity(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CartPage);
