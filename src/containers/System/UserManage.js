import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import { toast } from "react-toastify";
import {
  fetchAllUsersStart,
  deleteUser,
} from "../../store/actions/userActions";
import "./UserManage.scss";
import ModalUser from "./ModalUser.js";
import ModalEditUser from "./ModalEditUser.js";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenModalUser: false,
      isOpenModalEditUser: false,
      userEdit: {},
      isOpenLightbox: false,
      photoIndex: 0,
      currentImageUrl: "",
      isLoading: false,
      isShowConfirmModal: false,
      userToDelete: {},
    };
  }

  componentDidMount() {
    // Set loading state to true before fetching data
    this.setState({ isLoading: true });

    // Fetch users data
    this.props.fetchAllUsers();

    // Simulate loading for 1.5 seconds
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 600);
  }

  handleAddNewUser = () => {
    this.setState({
      isOpenModalUser: true,
    });
  };

  toggleUserModal = () => {
    this.setState({
      isOpenModalUser: !this.state.isOpenModalUser,
    });
  };

  toggleUserEditModal = () => {
    this.setState({
      isOpenModalEditUser: !this.state.isOpenModalEditUser,
    });
  };

  handleEditUser = (user) => {
    this.setState({
      isOpenModalEditUser: true,
      userEdit: user,
    });
  };

  handleConfirmDeleteUser = (user) => {
    this.setState({
      isShowConfirmModal: true,
      userToDelete: user,
    });
  };

  toggleConfirmModal = () => {
    this.setState({
      isShowConfirmModal: !this.state.isShowConfirmModal,
      userToDelete: {},
    });
  };

  handleDeleteUser = async () => {
    let user = this.state.userToDelete;
    this.toggleConfirmModal();

    // Hiển thị loading spinner
    this.setState({ isLoading: true });

    // Gọi API xóa người dùng
    let res = await this.props.deleteUser(user.user_id);

    // Giữ loading spinner trong 1.5 giây
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
  };

  openLightbox = (imageUrl) => {
    if (imageUrl && imageUrl !== "https://via.placeholder.com/40?text=User") {
      this.setState({
        isOpenLightbox: true,
        currentImageUrl: imageUrl,
      });
    }
  };

  render() {
    let { users } = this.props;
    let {
      isOpenModalUser,
      isOpenModalEditUser,
      userEdit,
      isOpenLightbox,
      currentImageUrl,
      isLoading,
      isShowConfirmModal,
      userToDelete,
    } = this.state;

    // console.log('userAddressusermanage', this.props.userAddress);
    return (
      <div className="users-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <>
            <div className="title">
              <FormattedMessage
                id="manage-user.title"
                defaultMessage="Quản lý người dùng"
              />
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
                    <th>Ảnh</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Địa chỉ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users &&
                    users.length > 0 &&
                    users.map((item, index) => {
                      // Lấy thông tin từ các đối tượng lồng nhau
                      const userInfo = item.UserInfo ? item.UserInfo : {};
                      const address =
                        item.UserAddresses && item.UserAddresses.length > 0
                          ? item.UserAddresses[0].address_infor
                          : "";

                      // Tạo URL ảnh từ base64 nếu có
                      let imageUrl = "https://avatar.iran.liara.run/public";
                      try {
                        if (
                          userInfo &&
                          userInfo.img &&
                          userInfo.img.data.length > 0
                        ) {
                          imageUrl = Buffer.from(
                            userInfo.img,
                            "base64"
                          ).toString("binary");
                        } else {
                        }
                      } catch (error) {
                        console.error("Lỗi xử lý ảnh:", error);
                      }

                      return (
                        <tr key={index}>
                          <td>{item.user_id}</td>
                          <td>
                            <div
                              className="user-image"
                              style={{
                                backgroundImage: `url(${imageUrl})`,
                                width: "40px",
                                height: "40px",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "50%",
                                cursor: "pointer",
                              }}
                              onClick={() => this.openLightbox(imageUrl)}
                            ></div>
                          </td>
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
                              onClick={() => this.handleConfirmDeleteUser(item)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <ModalUser
              isOpen={isOpenModalUser}
              toggleFromParent={this.toggleUserModal}
            />

            {isOpenModalEditUser && (
              <ModalEditUser
                isOpen={isOpenModalEditUser}
                toggleFromParent={this.toggleUserEditModal}
                currentUser={userEdit}
              />
            )}

            {isOpenLightbox && (
              <Lightbox
                mainSrc={currentImageUrl}
                onCloseRequest={() => this.setState({ isOpenLightbox: false })}
                reactModalStyle={{
                  overlay: {
                    zIndex: 1050,
                  },
                  content: {
                    zIndex: 1060,
                  },
                }}
              />
            )}

            {isShowConfirmModal && (
              <>
                <div className="confirm-modal" tabIndex="-1" role="dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <i className="fas fa-exclamation-triangle"></i>
                        Xác nhận xóa người dùng
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={this.toggleConfirmModal}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p>
                        Bạn có chắc chắn muốn xóa người dùng{" "}
                        <strong>{userToDelete.username}</strong>?
                      </p>
                      <p>Hành động này không thể hoàn tác.</p>

                      <div className="user-info-preview">
                        {userToDelete.UserInfo && userToDelete.UserInfo.img ? (
                          <img
                            src={Buffer.from(
                              userToDelete.UserInfo.img,
                              "base64"
                            ).toString("binary")}
                            alt={userToDelete.username}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://avatar.iran.liara.run/public";
                            }}
                          />
                        ) : (
                          <img
                            src="https://avatar.iran.liara.run/public"
                            alt="Default avatar"
                          />
                        )}
                        <div className="user-info-text">
                          <p>
                            <strong>Email:</strong>{" "}
                            {userToDelete.UserInfo?.email || "N/A"}
                          </p>
                          <p>
                            <strong>Vai trò:</strong>{" "}
                            {userToDelete.role || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={this.toggleConfirmModal}
                      >
                        <i className="fas fa-times"></i> Hủy
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={this.handleDeleteUser}
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-backdrop fade show"></div>
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userAddress: state.userAddress,
    users: state.user.users,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllUsers: () => dispatch(fetchAllUsersStart()),
    deleteUser: (userId) => dispatch(deleteUser(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
