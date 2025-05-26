import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../../store/actions/userActions";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import CommonUtils from "../../utils/CommonUtils";

class ModalEditUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      username: "",
      password: "",
      email: "",
      phone_number: "",
      role: "",
      address_infor: "",
      errorMessage: "",
      previewImgURL: "",
      isOpen: false,
      avatar: "",
    };
  }

  componentDidMount() {
    let { currentUser } = this.props;
    if (currentUser) {
      // Lấy thông tin từ các đối tượng lồng nhau
      const userInfo = currentUser.UserInfo || {};

      const address =
        currentUser.UserAddresses && currentUser.UserAddresses.length > 0
          ? currentUser.UserAddresses[0].address_infor
          : "";

      // Nếu có ảnh, tạo URL để hiển thị
      let imageUrl = "";
      if (userInfo.img) {
        imageUrl = new Buffer(userInfo.img, "base64").toString("binary");
      }

      this.setState({
        userId: currentUser.user_id,
        username: currentUser.username,
        email: userInfo.email || "",
        phone_number: userInfo.phone_number || "",
        role: currentUser.role,
        address_infor: address,
        previewImgURL: imageUrl,
        avatar: userInfo.img || "",
      });
    }
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];

    // console.log("File selected:", file);

    if (file) {
      let objectUrl = URL.createObjectURL(file);
      this.setState({
        previewImgURL: objectUrl,
      });

      try {
        let base64String = await CommonUtils.fileToBase64(file);
        this.setState({
          avatar: base64String,
        });
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  openPreviewImage = () => {
    if (!this.state.previewImgURL) return;
    this.setState({
      isOpen: true,
    });
  };

  handleSaveUser = async () => {
    let { currentUser } = this.props;
    const userInfo = currentUser.UserInfo || {};
    let userData = {
      phone_number: this.state.phone_number,
      role: this.state.role,
      address_infor: this.state.address_infor,
    };

    // Chỉ thêm ảnh nếu người dùng đã nhập khác với ảnh cũ
    if (this.state.avatar && this.state.avatar !== userInfo.img) {
      userData.img = this.state.avatar;
    }

    // Chỉ thêm password nếu người dùng đã nhập
    if (this.state.password) {
      userData.password = this.state.password;
    }

    let res = await this.props.updateUser(this.state.userId, userData);

    if (res && res.message) {
      this.props.toggleFromParent();

      // Hiển thị thông báo thành công với Toast
      toast.success("Cập nhật người dùng thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      // Hiển thị thông báo lỗi với Toast
      toast.error(res && res.message ? res.message : "Có lỗi xảy ra!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      this.setState({
        errorMessage: res && res.message ? res.message : "Có lỗi xảy ra!",
      });
    }
  };

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={this.props.toggleFromParent}
        className={"modal-user-container"}
        size="lg"
      >
        <ModalHeader toggle={this.props.toggleFromParent}>
          Sửa thông tin người dùng
        </ModalHeader>
        <ModalBody>
          <div className="modal-user-body">
            {this.state.errorMessage && (
              <div className="alert alert-danger">
                {this.state.errorMessage}
              </div>
            )}

            <div className="input-container">
              <label>Username</label>
              <input type="text" value={this.state.username} disabled />
            </div>

            <div className="input-container">
              <label>Ảnh đại diện</label>
              <div className="preview-img-container">
                <input
                  id="previewImg"
                  type="file"
                  hidden
                  onChange={(event) => this.handleOnChangeImage(event)}
                />
                <label className="label-upload" htmlFor="previewImg">
                  Tải ảnh <i className="fas fa-upload"></i>
                </label>
                <div
                  className="preview-image"
                  style={{
                    backgroundImage: `url(${this.state.previewImgURL})`,
                  }}
                  onClick={() => this.openPreviewImage()}
                ></div>
              </div>
            </div>

            <div className="input-container">
              <label>Password</label>
              <input
                type="password"
                onChange={(event) => {
                  this.handleOnChangeInput(event, "password");
                }}
                value={this.state.password}
                placeholder="Để trống nếu không muốn thay đổi"
              />
            </div>

            <div className="input-container">
              <label>Email</label>
              <input type="email" value={this.state.email} disabled />
            </div>

            <div className="input-container">
              <label>Số điện thoại</label>
              <input
                type="text"
                onChange={(event) => {
                  this.handleOnChangeInput(event, "phone_number");
                }}
                value={this.state.phone_number}
              />
            </div>

            <div className="input-container">
              <label>Vai trò</label>
              <select
                onChange={(event) => {
                  this.handleOnChangeInput(event, "role");
                }}
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
                onChange={(event) => {
                  this.handleOnChangeInput(event, "address_infor");
                }}
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

        {this.state.isOpen && (
          <Lightbox
            mainSrc={this.state.previewImgURL}
            onCloseRequest={() => this.setState({ isOpen: false })}
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
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (userId, userData) => dispatch(updateUser(userId, userData)),
  };
};

export default connect(null, mapDispatchToProps)(ModalEditUser);
