import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { createNewShop } from '../../store/actions/shopAction';
import './ModalShop.scss';

class ModalShop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      address: '',
      phone: '',
      errors: {
        name: '',
        address: '',
        phone: ''
      }
    };
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
    } else if (!/^\d{10,11}$/.test(this.state.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  }

  handleAddNewShop = async () => {
    if (!this.validateForm()) return;
    
    // Create shop object
    let shop = {
      name: this.state.name,
      address: this.state.address,
      phone: this.state.phone
    };
    
    try {
      let res = await this.props.createNewShop(shop);
      
      if (res && res.success) {
        this.props.toggleModal();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      console.error('Error creating shop:', e);
      toast.error('Lỗi hệ thống');
    }
  }

  render() {
    const { isOpen, toggleModal } = this.props;
    const { errors } = this.state;
    
    if (!isOpen) return null;

    return (
      <div className="modal-shop-container">
        <div className="modal-overlay" onClick={toggleModal}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Thêm Shop Mới</h2>
            <span className="close-btn" onClick={toggleModal}>&times;</span>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Tên Shop:</label>
              <input 
                type="text" 
                value={this.state.name}
                onChange={(event) => this.handleOnChangeInput(event, 'name')}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Địa chỉ:</label>
              <input 
                type="text" 
                value={this.state.address}
                onChange={(event) => this.handleOnChangeInput(event, 'address')}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
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
              className="btn-cancel" 
              onClick={toggleModal}
            >
              Hủy
            </button>
            <button 
              className="btn-save" 
              onClick={this.handleAddNewShop}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createNewShop: (data) => dispatch(createNewShop(data))
  };
};

export default connect(null, mapDispatchToProps)(ModalShop);
