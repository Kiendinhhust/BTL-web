import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { createUser } from '../../store/actions/userActions';

class ModalUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      phone_number: '',
      role: 'buyer',
      address_infor: '',
      errorMessage: ''
    };
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;
    this.setState({
      ...copyState
    });
  }

  checkValidateInput = () => {
    let isValid = true;
    let arrInput = ['username', 'password', 'email'];
    for (let i = 0; i < arrInput.length; i++) {
      if (!this.state[arrInput[i]]) {
        isValid = false;
        this.setState({
          errorMessage: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
        });
        break;
      }
    }
    return isValid;
  }

  handleAddNewUser = async () => {
    let isValid = this.checkValidateInput();
    if (isValid) {
      // Gọi API
      let userData = {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
        phone_number: this.state.phone_number,
        role: this.state.role,
        address_infor: this.state.address_infor
      };
      
      let res = await this.props.createUser(userData);
      
      if (res && res.message) {
        // Reset state
        this.setState({
          username: '',
          password: '',
          email: '',
          phone_number: '',
          role: 'buyer',
          address_infor: '',
          errorMessage: ''
        });
        
        this.props.toggleFromParent();
        alert('Thêm người dùng thành công!');
      } else {
        this.setState({
          errorMessage: res && res.message ? res.message : 'Có lỗi xảy ra!'
        });
      }
    }
  }

  render() {
    return (
      <Modal 
        isOpen={this.props.isOpen} 
        toggle={this.props.toggleFromParent} 
        className={'modal-user-container'}
        size="lg"
      >
        <ModalHeader toggle={this.props.toggleFromParent}>Thêm người dùng mới</ModalHeader>
        <ModalBody>
          <div className="modal-user-body">
            {this.state.errorMessage && (
              <div className="alert alert-danger">{this.state.errorMessage}</div>
            )}
            
            <div className="input-container">
              <label>Username <span className="required">*</span></label>
              <input 
                type="text" 
                onChange={(event) => { this.handleOnChangeInput(event, "username") }}
                value={this.state.username}
              />
            </div>
            
            <div className="input-container">
              <label>Password <span className="required">*</span></label>
              <input 
                type="password" 
                onChange={(event) => { this.handleOnChangeInput(event, "password") }}
                value={this.state.password}
              />
            </div>
            
            <div className="input-container">
              <label>Email <span className="required">*</span></label>
              <input 
                type="email" 
                onChange={(event) => { this.handleOnChangeInput(event, "email") }}
                value={this.state.email}
              />
            </div>
            
            <div className="input-container">
              <label>Số điện thoại</label>
              <input 
                type="text" 
                onChange={(event) => { this.handleOnChangeInput(event, "phone_number") }}
                value={this.state.phone_number}
              />
            </div>
            
            <div className="input-container">
              <label>Vai trò</label>
              <select
                onChange={(event) => { this.handleOnChangeInput(event, "role") }}
                value={this.state.role}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="input-container">
              <label>Địa chỉ</label>
              <input 
                type="text" 
                onChange={(event) => { this.handleOnChangeInput(event, "address_infor") }}
                value={this.state.address_infor}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="primary" 
            className="px-3" 
            onClick={this.handleAddNewUser}
          >
            Lưu
          </Button>
          <Button 
            color="secondary" 
            className="px-3" 
            onClick={this.props.toggleFromParent}
          >
            Hủy
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createUser: (userData) => dispatch(createUser(userData))
  };
};

export default connect(null, mapDispatchToProps)(ModalUser);
