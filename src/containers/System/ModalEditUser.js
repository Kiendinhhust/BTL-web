import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { updateUser } from '../../store/actions/userActions';

class ModalEditUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      username: '',
      password: '',
      email: '',
      phone_number: '',
      role: '',
      address_infor: '',
      errorMessage: ''
    };
  }

  componentDidMount() {
    let { currentUser } = this.props;
    if (currentUser) {
      // Lấy thông tin từ các đối tượng lồng nhau
      const userInfo = currentUser.UserInfo && currentUser.UserInfo.length > 0 
        ? currentUser.UserInfo[0] 
        : {};
      
      const address = currentUser.UserAddresses && currentUser.UserAddresses.length > 0 
        ? currentUser.UserAddresses[0].address_infor 
        : '';
      
      this.setState({
        userId: currentUser.user_id,
        username: currentUser.username,
        email: userInfo.email || '',
        phone_number: userInfo.phone_number || '',
        role: currentUser.role,
        address_infor: address
      });
    }
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;
    this.setState({
      ...copyState
    });
  }

  handleSaveUser = async () => {
    // Tạo đối tượng userData chỉ với các trường cần cập nhật
    let userData = {
      phone_number: this.state.phone_number,
      role: this.state.role,
      address_infor: this.state.address_infor
    };
    
    // Chỉ thêm password nếu người dùng đã nhập
    if (this.state.password) {
      userData.password = this.state.password;
    }
    
    let res = await this.props.updateUser(this.state.userId, userData);
    
    if (res && res.message) {
      this.props.toggleFromParent();
      alert('Cập nhật người dùng thành công!');
    } else {
      this.setState({
        errorMessage: res && res.message ? res.message : 'Có lỗi xảy ra!'
      });
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
        <ModalHeader toggle={this.props.toggleFromParent}>Sửa thông tin người dùng</ModalHeader>
        <ModalBody>
          <div className="modal-user-body">
            {this.state.errorMessage && (
              <div className="alert alert-danger">{this.state.errorMessage}</div>
            )}
            
            <div className="input-container">
              <label>Username</label>
              <input 
                type="text" 
                value={this.state.username}
                disabled
              />
            </div>
            
            <div className="input-container">
              <label>Password</label>
              <input 
                type="password" 
                onChange={(event) => { this.handleOnChangeInput(event, "password") }}
                value={this.state.password}
                placeholder="Để trống nếu không muốn thay đổi"
              />
            </div>
            
            <div className="input-container">
              <label>Email</label>
              <input 
                type="email" 
                value={this.state.email}
                disabled
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
            onClick={this.handleSaveUser}
          >
            Lưu thay đổi
          </Button>
          <Button 
            color="secondary" 
            className="px-3" 
            onClick={this.props.toggleFromParent}
          >
            Đóng
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (userId, userData) => dispatch(updateUser(userId, userData))
  };
};

export default connect(null, mapDispatchToProps)(ModalEditUser);
