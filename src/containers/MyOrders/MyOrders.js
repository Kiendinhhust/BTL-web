import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserOrders } from "../../services/orderService";
import { getImageByPublicId } from "../../services/storeService";
import "./MyOrders.scss";

const MyOrders = (props) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageCache, setImageCache] = useState({});
  const itemsPerPage = 10;

  // Fetch orders when component mounts or page changes
  useEffect(() => {
    fetchOrders(currentPage + 1);
  }, [currentPage]);

  // Fetch orders from API
  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const result = await getUserOrders({ page, size: itemsPerPage });
      console.log("Orders result:", result);

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
      console.error("Error fetching orders:", error);
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
      if (
        firstItem &&
        firstItem.item_image_url &&
        !newImageCache[firstItem.item_image_url]
      ) {
        try {
          const imageResult = await getImageByPublicId(
            firstItem.item_image_url
          );
          if (imageResult.success) {
            newImageCache[firstItem.item_image_url] = imageResult.url;
          }
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

  return (
    <div className="my-orders-container">
      <div className="my-orders-header">
        <h1>Đơn hàng của tôi</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-shopping-bag"></i>
          <p>Bạn chưa có đơn hàng nào</p>
          <Link to="/" className="shop-now-btn">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">
                      Mã đơn hàng: {order.order_code}
                    </span>
                    <span className="order-date">
                      Ngày đặt: {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div
                    className={`order-status ${
                      getStatusInfo(order.status).class
                    }`}
                  >
                    {getStatusInfo(order.status).text}
                  </div>
                </div>

                <div className="order-shop">
                  <i className="fas fa-store"></i>
                  <span>
                    {order.shop?.shop_name || "Cửa hàng không xác định"}
                  </span>
                </div>

                <div className="order-content">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="order-item-preview">
                      <div className="item-image">
                        <img
                          src={
                            imageCache[order.orderItems[0].item_image_url] ||
                            "/images/product-placeholder.png"
                          }
                          alt={order.orderItems[0].item_name || "Sản phẩm"}
                        />
                      </div>
                      <div className="item-info">
                        <p className="item-name">
                          {order.orderItems[0].item_name}
                        </p>
                        <p className="item-quantity">
                          x{order.orderItems[0].quantity}
                        </p>
                      </div>
                      {order.orderItems.length > 1 && (
                        <div className="more-items">
                          +{order.orderItems.length - 1} sản phẩm khác
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="no-items">Không có thông tin sản phẩm</p>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <span className="total-price">
                      {formatPrice(order.total_price)} VNĐ
                    </span>
                  </div>
                  <Link
                    to={`/buyer/my-orders/${order.order_id}`}
                    className="view-detail-btn"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
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
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: state.admin.userInfo,
});

export default connect(mapStateToProps)(MyOrders);
