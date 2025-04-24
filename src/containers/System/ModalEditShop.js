import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { updateShopInfo, fetchAllShopsStart } from '../../store/actions/shopAction';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import CommonUtils from '../../utils/CommonUtils';
import '../System/UserManage.scss';

class ModalEditShop extends Component {
  constructor(props) {
    super(props);
    const { shopData } = props;
    this.state = {
      shopId: shopData.shop_id,
      name: shopData.shop_name || '',
      address: shopData.address || '',
      phone: shopData.phone || '',
      previewImgURL: '',
      isOpen: false,
      avatar: '',
      errors: {
        name: '',
        address: '',
        phone: ''
      }
    };

    // Nếu có ảnh, hiển thị ảnh
    if (shopData.img) {
      this.state.previewImgURL = CommonUtils.getBase64Image(shopData.img);
      this.state.avatar = shopData.img;
    }
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;

    // Clear error when user types
    if (copyState.errors[id]) {
      copyState.errors[id] = '';
    }

    this.setState({
      ...copyState
    });
  }

  validateForm = () => {
    let isValid = true;
    let errors = {
      name: '',
      address: '',
      phone: ''
    };

    if (!this.state.name) {
      errors.name = 'Tên shop không được để trống';
      isValid = false;
    }

    if (!this.state.address) {
      errors.address = 'Địa chỉ không được để trống';
      isValid = false;
    }

    if (!this.state.phone) {
      errors.phone = 'Số điện thoại không được để trống';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  }

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let objectUrl = URL.createObjectURL(file);
      this.setState({
        previewImgURL: objectUrl
      });

      try {
        let base64String = await CommonUtils.fileToBase64(file);
        this.setState({
          avatar: base64String
        });
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  }

  openPreviewImage = () => {
    if (!this.state.previewImgURL) return;
    this.setState({
      isOpen: true
    });
  }

  handleUpdateShop = async () => {
    if (!this.validateForm()) return;

    // Create shop object
    let shop = {
      shop_name: this.state.name,
      address: this.state.address,
      phone: this.state.phone,
      img: this.state.avatar
    };

    try {
      let res = await this.props.updateShop(this.state.shopId, shop);

      if (res && res.success) {
        this.props.toggleModal();
        // Cập nhật lại danh sách shop
        this.props.fetchAllShops();
        toast.success(res.message,{ autoClose: 1500 });
      } else {
        toast.error(res.message,{ autoClose: 1500 });
      }
    } catch (e) {
      console.error('Error updating shop:', e);
      toast.error('Lỗi hệ thống',{ autoClose: 1500 });
    }
  }

  render() {
    const { isOpen, toggleModal } = this.props;
    const { errors, isOpen: isOpenLightbox, previewImgURL } = this.state;

    if (!isOpen) return null;

    return (
      <div className="modal-user-container">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Sửa Thông Tin Shop</h5>
            <button type="button" className="close" onClick={toggleModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-user-body">
            {this.state.errorMessage && (
              <div className="alert alert-danger">{this.state.errorMessage}</div>
            )}

            <div className="input-container">
              <label>Tên Shop: <span className="required">*</span></label>
              <input
                type="text"
                value={this.state.name}
                onChange={(event) => this.handleOnChangeInput(event, 'name')}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="input-container">
              <label>Ảnh Shop:</label>
              <div className="preview-img-container">
                <input
                  id="previewImg"
                  type="file"
                  hidden
                  onChange={(event) => this.handleOnChangeImage(event)}
                />
                <label className="label-upload" htmlFor="previewImg">Tải ảnh <i className="fas fa-upload"></i></label>
                <div
                  className="preview-image"
                  style={{ backgroundImage: `url(${this.state.previewImgURL})` }}
                  onClick={() => this.openPreviewImage()}
                >
                </div>
              </div>
            </div>

            <div className="input-container">
              <label>Địa chỉ: <span className="required">*</span></label>
              <input
                type="text"
                value={this.state.address}
                onChange={(event) => this.handleOnChangeInput(event, 'address')}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="input-container">
              <label>Số điện thoại: <span className="required">*</span></label>
              <input
                type="text"
                value={this.state.phone}
                onChange={(event) => this.handleOnChangeInput(event, 'phone')}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={toggleModal}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary"
              onClick={this.handleUpdateShop}
            >
              Lưu
            </button>
          </div>
        </div>

        {isOpenLightbox && (
          <Lightbox
            mainSrc={previewImgURL}
            onCloseRequest={() => this.setState({ isOpen: false })}
            reactModalStyle={{
              overlay: {
                zIndex: 1050
              },
              content: {
                zIndex: 1060
              }
            }}
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateShop: (shopId, data) => dispatch(updateShopInfo(shopId, data)),
    fetchAllShops: () => dispatch(fetchAllShopsStart())
  };
};

export default connect(null, mapDispatchToProps)(ModalEditShop);
