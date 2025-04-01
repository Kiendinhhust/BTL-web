import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { fetchAllUsersStart, deleteUser } from '../../store/actions/userActions';
import './UserManage.scss';
import ModalUser from './ModalUser.js';
import ModalEditUser from './ModalEditUser.js';

class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenModalUser: false,
      isOpenModalEditUser: false,
      userEdit: {}
    };
  }

  componentDidMount() {
    this.props.fetchAllUsers();
  }

  handleAddNewUser = () => {
    this.setState({
      isOpenModalUser: true
    });
  }

  toggleUserModal = () => {
    this.setState({
      isOpenModalUser: !this.state.isOpenModalUser
    });
  }

  toggleUserEditModal = () => {
    this.setState({
      isOpenModalEditUser: !this.state.isOpenModalEditUser
    });
  }

  handleEditUser = (user) => {
    this.setState({
      isOpenModalEditUser: true,
      userEdit: user
    });
  }

  handleDeleteUser = async (user) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      let res = await this.props.deleteUser(user.user_id);
      if (res && res.success) {
        alert(res.message);
      } else {
        alert(res.message);
      }
    }
  }

  render() {
    let { users } = this.props;
    let { isOpenModalUser, isOpenModalEditUser, userEdit } = this.state;
    
    return (
      <div className="users-container">
        <div className="title">
          <FormattedMessage id="manage-user.title" defaultMessage="Quản lý người dùng" />
        </div>
        
        <div className="mx-1">
          <button 
            className="btn btn-primary px-3"
            onClick={this.handleAddNewUser}
          >
            <i className="fas fa-plus"></i> Thêm người dùng
          </button>
        </div>
        
        <div className="users-table mt-3 mx-1">
          <table id="customers">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 && 
                users.map((item, index) => {
                  // Lấy thông tin từ các đối tượng lồng nhau
                  const userInfo = item.UserInfo && item.UserInfo.length > 0 ? item.UserInfo[0] : {};
                  const address = item.UserAddresses && item.UserAddresses.length > 0 
                    ? item.UserAddresses[0].address_infor 
                    : '';
                  
                  return (
                    <tr key={index}>
                      <td>{item.user_id}</td>
                      <td>{item.username}</td>
                      <td>{userInfo.email}</td>
                      <td>{userInfo.phone_number}</td>
                      <td>{item.role}</td>
                      <td>{address}</td>
                      <td>
                        <button 
                          className="btn-edit" 
                          onClick={() => this.handleEditUser(item)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => this.handleDeleteUser(item)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        
        <ModalUser 
          isOpen={isOpenModalUser}
          toggleFromParent={this.toggleUserModal}
        />
        
        {isOpenModalEditUser && 
          <ModalEditUser 
            isOpen={isOpenModalEditUser}
            toggleFromParent={this.toggleUserEditModal}
            currentUser={userEdit}
          />
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.user.users
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAllUsers: () => dispatch(fetchAllUsersStart()),
    deleteUser: (userId) => dispatch(deleteUser(userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
