import "./OrderDetail.scss";
import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { Link, useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderDetails } from "../../services/orderService"; // Đảm bảo service này đã được tạo và hoạt động
import ReviewModal from "../../components/ReviewModal/ReviewModal"; // Đảm bảo component này tồn tại và đúng đường dẫn

const OrderDetail = (props) => {
  const { orderId } = useParams();
  const history = useHistory();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho Review Modal và trạng thái đã đánh giá
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentItemForReview, setCurrentItemForReview] = useState(null);
  const [reviewedItemIds, setReviewedItemIds] = useState(new Set()); // Lưu item_id đã đánh giá

  const [isMounted, setIsMounted] = useState(true);

  const fetchOrderDetails = useCallback(async (forceRefresh = false) => {
    if (!isMounted) return;
    if (!forceRefresh) {
      if (isMounted) setLoading(true);
    }
    try {
      const result = await getOrderDetails(orderId);
      if (!isMounted) return;

      let orderData = null;
      // Điều chỉnh logic này dựa theo cấu trúc response thực tế của getOrderDetails(orderId)
      if (result && result.order_id) { // Nếu API trả về trực tiếp object order
        orderData = result;
      } else if (result && result.success && result.data && result.data.order_id) { // Nếu API trả về { success: true, data: order }
        orderData = result.data;
      }

      if (orderData) {
        setOrder(orderData);
        // OPTIONAL: Nếu API getOrderDetails của bạn trả về thông tin item nào đã được review bởi user hiện tại
        // Ví dụ, nếu mỗi item có: item.currentUserReviewId (ID của review nếu có)
        if (orderData.orderItems) {
            const alreadyReviewed = new Set();
            orderData.orderItems.forEach(item => {
                // Giả sử API của bạn thêm trường `currentUserReviewId` vào mỗi orderItem nếu đã có review từ user này
                if (item.currentUserReviewId) {
                   alreadyReviewed.add(item.item_id);
                }
            });
            if (isMounted) setReviewedItemIds(alreadyReviewed);
        }
      } else {
        toast.error(
          (result && (result.message || result.error)) || "Không thể tải thông tin đơn hàng",
          { position: "top-right", autoClose: 3000, theme: "dark" }
        );
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching order details:", error);
        toast.error(
          error.response?.data?.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng",
          { position: "top-right", autoClose: 3000, theme: "dark" }
        );
      }
    } finally {
      if (isMounted && !forceRefresh) {
        setLoading(false);
      }
    }
  }, [orderId, isMounted]);


  useEffect(() => {
    setIsMounted(true);
    fetchOrderDetails();
    return () => {
      setIsMounted(false);
    };
  }, [fetchOrderDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) return "0";
    return Number(price).toLocaleString("vi-VN");
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending": return { class: "status-pending", text: "Chờ xác nhận" };
      case "processing": return { class: "status-processing", text: "Đang xử lý" };
      case "shipped": return { class: "status-shipped", text: "Đang giao hàng" };
      case "delivered": return { class: "status-delivered", text: "Đã giao hàng" };
      case "canceled": return { class: "status-canceled", text: "Đã hủy" };
      default: return { class: "status-unknown", text: status || "Không rõ" };
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cod": return "Thanh toán khi nhận hàng (COD)";
      case "credit_card": return "Thẻ tín dụng/Ghi nợ";
      case "e_wallet": return "Ví điện tử";
      case "bank_transfer": return "Chuyển khoản ngân hàng";
      default: return method || "Không rõ";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ thanh toán";
      case "paid": return "Đã thanh toán";
      case "refunded": return "Đã hoàn tiền";
      case "failed": return "Thanh toán thất bại";
      default: return status || "Không rõ";
    }
  };

  const handleOpenReviewModal = (orderItem) => {
    if (!order || !order.order_id) {
      toast.error("Lỗi: Không có thông tin đơn hàng để đánh giá.");
      return;
    }
    setCurrentItemForReview({
      orderId: order.order_id,
      productId: orderItem.product_id, // ID của sản phẩm gốc (bảng products)
      itemId: orderItem.item_id,     // ID của biến thể cụ thể (bảng items)
      productName: orderItem.item_name,
      itemAttributes: orderItem.item_attributes,
    });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = (submittedSuccessfully, reviewedItemId) => {
    setShowReviewModal(false);
    setCurrentItemForReview(null);
    if (submittedSuccessfully && reviewedItemId) {
      setReviewedItemIds((prev) => new Set(prev).add(reviewedItemId));
      // Optional: Gọi lại fetchOrderDetails(true) nếu bạn muốn cập nhật
      // ngay lập tức từ server sau khi review, ví dụ để hiển thị rating trung bình mới
      // fetchOrderDetails(true);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="order-detail-header">
          <button className="back-btn" onClick={() => history.goBack()}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <h1>Chi tiết đơn hàng</h1>
        </div>
        <div className="no-order">
          <i className="fas fa-exclamation-circle"></i>
          <p>Không tìm thấy thông tin đơn hàng hoặc có lỗi xảy ra.</p>
          <Link to={props.userInfo?.role === 'admin' || props.userInfo?.role === 'seller' ? '/system/manage-orders' : "/my-orders"} className="back-to-orders-btn">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <h1>Chi tiết đơn hàng</h1>
      </div>

      <div className="order-detail-content">
        <div className="order-info-section">
          <div className="order-header-info">
            <div className="order-basic-info">
              <h2>Đơn hàng #{order.order_code}</h2>
              <p className="order-date">
                Ngày đặt: {formatDate(order.created_at)}
              </p>
            </div>
            <div className={`order-status ${getStatusInfo(order.status).class}`}>
              {getStatusInfo(order.status).text}
            </div>
          </div>
          {order.shop && (
             <div className="order-shop-info">
                <Link to={`/shop/${order.shop.shop_id}`}>
                    <i className="fas fa-store"></i>
                    <span>{order.shop.shop_name || "Cửa hàng không xác định"}</span>
                </Link>
             </div>
          )}
        </div>

        <div className="order-items-section">
          <h3>Sản phẩm ({order.orderItems?.length || 0})</h3>
          <div className="order-items-list">
            {order.orderItems && order.orderItems.length > 0 ? (
              order.orderItems.map((item) => (
                <div key={item.order_item_id} className="order-item">
                  <div className="item-image">
                    <img
                      src={item.item_image_url || "https://placehold.co/100x100?text=N/A"}
                      alt={item.item_name || "Sản phẩm"}
                    />
                  </div>
                  <div className="item-details">
                    <p className="item-name">
                       {item.item_name || "Sản phẩm không tên"}
                    </p>
                    {item.item_attributes && Object.keys(item.item_attributes).length > 0 && (
                      <div className="item-attributes">
                        Phân loại: {Object.entries(
                           typeof item.item_attributes === "string" ? JSON.parse(item.item_attributes) : item.item_attributes
                        ).map(([key, value], idx, arr) => (
                          <span key={idx} className="attribute-item">
                            {value}{idx < arr.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="item-price-quantity">
                    <div className="item-price">
                      {item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price) ? (
                        <>
                          <span className="original-price">{formatPrice(item.price)} VNĐ</span>
                          <span className="sale-price">{formatPrice(item.sale_price)} VNĐ</span>
                        </>
                      ) : (
                        <span className="regular-price">{formatPrice(item.price)} VNĐ</span>
                      )}
                    </div>
                    <div className="item-quantity">x{item.quantity}</div>
                  </div>
                  <div className="item-total">
                    {formatPrice((item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price) ? item.sale_price : item.price) * item.quantity)} VNĐ
                  </div>
                  <div className="item-actions">
                    {order.status === "delivered" && !reviewedItemIds.has(item.item_id) && (
                        <button
                          className="btn-review-item"
                          onClick={() => handleOpenReviewModal(item)}
                          title="Đánh giá sản phẩm này"
                        >
                          Đánh giá
                        </button>
                      )}
                    {reviewedItemIds.has(item.item_id) && (
                      <span className="reviewed-badge">Đã đánh giá</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm nào trong đơn hàng này.</p>
            )}
          </div>
        </div>

        <div className="order-details-grid">
            <div className="shipping-info-section">
                <h3>Thông tin giao hàng</h3>
                {order.orderShipping ? (
                <div className="shipping-details">
                    <div className="shipping-address">
                    <h4>Địa chỉ nhận hàng</h4>
                    {order.orderShipping.shippingAddress ? (
                        <div className="address-info">
                            <p><strong>{order.orderShipping.shippingAddress.full_name}</strong></p>
                            <p>{order.orderShipping.shippingAddress.phone_number}</p>
                            <p>
                                {order.orderShipping.shippingAddress.street_address}, {order.orderShipping.shippingAddress.ward}, {order.orderShipping.shippingAddress.district}, {order.orderShipping.shippingAddress.city}
                                {order.orderShipping.shippingAddress.country && order.orderShipping.shippingAddress.country !== 'Vietnam' && `, ${order.orderShipping.shippingAddress.country}`}
                            </p>
                            {order.orderShipping.shippingAddress.address_type &&
                                <p className="address-type-badge">({order.orderShipping.shippingAddress.address_type === 'home' ? 'Nhà riêng' : order.orderShipping.shippingAddress.address_type === 'work' ? 'Văn phòng' : order.orderShipping.shippingAddress.address_type})</p>
                            }
                        </div>
                    ) : (
                        <p className="no-address">Chưa có thông tin địa chỉ.</p>
                    )}
                    </div>

                    {order.orderShipping.shippingMethod && (
                        <div className="shipping-method">
                        <h4>Phương thức vận chuyển</h4>
                        <div className="method-info">
                            <p className="method-name">{order.orderShipping.shippingMethod.name}</p>
                            {order.orderShipping.shippingMethod.min_delivery_days != null && (
                            <p className="method-delivery">
                                Dự kiến giao: {order.orderShipping.shippingMethod.min_delivery_days} - {order.orderShipping.shippingMethod.max_delivery_days} ngày
                            </p>
                            )}
                            <p className="method-cost">Phí: {formatPrice(order.orderShipping.shipping_cost != null ? order.orderShipping.shipping_cost : order.shipping_fee)} VNĐ</p>
                        </div>
                        </div>
                    )}

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
                    {order.orderShipping.shipped_at && <p className="shipped-date">Ngày gửi: {formatDate(order.orderShipping.shipped_at)}</p>}
                    {order.orderShipping.delivered_at && <p className="delivered-date">Ngày nhận: {formatDate(order.orderShipping.delivered_at)}</p>}
                    </div>
                     {order.orderShipping.notes && <div className="shipping-notes"><h4>Ghi chú vận chuyển:</h4> <p>{order.orderShipping.notes}</p></div>}
                </div>
                ) : (
                <p className="no-shipping">Chưa có thông tin vận chuyển.</p>
                )}
            </div>

            <div className="payment-info-section">
                <h3>Thông tin thanh toán</h3>
                {order.payments && typeof order.payments === 'object' && order.payments.payment_method ? (
                    <div className="payment-details">
                    <div className="payment-method">
                        <h4>Phương thức</h4>
                        <p>{getPaymentMethodText(order.payments.payment_method)}</p>
                    </div>
                    <div className="payment-status">
                        <h4>Trạng thái</h4>
                        <p className={`payment-status-badge status-${order.payments.status.toLowerCase()}`}>
                            {getPaymentStatusText(order.payments.status)}
                        </p>
                    </div>
                    {order.payments.paid_at && (
                        <div className="payment-date">
                        <h4>Ngày thanh toán</h4>
                        <p>{formatDate(order.payments.paid_at)}</p>
                        </div>
                    )}
                    {order.payments.transaction_id && <p>Mã giao dịch: {order.payments.transaction_id}</p>}
                    </div>
                 ) : Array.isArray(order.payments) && order.payments.length > 0 ? (
                     order.payments.map(payment => (
                         <div key={payment.payment_id} className="payment-details" style={{marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                             <div className="payment-method"><h4>Phương thức:</h4><p>{getPaymentMethodText(payment.payment_method)}</p></div>
                             <div className="payment-status"><h4>Trạng thái:</h4><p className={`payment-status-badge status-${payment.status.toLowerCase()}`}>{getPaymentStatusText(payment.status)}</p></div>
                             {payment.paid_at && <div className="payment-date"><h4>Ngày TT:</h4><p>{formatDate(payment.paid_at)}</p></div>}
                             {payment.transaction_id && <p>Mã GD: {payment.transaction_id}</p>}
                         </div>
                     ))
                 ) : (
                    <p className="no-payment">Chưa có thông tin thanh toán.</p>
                )}
            </div>
        </div>

        <div className="order-summary-section">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span className="summary-label">Tổng tiền hàng:</span>
              <span className="summary-value">{formatPrice(order.subtotal_price)} VNĐ</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phí vận chuyển:</span>
              <span className="summary-value">{formatPrice(order.shipping_fee)} VNĐ</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="summary-row discount">
                <span className="summary-label">Giảm giá:</span>
                <span className="summary-value">-{formatPrice(order.discount_amount)} VNĐ</span>
              </div>
            )}
            <div className="summary-row total">
              <span className="summary-label">Thành tiền:</span>
              <span className="summary-value total-amount">{formatPrice(order.total_price)} VNĐ</span>
            </div>
          </div>
        </div>

        {order.note && (
          <div className="order-note-section">
            <h3>Ghi chú của bạn</h3>
            <p className="order-note">{order.note}</p>
          </div>
        )}
      </div>

      {/* --- Review Modal --- */}
      {showReviewModal && currentItemForReview && (
        <ReviewModal
          show={showReviewModal}
          onClose={(submittedSuccessfully) => handleCloseReviewModal(submittedSuccessfully, currentItemForReview.itemId)}
          orderId={currentItemForReview.orderId}
          productId={currentItemForReview.productId}
          itemId={currentItemForReview.itemId}
          productName={currentItemForReview.productName}
          itemAttributes={currentItemForReview.itemAttributes}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: state.admin.userInfo,
});

export default connect(mapStateToProps)(OrderDetail);