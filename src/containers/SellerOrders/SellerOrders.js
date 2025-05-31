import "./SellerOrders.scss";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
// import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getShopOrders,
  getOrderDetails,
  updateOrderStatus,
} from "../../services/orderService";
// import { getImageByPublicId } from "../../services/storeService";

const SellerOrders = (props) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageCache, setImageCache] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch orders when component mounts or page changes
  useEffect(() => {
    fetchOrders(currentPage + 1);
  }, [currentPage]);

  // Fetch orders from API
  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      // Get shop_id from userInfo
      const shopId = props.userInfo?.shop;
      // console.log("User Info:", props.userInfo);
      // console.log("Shop ID:", shopId);
      if (!shopId) {
        toast.error("Không tìm thấy thông tin cửa hàng", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setLoading(false);
        return;
      }

      const result = await getShopOrders(shopId, { page, size: itemsPerPage });
      // console.log("Shop orders result:", result);

      if (result.success && result.data) {
        setOrders(result.data.products || []);
        setTotalPages(result.data.totalPages || 0);
        // Fetch images for the first item of each order
        const ordersWithItems = result.data.products.filter(
          (order) => order.orderItems && order.orderItems.length > 0
        );
        fetchOrderImages(ordersWithItems);
      } else {
        toast.error(result.error || "Không thể tải danh sách đơn hàng", {
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
      console.error("Error fetching shop orders:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách đơn hàng", {
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

  // Fetch images for order items
  const fetchOrderImages = async (ordersWithItems) => {
    const newImageCache = { ...imageCache };

    for (const order of ordersWithItems) {
      const firstItem = order.orderItems[0];
      // console.log(firstItem);
      if (
        firstItem &&
        firstItem.item_image_url &&
        !newImageCache[firstItem.item_image_url]
      ) {
        try {
          const imageResult = firstItem.item_image_url;
          newImageCache[firstItem.item_image_url] = imageResult;
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    }

    setImageCache(newImageCache);
  };

  // Handle page change
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString("vi-VN");
  };

  // Get status class and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { class: "status-pending", text: "Chờ xác nhận" };
      case "processing":
        return { class: "status-processing", text: "Đang xử lý" };
      case "shipped":
        return { class: "status-shipped", text: "Đang giao hàng" };
      case "delivered":
        return { class: "status-delivered", text: "Đã giao hàng" };
      case "canceled":
        return { class: "status-canceled", text: "Đã hủy" };
      default:
        return { class: "status-unknown", text: status };
    }
  };

  // View order details
  const viewOrderDetails = async (orderId) => {
    try {
      setStatusUpdateLoading(true);
      const result = await getOrderDetails(orderId);

      if (result.success && result.data) {
        setSelectedOrder(result.data);
      } else {
        toast.error(result.error || "Không thể tải thông tin đơn hàng", {
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
      console.error("Error fetching order details:", error);
      toast.error("Đã xảy ra lỗi khi tải thông tin đơn hàng", {
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
      setStatusUpdateLoading(false);
    }
  };

  // Close order details modal
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Update order status
  const handleUpdateStatus = (orderId, newStatus) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành "${
          getStatusInfo(newStatus).text
        }"?`
      )
    ) {
      updateStatus(orderId, newStatus);
    }
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);

      const result = await updateOrderStatus(orderId, { status: newStatus });

      if (result.success) {
        toast.success("Cập nhật trạng thái đơn hàng thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });

        // Refresh orders list
        fetchOrders(currentPage + 1);

        // Close order details modal
        closeOrderDetails();
      } else {
        toast.error(result.error || "Không thể cập nhật trạng thái đơn hàng", {
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
      console.error("Error updating order status:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng", {
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
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="seller-orders-container">
      <div className="seller-orders-header">
        <h1>Quản lý đơn hàng</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-shopping-bag"></i>
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            <div className="orders-table">
              <div className="table-header">
                <div className="header-cell order-id">Mã đơn hàng</div>
                <div className="header-cell customer">Khách hàng</div>
                <div className="header-cell date">Ngày đặt</div>
                <div className="header-cell items">Sản phẩm</div>
                <div className="header-cell total">Tổng tiền</div>
                <div className="header-cell status">Trạng thái</div>
                <div className="header-cell actions">Thao tác</div>
              </div>

              <div className="table-body">
                {orders.map((order) => (
                  <div key={order.order_id} className="table-row">
                    <div className="cell order-id">{order.order_code}</div>
                    <div className="cell customer">
                      {order.user?.username || "Không xác định"}
                    </div>
                    <div className="cell date">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="cell items">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <div className="items-preview">
                          <img
                            src={
                              imageCache[order.orderItems[0].item_image_url] ||
                              "/images/product-placeholder.png"
                            }
                            alt={order.orderItems[0].item_name || "Sản phẩm"}
                          />
                          <span>{order.orderItems.length} sản phẩm</span>
                        </div>
                      ) : (
                        <span>Không có sản phẩm</span>
                      )}
                    </div>
                    <div className="cell total">
                      {formatPrice(order.total_price)} VNĐ
                    </div>
                    <div className="cell status">
                      <span
                        className={`status-badge ${
                          getStatusInfo(order.status).class
                        }`}
                      >
                        {getStatusInfo(order.status).text}
                      </span>
                    </div>
                    <div className="cell actions">
                      <button
                        className="view-btn"
                        onClick={() => viewOrderDetails(order.order_id)}
                      >
                        <i className="fas fa-eye"></i> Xem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() =>
                  currentPage > 0 && setCurrentPage(currentPage - 1)
                }
                disabled={currentPage === 0}
                className="page-item"
              >
                <span className="page-link">Trước</span>
              </button>

              {[...Array(totalPages).keys()].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-item ${
                    currentPage === page ? "active" : ""
                  }`}
                >
                  <span className="page-link">{page + 1}</span>
                </button>
              ))}

              <button
                onClick={() =>
                  currentPage < totalPages - 1 &&
                  setCurrentPage(currentPage + 1)
                }
                disabled={currentPage === totalPages - 1}
                className="page-item"
              >
                <span className="page-link">Sau</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-overlay" onClick={closeOrderDetails}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.order_code}</h2>
              <button className="close-btn" onClick={closeOrderDetails}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {statusUpdateLoading ? (
              <div className="loading-container modal-loading">
                <div className="loading-spinner"></div>
                <p>Đang xử lý...</p>
              </div>
            ) : (
              <div className="modal-body">
                <div className="order-status-section">
                  <h3>Trạng thái đơn hàng</h3>
                  <div className="current-status">
                    <span className="status-label">Trạng thái hiện tại:</span>
                    <span
                      className={`status-badge ${
                        getStatusInfo(selectedOrder.status).class
                      }`}
                    >
                      {getStatusInfo(selectedOrder.status).text}
                    </span>
                  </div>

                  <div className="status-actions">
                    <h4>Cập nhật trạng thái:</h4>
                    <div className="status-buttons">
                      {selectedOrder.status === "pending" && (
                        <>
                          <button
                            className="status-btn processing"
                            onClick={() =>
                              handleUpdateStatus(
                                selectedOrder.order_id,
                                "processing"
                              )
                            }
                          >
                            Xác nhận đơn hàng
                          </button>
                          <button
                            className="status-btn canceled"
                            onClick={() =>
                              handleUpdateStatus(
                                selectedOrder.order_id,
                                "canceled"
                              )
                            }
                          >
                            Hủy đơn hàng
                          </button>
                        </>
                      )}

                      {selectedOrder.status === "processing" && (
                        <>
                          <button
                            className="status-btn shipped"
                            onClick={() =>
                              handleUpdateStatus(
                                selectedOrder.order_id,
                                "shipped"
                              )
                            }
                          >
                            Đã giao cho đơn vị vận chuyển
                          </button>
                          <button
                            className="status-btn canceled"
                            onClick={() =>
                              handleUpdateStatus(
                                selectedOrder.order_id,
                                "canceled"
                              )
                            }
                          >
                            Hủy đơn hàng
                          </button>
                        </>
                      )}

                      {selectedOrder.status === "shipped" && (
                        <button
                          className="status-btn delivered"
                          onClick={() =>
                            handleUpdateStatus(
                              selectedOrder.order_id,
                              "delivered"
                            )
                          }
                        >
                          Đã giao hàng thành công
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-info">
                    <h3>Thông tin đơn hàng</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Mã đơn hàng:</span>
                        <span className="info-value">
                          {selectedOrder.order_code}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Ngày đặt:</span>
                        <span className="info-value">
                          {formatDate(selectedOrder.createdAt)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Khách hàng:</span>
                        <span className="info-value">
                          {selectedOrder.user?.username || "Không xác định"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Tổng tiền:</span>
                        <span className="info-value">
                          {formatPrice(selectedOrder.total_price)} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-items">
                    <h3>Sản phẩm</h3>
                    <div className="items-list">
                      {selectedOrder.orderItems &&
                        selectedOrder.orderItems.map((item) => (
                          <div key={item.order_item_id} className="item">
                            <div className="item-image">
                              <img
                                src={
                                  imageCache[item.item_image_url] ||
                                  "/images/product-placeholder.png"
                                }
                                alt={item.item_name || "Sản phẩm"}
                              />
                            </div>
                            <div className="item-details">
                              <p className="item-name">{item.item_name}</p>
                              {item.item_attributes && (
                                <div className="item-attributes">
                                  {Object.entries(
                                    typeof item.item_attributes === "string"
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
                              {formatPrice(item.price)} VNĐ x {item.quantity}
                            </div>
                            <div className="item-total">
                              {formatPrice(item.price * item.quantity)} VNĐ
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="shipping-info">
                    <h3>Thông tin giao hàng</h3>
                    {selectedOrder.orderShipping ? (
                      <div className="shipping-details">
                        <div className="shipping-address">
                          <h4>Địa chỉ giao hàng</h4>
                          {selectedOrder.orderShipping.shippingAddress ? (
                            <div className="address-info">
                              <p className="address-type">
                                {selectedOrder.orderShipping.shippingAddress
                                  .type === "home"
                                  ? "Nhà riêng"
                                  : selectedOrder.orderShipping.shippingAddress
                                      .type === "office"
                                  ? "Văn phòng"
                                  : "Địa chỉ khác"}
                              </p>
                              <p className="address-line">
                                {
                                  selectedOrder.orderShipping.shippingAddress
                                    .address_infor
                                }
                              </p>
                            </div>
                          ) : (
                            <p className="no-address">
                              Không có thông tin địa chỉ
                            </p>
                          )}
                        </div>

                        <div className="shipping-method">
                          <h4>Phương thức vận chuyển</h4>
                          {selectedOrder.orderShipping.shippingMethod ? (
                            <div className="method-info">
                              <p className="method-name">
                                {
                                  selectedOrder.orderShipping.shippingMethod
                                    .name
                                }
                              </p>
                              <p className="method-delivery">
                                Thời gian giao hàng:{" "}
                                {
                                  selectedOrder.orderShipping.shippingMethod
                                    .min_delivery_days
                                }{" "}
                                -{" "}
                                {
                                  selectedOrder.orderShipping.shippingMethod
                                    .max_delivery_days
                                }{" "}
                                ngày
                              </p>
                              <p className="method-cost">
                                {formatPrice(
                                  selectedOrder.orderShipping.shipping_cost
                                )}{" "}
                                VNĐ
                              </p>
                            </div>
                          ) : (
                            <p className="no-method">
                              Không có thông tin phương thức vận chuyển
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="no-shipping">
                        Không có thông tin giao hàng
                      </p>
                    )}
                  </div>

                  {selectedOrder.note && (
                    <div className="order-note">
                      <h3>Ghi chú đơn hàng</h3>
                      <p>{selectedOrder.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: state.admin.userInfo,
});

export default connect(mapStateToProps)(SellerOrders);
