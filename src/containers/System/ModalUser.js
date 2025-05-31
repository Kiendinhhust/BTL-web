import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { createUser } from "../../store/actions/userActions";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

import CommonUtils from "../../utils/CommonUtils";
class ModalUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
      phone_number: "",
      role: "buyer",
      address_infor: "",
      errorMessage: "",
      previewImgURL: "",
      isOpen: false,
      avatar: "",
    };
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  checkValidateInput = () => {
    let isValid = true;
    let arrInput = ["username", "password", "email"];
    for (let i = 0; i < arrInput.length; i++) {
      if (!this.state[arrInput[i]]) {
        isValid = false;
        this.setState({
          errorMessage: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        });
        break;
      }
    }
    return isValid;
  };

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
        address_infor: this.state.address_infor,
        img: this.state.avatar,
      };

      let res = await this.props.createUser(userData);

      if (res && res.success !== false) {
        // Reset state
        this.setState({
          username: "",
          password: "",
          email: "",
          phone_number: "",
          role: "buyer",
          address_infor: "",
          errorMessage: "",
          previewImgURL: "",
          avatar: "",
        });

        this.props.toggleFromParent();

        // Hiển thị thông báo thành công với Toast
        toast.success("Thêm người dùng thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Hiển thị thông báo lỗi với Toast
        toast.error(
          res && res.errorMessage ? res.errorMessage : "Có lỗi xảy ra!",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // Cập nhật state để hiển thị lỗi trong form
        this.setState({
          errorMessage:
            res && res.errorMessage ? res.errorMessage : "Có lỗi xảy ra!",
        });
      }
    }
  };

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
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

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={this.props.toggleFromParent}
        className={"modal-user-container"}
        size="lg"
      >
        <ModalHeader toggle={this.props.toggleFromParent}>
          Thêm người dùng mới
        </ModalHeader>
        <ModalBody>
          <div
            className="modal-user-body"
            style={{
              overflowY: "scroll",
              maxHeight: "70vh",
              padding: "10px",
            }}
          >
            {this.state.errorMessage && (
              <div className="alert alert-danger">
                {this.state.errorMessage}
              </div>
            )}

            <div className="input-container">
              <label>
                Username <span className="required">*</span>
              </label>
              <input
                type="text"
                onChange={(event) => {
                  this.handleOnChangeInput(event, "username");
                }}
                value={this.state.username}
              />
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
              <label>
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                onChange={(event) => {
                  this.handleOnChangeInput(event, "password");
                }}
                value={this.state.password}
              />
            </div>

            <div className="input-container">
              <label>
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                onChange={(event) => {
                  this.handleOnChangeInput(event, "email");
                }}
                value={this.state.email}
              />
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
    createUser: (userData) => dispatch(createUser(userData)),
  };
};

export default connect(null, mapDispatchToProps)(ModalUser);
