import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import "./ShippingMethodPage.scss";
import axios from "axios";

const ShippingMethodPage = (props) => {
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [currentMethod, setCurrentMethod] = useState({
    name: "",
    description: "",
    min_delivery_days: 1,
    max_delivery_days: 7,
    cost: 0,
    is_active: true,
  });

  // API URL
  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3434";

  // Fetch shipping methods
  const fetchShippingMethods = async (
    page = 1,
    name = searchName,
    is_active = filterActive
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/shipping-methods`, {
        params: { page, size: 10, name, is_active },
        headers: {
          Authorization: `Bearer ${props.userInfo.accessToken}`,
        },
      });
      console.log("Shipping methods response:", response.data);
      if (response.data.success) {
        setShippingMethods(response.data.methods);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        toast.error(
          response.data.message ||
            "Không thể tải danh sách phương thức vận chuyển",
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
      console.error("Error fetching shipping methods:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách phương thức vận chuyển", {
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

  // Initial fetch
  useEffect(() => {
    fetchShippingMethods();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchShippingMethods(1, searchName, filterActive);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterActive(value);
    fetchShippingMethods(1, searchName, value);
  };

  // Handle input change for modal
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentMethod({
      ...currentMethod,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Open modal for creating new method
  const openCreateModal = () => {
    setCurrentMethod({
      name: "",
      description: "",
      min_delivery_days: 1,
      max_delivery_days: 7,
      cost: 0,
      is_active: true,
    });
    setModalMode("create");
    setShowModal(true);
  };

  // Open modal for editing method
  const openEditModal = (method) => {
    setCurrentMethod({
      ...method,
      cost: parseFloat(method.cost),
    });
    setModalMode("edit");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Save shipping method (create or update)
  const saveShippingMethod = async () => {
    // Validate inputs
    if (!currentMethod.name) {
      toast.error("Vui lòng nhập tên phương thức vận chuyển", {
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
      currentMethod.cost === undefined ||
      currentMethod.cost === null ||
      isNaN(currentMethod.cost)
    ) {
      toast.error("Vui lòng nhập chi phí vận chuyển hợp lệ", {
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

    setLoading(true);
    try {
      let response;
      if (modalMode === "create") {
        // Create new shipping method
        response = await axios.post(
          `${API_URL}/api/shipping-methods`,
          currentMethod,
          {
            headers: {
              Authorization: `Bearer ${props.userInfo.accessToken}`,
            },
          }
        );
      } else {
        // Update existing shipping method
        response = await axios.put(
          `${API_URL}/api/shipping-methods/${currentMethod.shipping_method_id}`,
          currentMethod,
          {
            headers: {
              Authorization: `Bearer ${props.userInfo.accessToken}`,
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        closeModal();
        fetchShippingMethods(currentPage);
      } else {
        toast.error(
          response.data.message || "Không thể lưu phương thức vận chuyển",
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
      console.error("Error saving shipping method:", error);
      toast.error("Đã xảy ra lỗi khi lưu phương thức vận chuyển", {
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

  // Toggle shipping method status
  const toggleStatus = async (id) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/shipping-methods/${id}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${props.userInfo.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchShippingMethods(currentPage);
      } else {
        toast.error(
          response.data.message ||
            "Không thể thay đổi trạng thái phương thức vận chuyển",
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
      console.error("Error toggling shipping method status:", error);
      toast.error(
        "Đã xảy ra lỗi khi thay đổi trạng thái phương thức vận chuyển",
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
    } finally {
      setLoading(false);
    }
  };

  // State for confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Delete shipping method - show confirmation dialog
  const deleteShippingMethod = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  // Confirm delete shipping method
  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/api/shipping-methods/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${props.userInfo.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        fetchShippingMethods(currentPage);
      } else {
        toast.error(
          response.data.message || "Không thể xóa phương thức vận chuyển",
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
      console.error("Error deleting shipping method:", error);
      toast.error("Đã xảy ra lỗi khi xóa phương thức vận chuyển", {
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
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setDeleteId(null);
  };

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "0";
    }
    return Number(price).toLocaleString("vi-VN");
  };

  // Custom pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <li key="1" className={currentPage === 1 ? "active" : ""}>
          <button onClick={() => fetchShippingMethods(1)}>1</button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="ellipsis1" className="ellipsis">
            ...
          </li>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={currentPage === i ? "active" : ""}>
          <button onClick={() => fetchShippingMethods(i)}>{i}</button>
        </li>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="ellipsis2" className="ellipsis">
            ...
          </li>
        );
      }
      pages.push(
        <li
          key={totalPages}
          className={currentPage === totalPages ? "active" : ""}
        >
          <button onClick={() => fetchShippingMethods(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    return (
      <div className="custom-pagination">
        <ul>
          <li className={currentPage === 1 ? "disabled" : ""}>
            <button
              onClick={() => fetchShippingMethods(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
          </li>
          {pages}
          <li className={currentPage === totalPages ? "disabled" : ""}>
            <button
              onClick={() => fetchShippingMethods(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="shipping-method-container">
      {/* Custom loading overlay */}
      {loading && (
        <div className="custom-loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Đang xử lý...</div>
        </div>
      )}

      <div className="title">Quản lý phương thức vận chuyển</div>

      <div className="search-and-filter">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <button type="submit">Tìm kiếm</button>
        </form>

        <div className="filter">
          <select value={filterActive} onChange={handleFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Đã vô hiệu hóa</option>
          </select>
        </div>

        <button className="add-btn" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Thêm mới
        </button>
      </div>

      <div className="shipping-methods-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Thời gian giao hàng (ngày)</th>
              <th>Chi phí</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shippingMethods.length > 0 ? (
              shippingMethods.map((method) => (
                <tr key={method.shipping_method_id}>
                  <td>{method.shipping_method_id}</td>
                  <td>{method.name}</td>
                  <td>{method.description || "N/A"}</td>
                  <td>
                    {method.min_delivery_days} - {method.max_delivery_days}
                  </td>
                  <td>{formatPrice(method.cost)} VNĐ</td>
                  <td>
                    <span
                      className={`status ${
                        method.is_active ? "active" : "inactive"
                      }`}
                    >
                      {method.is_active ? "Hoạt động" : "Vô hiệu hóa"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(method)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`toggle-btn ${
                          method.is_active ? "deactivate" : "activate"
                        }`}
                        onClick={() => toggleStatus(method.shipping_method_id)}
                      >
                        <i
                          className={`fas ${
                            method.is_active ? "fa-toggle-off" : "fa-toggle-on"
                          }`}
                        ></i>
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteShippingMethod(method.shipping_method_id)
                        }
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom pagination */}
      {renderPagination()}

      {/* Modal for creating/editing shipping method */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalMode === "create"
                  ? "Thêm phương thức vận chuyển mới"
                  : "Chỉnh sửa phương thức vận chuyển"}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên phương thức vận chuyển *</label>
                <input
                  type="text"
                  name="name"
                  value={currentMethod.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên phương thức vận chuyển"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={currentMethod.description || ""}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả phương thức vận chuyển"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian giao hàng tối thiểu (ngày) *</label>
                  <input
                    type="number"
                    name="min_delivery_days"
                    value={currentMethod.min_delivery_days}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thời gian giao hàng tối đa (ngày) *</label>
                  <input
                    type="number"
                    name="max_delivery_days"
                    value={currentMethod.max_delivery_days}
                    onChange={handleInputChange}
                    min={currentMethod.min_delivery_days}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Chi phí vận chuyển (VNĐ) *</label>
                <input
                  type="number"
                  name="cost"
                  value={currentMethod.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={currentMethod.is_active}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_active">
                  Kích hoạt phương thức vận chuyển
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Hủy
              </button>
              <button className="save-btn" onClick={saveShippingMethod}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom confirm dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="confirm-dialog-body">
              <p>Bạn có chắc chắn muốn xóa phương thức vận chuyển này?</p>
            </div>
            <div className="confirm-dialog-footer">
              <button className="cancel-btn" onClick={cancelDelete}>
                Không
              </button>
              <button className="confirm-btn" onClick={confirmDelete}>
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    userInfo: state.admin.userInfo,
  };
};

export default connect(mapStateToProps)(ShippingMethodPage);
