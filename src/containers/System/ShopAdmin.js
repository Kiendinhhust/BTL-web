import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import {
  fetchAllShopsStart,
  deleteShopById,
  approveShopById,
  rejectShopById
} from '../../store/actions/shopAction';
import { fetchAllUsersStart } from '../../store/actions/userActions';

import './UserManage.scss';
import ModalShop from './ModalShop';
import ModalEditShop from './ModalEditShop';
import CommonUtils from '../../utils/CommonUtils';

class ShopAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenModalShop: false,
      isOpenModalEditShop: false,
      shopEdit: {},
      isLoading: false,
      isShowConfirmModal: false,
      shopToDelete: {},
      isShowRejectModal: false,
      shopToReject: {},
      rejectionReason: '',
      selectedBuyer: null
    };
  }

  componentDidMount() {
    // Set loading state to true before fetching data
    this.setState({ isLoading: true });

    // Fetch users data (để lấy danh sách buyer)
    this.props.fetchAllUsers();

    // Simulate loading for 1.5 seconds, sau đó mới fetch shops
    setTimeout(() => {
      // Fetch shops data sau khi loading xong
      this.props.fetchAllShops();
      this.setState({ isLoading: false });
    }, 1500);
  }


  handleSelectBuyer = (userId) => {
    if (!userId) {
      this.setState({ selectedBuyer: null });
      return;
    }

    const buyer = this.props.buyers.find(b => b.user_id === parseInt(userId));
    if (buyer) {
      this.setState({ selectedBuyer: buyer });
    }
  }

  handleAddNewShop = () => {
    this.setState({ isOpenModalShop: true });
  }

  toggleShopModal = () => {
    this.setState({ isOpenModalShop: !this.state.isOpenModalShop });
  }

  toggleShopEditModal = () => {
    this.setState({ isOpenModalEditShop: !this.state.isOpenModalEditShop });
  }

  handleEditShop = (shop) => {
    this.setState({ isOpenModalEditShop: true, shopEdit: shop });
  }

  handleConfirmDeleteShop = (shop) => {
    this.setState({ isShowConfirmModal: true, shopToDelete: shop });
  }

  toggleConfirmModal = () => {
    this.setState({ isShowConfirmModal: !this.state.isShowConfirmModal, shopToDelete: {} });
  }

  handleDeleteShop = async () => {
    let shop = this.state.shopToDelete;
    this.toggleConfirmModal();
    this.setState({ isLoading: true });

    let res = await this.props.deleteShop(shop.shop_id);

    setTimeout(() => {
      this.setState({ isLoading: false });
      if (res && res.success) {
        // Cập nhật lại danh sách shop
         this.props.fetchAllShops();

        // Hiển thị thông báo thành công với Toast
        toast.success(res.message, {
          position: "top-right",
          autoClose: 1500
        });
      } else {
        // Hiển thị thông báo lỗi với Toast
        toast.error(res.message, {
          position: "top-right",
          autoClose: 1500
        });
      }
    }, 600);
  }

  // Xử lý duyệt shop
  handleApproveShop = async (shop) => {
    // Hiển thị loading spinner
    this.setState({ isLoading: true });

    try {
      // Gọi API duyệt shop
      let res = await this.props.approveShop(shop.shop_id);

      // Giữ loading spinner trong 0.6 giây
      setTimeout(() => {
        this.setState({ isLoading: false });

        if (res && res.success) {
          // Hiển thị thông báo thành công với Toast
          toast.success(res.message, {
            position: "top-right",
            autoClose: 1500
          });

          // Cập nhật lại danh sách shop
          this.props.fetchAllShops();
        } else {
          // Hiển thị thông báo lỗi với Toast
          toast.error(res.message || 'Có lỗi xảy ra', {
            position: "top-right",
            autoClose: 1500
          });
        }
      }, 600);
    } catch (error) {
      this.setState({ isLoading: false });
      toast.error('Lỗi hệ thống', { autoClose: 1500 });
    }
  }

  // Hiển thị modal từ chối shop
  handleRejectShop = (shop) => {
    this.setState({
      isShowRejectModal: true,
      shopToReject: shop,
      rejectionReason: ''
    });
  }

  // Đóng/mở modal từ chối
  toggleRejectModal = () => {
    this.setState({
      isShowRejectModal: !this.state.isShowRejectModal,
      shopToReject: {},
      rejectionReason: ''
    });
  }

  // Cập nhật lý do từ chối
  handleChangeRejectionReason = (event) => {
    this.setState({ rejectionReason: event.target.value });
  }

  // Xử lý từ chối shop
  handleConfirmRejectShop = async () => {
    const { shopToReject, rejectionReason } = this.state;

    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối', { autoClose: 1500 });
      return;
    }

    // Đóng modal
    this.toggleRejectModal();

    // Hiển thị loading spinner
    this.setState({ isLoading: true });

    try {
      // Gọi API từ chối shop
      let res = await this.props.rejectShop(shopToReject.shop_id, rejectionReason);

      // Giữ loading spinner trong 0.6 giây
      setTimeout(() => {
        this.setState({ isLoading: false });

        if (res && res.success) {
          // Hiển thị thông báo thành công với Toast
          toast.success(res.message, {
            position: "top-right",
            autoClose: 1500
          });

          // Cập nhật lại danh sách shop
          this.props.fetchAllShops();
        } else {
          // Hiển thị thông báo lỗi với Toast
          toast.error(res.message || 'Có lỗi xảy ra', {
            position: "top-right",
            autoClose: 1500
          });
        }
      }, 600);
    } catch (error) {
      this.setState({ isLoading: false });
      toast.error('Lỗi hệ thống', { autoClose: 1500 });
    }
  }

  render() {
    let { shops, buyers } = this.props;
    
    let {
      isOpenModalShop,
      isOpenModalEditShop,
      shopEdit,
      isLoading,
      isShowConfirmModal,
      shopToDelete,
      isShowRejectModal,
      shopToReject,
      rejectionReason,
      selectedBuyer
    } = this.state;

    return (
      <div className="users-container">
      {isLoading ? (
        <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
        </div>
      ) : (
        <div>
        <div className="title">
          <FormattedMessage id="manage-shop.title" defaultMessage="Quản lý Shop" />
        </div>

        <div className="mx-3 mb-4">
          <button className="btn btn-primary" onClick={this.handleAddNewShop}>
          <i className="fas fa-plus"></i> Thêm shop mới
          </button>
        </div>

        <table id="customers">
          <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên shop</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Doanh thu</th>
            <th>Số đơn hàng</th>
            <th>Thao tác</th>
          </tr>
          </thead>
          <tbody>
          {shops && shops.length > 0 ? (
            shops.map((item, index) => {
            return (
              <tr key={index}>
              <td>{item.shop_id}</td>
              <td>
                <div
                className="user-image"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundImage: `url(${item.img ? CommonUtils.getBase64Image(item.img) : 'https://via.placeholder.com/40?text=Shop'})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                ></div>
              </td>
              <td>{item.shop_name}</td>
              <td>{item.address}</td>
              <td>{item.phone}</td>
              <td>
                <span className={`status-badge status-${item.status}`}>
                {item.status === 'pending' && 'Chờ duyệt'}
                {item.status === 'accepted' && 'Đã duyệt'}
                {item.status === 'rejected' && 'Đã từ chối'}
                </span>
              </td>
              <td>{item.total_revenue || 0} đ</td>
              <td>{item.total_orders || 0}</td>
              <td>
                <button
                className="btn-edit"
                onClick={() => this.handleEditShop(item)}
                title="Chỉnh sửa"
                >
                <i className="fas fa-pencil-alt"></i>
                </button>

                {/* Nút duyệt shop - chỉ hiển thị cho shop đang chờ duyệt */}
                {item.status === 'pending' && this.props.userInfo.role === 'admin' && (
                <button
                  className="btn-edit"
                  onClick={() => this.handleApproveShop(item)}
                  title="Duyệt shop"
                >
                  <i className="fas fa-check"></i>
                </button>
                )}

                {/* Nút từ chối shop - chỉ hiển thị cho shop đang chờ duyệt */}
                {item.status === 'pending' && this.props.userInfo.role === 'admin' && (
                <button
                  className="btn-delete"
                  onClick={() => this.handleRejectShop(item)}
                  title="Từ chối shop"
                >
                  <i className="fas fa-times"></i>
                </button>
                )}

                <button
                className="btn-delete"
                onClick={() => this.handleConfirmDeleteShop(item)}
                title="Xóa shop"
                >
                <i className="fas fa-trash"></i>
                </button>
              </td>
              </tr>
            );
            })
          ) : (
            <tr>
            <td colSpan="9" className="text-center">
              Không có shop nào
            </td>
            </tr>
          )}
          </tbody>
        </table>

        {isOpenModalShop && (
          <ModalShop
          isOpen={isOpenModalShop}
          toggleModal={this.toggleShopModal}
          buyers={buyers}
          selectedBuyer={selectedBuyer}
          onSelectBuyer={this.handleSelectBuyer}
          />
        )}

        {isOpenModalEditShop && (
          <ModalEditShop isOpen={isOpenModalEditShop} toggleModal={this.toggleShopEditModal} shopData={shopEdit} />
        )}

        {/* Confirm Delete Modal */}
        {isShowConfirmModal && (
          <div className="confirm-modal">
          <div className="modal-content">
            <div className="modal-header">
            <h3 className="modal-title">
              <i className="fas fa-exclamation-triangle"></i> Xác nhận xóa
            </h3>
            <button type="button" className="close" onClick={this.toggleConfirmModal}>
              <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div className="modal-body">
            <p>
              Bạn có chắc chắn muốn xóa shop <strong>{shopToDelete.shop_name}</strong>?
            </p>

            <div className="user-info-preview">
              <img
              src={
                shopToDelete.img
                ? CommonUtils.getBase64Image(shopToDelete.img)
                : 'https://via.placeholder.com/70?text=Shop'
              }
              alt={shopToDelete.shop_name}
              />
              <div className="user-info-text">
              <p>
                <strong>ID:</strong> {shopToDelete.shop_id}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {shopToDelete.address || 'N/A'}
              </p>
              <p>
                <strong>SĐT:</strong> {shopToDelete.phone || 'N/A'}
              </p>
              </div>
            </div>
            </div>
            <div className="modal-footer">
            <button className="btn btn-secondary" onClick={this.toggleConfirmModal}>
              <i className="fas fa-times"></i> Hủy
            </button>
            <button className="btn btn-danger" onClick={this.handleDeleteShop}>
              <i className="fas fa-trash"></i> Xóa
            </button>
            </div>
          </div>
          </div>
        )}

        {/* Reject Shop Modal */}
        {isShowRejectModal && (
          <div className="confirm-modal">
          <div className="modal-content">
            <div className="modal-header">
            <h3 className="modal-title">
              <i className="fas fa-ban"></i> Từ chối shop
            </h3>
            <button type="button" className="close" onClick={this.toggleRejectModal}>
              <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div className="modal-body">
            <p>
              Bạn đang từ chối shop <strong>{shopToReject.shop_name}</strong>
            </p>

            <div className="user-info-preview">
              <img
              src={
                shopToReject.img
                ? CommonUtils.getBase64Image(shopToReject.img)
                : 'https://via.placeholder.com/70?text=Shop'
              }
              alt={shopToReject.shop_name}
              />
              <div className="user-info-text">
              <p>
                <strong>ID:</strong> {shopToReject.shop_id}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {shopToReject.address || 'N/A'}
              </p>
              <p>
                <strong>SĐT:</strong> {shopToReject.phone || 'N/A'}
              </p>
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Lý do từ chối:</label>
              <textarea
              className="form-control"
              value={rejectionReason}
              onChange={this.handleChangeRejectionReason}
              placeholder="Nhập lý do từ chối shop này..."
              rows="4"
              ></textarea>
            </div>
            </div>
            <div className="modal-footer">
            <button className="btn btn-secondary" onClick={this.toggleRejectModal}>
              <i className="fas fa-times"></i> Hủy
            </button>
            <button className="btn btn-danger" onClick={this.handleConfirmRejectShop}>
              <i className="fas fa-ban"></i> Từ chối
            </button>
            </div>
          </div>
          </div>
        )}
        </div>
      )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    shops: state.shop.shops,
    userInfo: state.admin.userInfo,
    buyers: state.user.users ? state.user.users.filter(user => user.role === 'buyer') : []
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAllShops: () => dispatch(fetchAllShopsStart()),
    fetchAllUsers: () => dispatch(fetchAllUsersStart()),
    deleteShop: (shopId) => dispatch(deleteShopById(shopId)),
    approveShop: (shopId) => dispatch(approveShopById(shopId)),
    rejectShop: (shopId, reason) => dispatch(rejectShopById(shopId, reason))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopAdmin);
