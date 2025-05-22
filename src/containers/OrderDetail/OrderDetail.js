import './OrderDetail.scss';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrderDetails } from '../../services/orderService';
import { getImageByPublicId } from '../../services/storeService';;


const OrderDetail = (props) => {
  const { orderId } = useParams();
  const history = useHistory();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState({});

  // Fetch order details when component mounts
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const result = await getOrderDetails(orderId);
      console.log('Order details result:', result);

      if (result.success && result.data) {
        setOrder(result.data);

        // Fetch images for order items
        if (result.data.orderItems && result.data.orderItems.length > 0) {
          fetchOrderImages(result.data.orderItems);
        }
      } else {
        toast.error(result.error || 'Không thể tải thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Đã xảy ra lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch images for order items
  const fetchOrderImages = async (orderItems) => {
    const newImageCache = { ...imageCache };

    for (const item of orderItems) {
      if (item.item_image_url && !newImageCache[item.item_image_url]) {
        try {
          const imageResult = await getImageByPublicId(item.item_image_url);
          if (imageResult.success && imageResult.data) {
            newImageCache[item.item_image_url] = imageResult.data.url;
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      }
    }

    setImageCache(newImageCache);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString('vi-VN');
  };

  // Get status class and text
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { class: 'status-pending', text: 'Chờ xác nhận' };
      case 'processing':
        return { class: 'status-processing', text: 'Đang xử lý' };
      case 'shipped':
        return { class: 'status-shipped', text: 'Đang giao hàng' };
      case 'delivered':
        return { class: 'status-delivered', text: 'Đã giao hàng' };
      case 'canceled':
        return { class: 'status-canceled', text: 'Đã hủy' };
      default:
        return { class: 'status-unknown', text: status };
    }
  };

  // Get payment method text
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'credit_card':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'e_wallet':
        return 'Ví điện tử';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      default:
        return method;
    }
  };

  // Get payment status text
  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'refunded':
        return 'Đã hoàn tiền';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return status;
    }
  };

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button className="back-btn" onClick={() => history.push('/buyer/my-orders')}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <h1>Chi tiết đơn hàng</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      ) : !order ? (
        <div className="no-order">
          <i className="fas fa-exclamation-circle"></i>
          <p>Không tìm thấy thông tin đơn hàng</p>
          <Link to="/buyer/my-orders" className="back-to-orders-btn">Quay lại danh sách đơn hàng</Link>
        </div>
      ) : (
          <div className="order-detail-content">
            <div className="order-info-section">
              <div className="order-header-info">
                <div className="order-basic-info">
                  <h2>Đơn hàng #{order.order_code}</h2>
                  <p className="order-date">Ngày đặt: {formatDate(order.created_at)}</p>
                </div>
                <div className={`order-status ${getStatusInfo(order.status).class}`}>
                  {getStatusInfo(order.status).text}
                </div>
              </div>

              <div className="order-shop-info">
                <i className="fas fa-store"></i>
                <span>{order.shop?.shop_name || 'Cửa hàng không xác định'}</span>
              </div>
            </div>

            <div className="order-items-section">
              <h3>Sản phẩm</h3>
              <div className="order-items-list">
                {order.orderItems && order.orderItems.map(item => (
                  <div key={item.order_item_id} className="order-item">
                    <div className="item-image">
                      <img
                        src={imageCache[item.item_image_url] || '/images/product-placeholder.png'}
                        alt={item.item_name || 'Sản phẩm'}
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.item_name}</p>
                      {item.item_attributes && (
                        <div className="item-attributes">
                          {Object.entries(
                            typeof item.item_attributes === 'string'
                              ? JSON.parse(item.item_attributes)
                              : item.item_attributes
                          ).map(([key, value], idx) => (
                            <span key={idx} className="attribute-item">
                              {key}: {value}
                            </span>
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
                        <span className="regular-price">{formatPrice(item.price)} VNĐ</span>
                      )}
                    </div>
                    <div className="item-quantity">
                      x{item.quantity}
                    </div>
                    <div className="item-total">
                      {formatPrice((item.sale_price || item.price) * item.quantity)} VNĐ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-details-grid">
              <div className="shipping-info-section">
                <h3>Thông tin giao hàng</h3>
                {order.orderShipping ? (
                  <div className="shipping-details">
                    <div className="shipping-address">
                      <h4>Địa chỉ giao hàng</h4>
                      {order.orderShipping.shippingAddress ? (
                        <div className="address-info">
                          <p className="address-type">
                            {order.orderShipping.shippingAddress.type === 'home' ? 'Nhà riêng' :
                             order.orderShipping.shippingAddress.type === 'office' ? 'Văn phòng' : 'Địa chỉ khác'}
                          </p>
                          <p className="address-line">{order.orderShipping.shippingAddress.address_infor}</p>
                        </div>
                      ) : (
                        <p className="no-address">Không có thông tin địa chỉ</p>
                      )}
                    </div>

                    <div className="shipping-method">
                      <h4>Phương thức vận chuyển</h4>
                      {order.orderShipping.shippingMethod ? (
                        <div className="method-info">
                          <p className="method-name">{order.orderShipping.shippingMethod.name}</p>
                          <p className="method-delivery">
                            Thời gian giao hàng: {order.orderShipping.shippingMethod.min_delivery_days} - {order.orderShipping.shippingMethod.max_delivery_days} ngày
                          </p>
                          <p className="method-cost">{formatPrice(order.orderShipping.shipping_cost)} VNĐ</p>
                        </div>
                      ) : (
                        <p className="no-method">Không có thông tin phương thức vận chuyển</p>
                      )}
                    </div>

                    {order.orderShipping.tracking_number && (
                      <div className="tracking-info">
                        <h4>Mã vận đơn</h4>
                        <p className="tracking-number">{order.orderShipping.tracking_number}</p>
                      </div>
                    )}

                    <div className="shipping-status">
                      <h4>Trạng thái vận chuyển</h4>
                      <div className={`status-badge ${getStatusInfo(order.orderShipping.status).class}`}>
                        {getStatusInfo(order.orderShipping.status).text}
                      </div>

                      {order.orderShipping.shipped_at && (
                        <p className="shipped-date">Ngày gửi hàng: {formatDate(order.orderShipping.shipped_at)}</p>
                      )}

                      {order.orderShipping.delivered_at && (
                        <p className="delivered-date">Ngày nhận hàng: {formatDate(order.orderShipping.delivered_at)}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="no-shipping">Không có thông tin giao hàng</p>
                )}
              </div>

              <div className="payment-info-section">
                <h3>Thông tin thanh toán</h3>
                {order.payments ? (
                  <div className="payment-details">
                    <div className="payment-method">
                      <h4>Phương thức thanh toán</h4>
                      <p>{getPaymentMethodText(order.payments.payment_method)}</p>
                    </div>

                    <div className="payment-status">
                      <h4>Trạng thái thanh toán</h4>
                      <p>{getPaymentStatusText(order.payments.status)}</p>
                    </div>

                    {order.payments.paid_at && (
                      <div className="payment-date">
                        <h4>Ngày thanh toán</h4>
                        <p>{formatDate(order.payments.paid_at)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-payment">Không có thông tin thanh toán</p>
                )}
              </div>
            </div>

            <div className="order-summary-section">
              <h3>Tổng quan đơn hàng</h3>
              <div className="order-summary">
                <div className="summary-row">
                  <span className="summary-label">Tổng tiền hàng:</span>
                  <span className="summary-value">{formatPrice(order.subtotal_price)} VNĐ</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Phí vận chuyển:</span>
                  <span className="summary-value">{formatPrice(order.shipping_fee)} VNĐ</span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="summary-row discount">
                    <span className="summary-label">Giảm giá:</span>
                    <span className="summary-value">-{formatPrice(order.discount_amount)} VNĐ</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span className="summary-label">Tổng thanh toán:</span>
                  <span className="summary-value">{formatPrice(order.total_price)} VNĐ</span>
                </div>
              </div>
            </div>

            {order.note && (
              <div className="order-note-section">
                <h3>Ghi chú đơn hàng</h3>
                <p className="order-note">{order.note}</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: state.admin.userInfo
});

export default connect(mapStateToProps)(OrderDetail);
