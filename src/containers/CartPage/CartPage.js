import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../../services/cartService';
import { getImageByPublicId } from '../../services/storeService';
import './CartPage.scss';
import productImageNull from '../../assets/images/icons/product.png';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const CartPage = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});
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
        console.log('Cart data:', result);

        if (result.success) {
          // The server now returns items directly in the result.data.items
          setCartItems(result.data.items || []);
        } else {
          toast.error(result.error || 'Không thể tải giỏ hàng');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Đã xảy ra lỗi khi tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [props.userInfo]);

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
            console.error(`Error loading image for item ${item.item_id}:`, error);
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
      toast.warning('Vui lòng đăng nhập để cập nhật giỏ hàng');
      return;
    }

    const result = await updateCartItem({
      item_id: itemId,
      quantity: newQuantity
      // No need to include user_id, it will be extracted from the JWT token
    });

    if (result.success) {
      // Update local state
      setCartItems(cartItems.map(item =>
        item.item_id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      toast.success('Cập nhật số lượng thành công');
    } else {
      toast.error(result.error || 'Không thể cập nhật số lượng');
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    // Check if user is logged in and has an access token
    const accessToken = props.userInfo?.accessToken;
    if (!accessToken) {
      toast.warning('Vui lòng đăng nhập để cập nhật giỏ hàng');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      try {
        const result = await removeCartItem(itemId);

        if (result.success) {
          // Update local state
          setCartItems(cartItems.filter(item => item.item_id !== itemId));
          toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } else {
          toast.error(result.error || 'Không thể xóa sản phẩm');
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        toast.error('Đã xảy ra lỗi khi xóa sản phẩm');
      }
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    // Check if user is logged in and has an access token
    const accessToken = props.userInfo?.accessToken;
    if (!accessToken) {
      toast.warning('Vui lòng đăng nhập để cập nhật giỏ hàng');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      try {
        const result = await clearCart();

        if (result.success) {
          setCartItems([]);
          toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
        } else {
          toast.error(result.error || 'Không thể xóa giỏ hàng');
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Đã xảy ra lỗi khi xóa giỏ hàng');
      }
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.sale_price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString("vi-VN");
  };

  // Handle checkout
  const handleCheckout = () => {
    // Navigate to checkout page or show checkout modal
    history.push('/checkout');
  };

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        {cartItems.length > 0 && (
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
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <p>Giỏ hàng của bạn đang trống</p>
          <button className="continue-shopping-btn" onClick={() => history.push('/')}>
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.item_id} className="cart-item">
                <div className="item-image">
                  <img
                    src={imageCache[item.image_url] || productImageNull}
                    alt={item.product_title || 'Product'}
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
                        typeof item.attributes === 'string'
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
                      <span className="original-price">{formatPrice(item.price)} VNĐ</span>
                      <span className="sale-price">{formatPrice(item.sale_price)} VNĐ</span>
                    </>
                  ) : (
                    <span>{formatPrice(item.price)} VNĐ</span>
                  )}
                </div>

                <div className="item-quantity">
                  <button
                    className="quantity-btn decrease"
                    onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>

                  <span className="quantity-value">{item.quantity}</span>

                  <button
                    className="quantity-btn increase"
                    onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>

                <div className="item-total">
                  {formatPrice((item.sale_price || item.price) * item.quantity)} VNĐ
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
              <span className="summary-value">{formatPrice(calculateTotal())} VNĐ</span>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Tiến hành thanh toán
            </button>

            <button className="continue-shopping-btn" onClick={() => history.push('/')}>
              Tiếp tục mua sắm
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    userInfo: state.admin.userInfo
  };
};

export default connect(mapStateToProps)(CartPage);
