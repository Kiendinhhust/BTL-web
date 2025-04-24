import React, { Component } from 'react';
import { connect } from 'react-redux';
import { 
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
} from '../../store/actions/userAddressAction';
import { toast } from 'react-toastify';
import './UserAddress.scss';
import { get } from 'lodash';

class UserAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      editMode: false,
      currentAddress: null,
      formData: {
        address_infor: '',
        type: 'home'
      },
      errors: {},
      showDeleteModal: false,
       addressToDelete: null,
    };
  }
  openDeleteModal = (address) => {
    this.setState({ showDeleteModal: true, addressToDelete: address });
  };
  
  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false, addressToDelete: null });
  };
  componentDidMount() {
    this.loadAddresses();
  }

  loadAddresses = () => {
    const { userInfo } = this.props;
    if (userInfo?.userId) {
      this.props.getUserAddresses(userInfo.userId);
    }
  };

  handleInputChange = (e) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [e.target.name]: e.target.value
      },
      errors: {
        ...this.state.errors,
        [e.target.name]: ''
      }
    });
  };

  handleTypeSelect = (type) => {
    this.setState({
      formData: {
        ...this.state.formData,
        type
      }
    });
  };

  validateForm = () => {
    const { formData } = this.state;
    const errors = {};
    
    if (!formData.address_infor.trim()) {
      errors.address_infor = 'Vui lòng nhập địa chỉ';
    }
    
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (!this.validateForm()) return;

    const { userInfo } = this.props;
    const { formData, currentAddress, editMode } = this.state;

    try {
      if (editMode) {
        await this.props.updateUserAddress(
          userInfo.userId,
          currentAddress.address_id,
          formData
        );
        toast.success('Cập nhật địa chỉ thành công',{ autoClose: 1000 });
      } else {
        await this.props.addUserAddress(userInfo.userId, formData);
        toast.success('Thêm địa chỉ thành công',{ autoClose: 1000 });
      }
      this.closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hệ thống',{ autoClose: 500 });
    }
  };

  openModal = (address = null) => {
    this.setState({
      showModal: true,
      editMode: !!address,
      currentAddress: address,
      formData: address ? { 
        address_infor: address.address_infor,
        type: address.type
      } : {
        address_infor: '',
        type: 'home'
      }
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      editMode: false,
      currentAddress: null,
      formData: { address_infor: '', type: 'home' },
      errors: {}
    });
  };

  renderTypeBadge = (type) => {
    const types = {
      home: { label: 'Nhà riêng', color: 'home' },
      office: { label: 'Văn phòng', color: 'office' },
      other: { label: 'Khác' , color: 'other' }
    };
    
    const { label, icon, color } = types[type] || types.other;
    return (
      <span className={`type-tag ${color}`}>
        {icon} {label}
      </span>
    );
  };
  handleConfirmDelete = async () => {
    const { userInfo } = this.props;
    const { addressToDelete } = this.state;
    if (!addressToDelete) return;
    try {
      await this.props.deleteUserAddress(userInfo.userId, addressToDelete.address_id);
      this.closeDeleteModal();
      
       toast.success('Xóa địa chỉ thành công', { autoClose: 500 });
    } catch (error) {
      this.closeDeleteModal();
       toast.error(error.response?.data?.message || 'Lỗi hệ thống',{ autoClose: 500 });
    }
  };
  render() {
    const { addresses, isLoading } = this.props.userAddress;
    const { showModal, editMode, formData, errors,showDeleteModal,
      addressToDelete, } = this.state;

    return (
      <div className="user-address-container">
          <div className="header-section"> 
          <div className="title">Quản lý địa chỉ</div>
          <button
            className="btn btn-primary btn-add-new" // Thay đổi class ở đây
            onClick={() => this.openModal()}
          >
             <i className="fas fa-plus"></i> Thêm địa chỉ mới {/* Thêm icon nếu muốn */}
          </button>
        </div>

        {showModal && (
          <>
            <div className="modal-overlay"></div>
            <div className="address-modal">
              <div className="modal-header">
                <h3>{editMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                <button className="close-btn" onClick={this.closeModal}>
                  &times;
                </button>
              </div>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <textarea
                    name="address_infor"
                    value={formData.address_infor}
                    onChange={this.handleInputChange}
                    rows={3}
                  />
                  {errors.address_infor && (
                    <div className="error-message">
                      {errors.address_infor}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Loại</label>
                  <div className="type-badges">
                    <span
                      className={`type-badge${formData.type === 'home' ? ' active' : ''}`}
                      onClick={() => this.handleTypeSelect('home')}
                    >
                      Nhà riêng
                    </span>
                    <span
                      className={`type-badge${formData.type === 'office' ? ' active' : ''}`}
                      onClick={() => this.handleTypeSelect('office')}
                    >
                      Văn phòng
                    </span>
                    <span
                      className={`type-badge${formData.type === 'other' ? ' active' : ''}`}
                      onClick={() => this.handleTypeSelect('other')}
                    >
                      Khác
                    </span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={this.closeModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-save">
                    {editMode ? 'Lưu' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        <div className="address-list">
          {addresses?.map((address, index) => (
            <div 
              key={address.address_id}
              className={`address-item ${index === 0 ? 'default' : ''}`}
            >
              <div className="address-header">
                {this.renderTypeBadge(address.type)}
                {index === 0 && (
                  <span className="default-badge">Mặc định</span>
                )}
              </div>
              
              <div className="address-text">
                {address.address_infor}
              </div>

              <div className="address-actions">
                {index !== 0 && (
                  <button
                    className="btn-set-default"
                    onClick={() => this.props.setDefaultAddress(this.props.userInfo.userId, address.address_id)}
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  className="btn-edit"
                  onClick={() => this.openModal(address)}
                >
                  Chỉnh sửa
                </button>
                <button
                className="btn-delete"
                onClick={() => this.openDeleteModal(address)}
>
  Xóa
</button>
              </div>
            </div>
          ))}
          
        </div>
        {/* Add delete modal */}
        {showDeleteModal && (
          <>
            <div className="modal-overlay"></div>
            <div className="address-modal delete-modal">
              <div className="delete-icon">
                <i className="fas fa-trash-alt"></i>
              </div>
              <div className="delete-title">Xác nhận xóa địa chỉ?</div>
              <div className="delete-message">
                Bạn có chắc chắn muốn xóa địa chỉ này không?<br />
                <span style={{ color: "#e74c3c", fontWeight: 600 }}>
                  {addressToDelete?.address_infor}
                </span>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={this.closeDeleteModal}>
                  Hủy
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={this.handleConfirmDelete}
                >
                  Xóa
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.admin.userInfo,
  userAddress: state.userAddress
});

export default connect(mapStateToProps, {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
})(UserAddress);
