import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import { fetchAllShopsStart, deleteShopById  } from '../../store/actions/shopAction';

import './ShopAdmin.scss';
import ModalShop from './ModalShop';
import ModalEditShop from './ModalEditShop';

class ShopAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenModalShop: false,
      isOpenModalEditShop: false,
      shopEdit: {},
      isLoading: false,
      isShowConfirmModal: false,
      shopToDelete: {}
    };
  }

  componentDidMount() {
    // Set loading state to true before fetching data
    this.setState({ isLoading: true });
    // Fetch shops data
    this.props.fetchAllShops();
    // Simulate loading for 0.6 seconds
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 600);
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
    // Hiển thị loading spinner
    this.setState({ isLoading: true });
    // Gọi API xóa shop
    let res = await this.props.deleteShop(shop.shop_id);
    // Giữ loading spinner trong 0.6 giây
    setTimeout(() => {
      this.setState({ isLoading: false });
      if (res && res.success) {
        // Hiển thị thông báo thành công với Toast
        toast.success(res.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Hiển thị thông báo lỗi với Toast
        toast.error(res.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }, 600);
  }

  render() {
    let { shops } = this.props;
    let { isOpenModalShop, isOpenModalEditShop, shopEdit, isLoading, isShowConfirmModal, shopToDelete } = this.state;

    return (
      <div className="shop-manage-container">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        <div className="shop-manage-header">
          <h2 className="title text-center">
            <FormattedMessage id="manage-shop.title" defaultMessage="Quản lý Shop" />
          </h2>
          <button 
            className="btn-add-shop"
            onClick={this.handleAddNewShop}
          >
            <i className="fas fa-plus"></i> Thêm shop mới
          </button>
        </div>

        <div className="shop-table mt-4">
          <table id="shop-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên shop</th>
                <th>Địa chỉ</th>
                <th>Số điện thoại</th>
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
                      <td>{item.name}</td>
                      <td>{item.address}</td>
                      <td>{item.phone}</td>
                      <td>{item.total_revenue || 0} đ</td>
                      <td>{item.total_orders || 0}</td>
                      <td>
                        <button 
                          className="btn-edit"
                          onClick={() => this.handleEditShop(item)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => this.handleConfirmDeleteShop(item)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">Không có shop nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isOpenModalShop && (
          <ModalShop
            isOpen={isOpenModalShop}
            toggleModal={this.toggleShopModal}
          />
        )}

        {isOpenModalEditShop && (
          <ModalEditShop
            isOpen={isOpenModalEditShop}
            toggleModal={this.toggleShopEditModal}
            shopData={shopEdit}
          />
        )}

        {/* Confirm Delete Modal */}
        {isShowConfirmModal && (
          <div className="confirm-modal">
            <div className="confirm-modal-overlay" onClick={this.toggleConfirmModal}></div>
            <div className="confirm-modal-content">
              <div className="confirm-modal-header">
                <h3>Xác nhận xóa</h3>
                <span className="close-btn" onClick={this.toggleConfirmModal}>&times;</span>
              </div>
              <div className="confirm-modal-body">
                <p>Bạn có chắc chắn muốn xóa shop:</p>
                <p className="shop-name">{shopToDelete.name}</p>
                <p><strong>Địa chỉ:</strong> {shopToDelete.address || 'N/A'}</p>
                <p><strong>Số điện thoại:</strong> {shopToDelete.phone || 'N/A'}</p>
              </div>
              <div className="confirm-modal-footer">
                <button className="btn-cancel" onClick={this.toggleConfirmModal}>Hủy</button>
                <button className="btn-confirm" onClick={this.handleDeleteShop}>Xóa</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    shops: state.shop.shops
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAllShops: () => dispatch(fetchAllShopsStart()),
    deleteShop: (shopId) => dispatch(deleteShopById(shopId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopAdmin);
