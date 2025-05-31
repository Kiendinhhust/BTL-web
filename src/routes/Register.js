import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { KeyCodeUtils, LanguageUtils } from "../utils";
import userIcon from "../../src/assets/images/user.svg";
import passIcon from "../../src/assets/images/pass.svg";
import "./Register.scss";
import { FormattedMessage } from "react-intl";
import { handleRegisterApi } from "../services/userService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
class Register extends Component {
  constructor(props) {
    super(props);
    this.btnRegister = React.createRef();
    this.state = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      showPassword: false,
      errorMessage: "",
      isLoading: false,
    };
  }

  handleOnChangeUsername = (e) => {
    this.setState({
      username: e.target.value,
    });
  };

  handleOnChangeEmail = (e) => {
    this.setState({
      email: e.target.value,
    });
  };

  handleOnChangePassword = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  handleOnChangeConfirmPassword = (e) => {
    this.setState({
      confirmPassword: e.target.value,
    });
  };

  togglePasswordVisibility = () => {
    this.setState({
      showPassword: !this.state.showPassword,
    });
  };

  validateInputs = () => {
    if (!this.state.username || !this.state.email || !this.state.password) {
      this.setState({
        errorMessage: "Vui lòng điền đầy đủ thông tin!",
      });
      return false;
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        errorMessage: "Mật khẩu xác nhận không khớp!",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.state.email)) {
      this.setState({
        errorMessage: "Email không hợp lệ!",
      });
      return false;
    }

    return true;
  };

  handleRegister = async () => {
    this.setState({ errorMessage: "", isLoading: true });

    // Validate form
    if (!this.state.username || !this.state.email || !this.state.password) {
      this.setState({
        errorMessage: "Vui lòng điền đầy đủ thông tin",
        isLoading: false,
      });
      return;
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        errorMessage: "Mật khẩu xác nhận không khớp",
        isLoading: false,
      });
      return;
    }

    try {
      const res = await handleRegisterApi(
        this.state.username,
        this.state.email,
        this.state.password
      );
      if (res.statusText === "OK") {
        toast.success(
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "24px", marginRight: "10px" }}>📧</span>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                Đã gửi OTP!
              </div>
              <div>OTP đang được gửi đến gmail của bạn, xin đợi một lát</div>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            className: "navy-toast",
            progressClassName: "navy-toast-progress",
            style: {
              background: "#001f3f",
              color: "white",
              fontSize: "16px",
              fontWeight: "500",
              padding: "15px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              width: "380px",
              minHeight: "80px",
            },
            progressStyle: {
              background: "rgba(255, 255, 255, 0.7)",
              height: "4px",
            },
          }
        );

        this.setState({ isLoading: false });
        setTimeout(() => {
          this.props.navigate(`/verify-otp?email=${this.state.email}`);
        }, 5000);
      } else {
        this.setState({ isLoading: false });
        toast.error(
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "24px", marginRight: "10px" }}>📧</span>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                Lỗi đăng ký
              </div>
              <div>Tên đăng nhập đã tồn tại hoặc không hợp lệ</div>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            className: "navy-toast",
            progressClassName: "navy-toast-progress",
            style: {
              background: "#001f3f",
              color: "white",
              fontSize: "16px",
              fontWeight: "500",
              padding: "15px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              width: "380px",
              minHeight: "80px",
            },
            progressStyle: {
              background: "rgba(255, 255, 255, 0.7)",
              height: "4px",
            },
          }
        );
      }
    } catch (error) {
      this.setState({ isLoading: false });
      if (error.response && error.response.data) {
        this.setState({
          errorMessage: error.response.data.error || "Đăng ký thất bại!",
        });
      } else {
        this.setState({
          errorMessage: "Lỗi kết nối, vui lòng thử lại sau!",
        });
      }
    }
  };

  handleKeyDown = (event) => {
    const keyCode = event.which || event.keyCode;
    if (keyCode === KeyCodeUtils.ENTER) {
      event.preventDefault();
      if (!this.btnRegister.current || this.btnRegister.current.disabled)
        return;
      this.btnRegister.current.click();
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    // Fix Warning
    this.setState = () => {
      return;
    };
  }

  render() {
    const {
      username,
      email,
      password,
      confirmPassword,
      errorMessage,
      showPassword,
      isLoading,
    } = this.state;
    const { lang } = this.props;

    return (
      <div className="register-background">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Đang xử lý đăng ký...</p>
            </div>
          </div>
        )}
        <div className="register-container">
          <div className="register-content row">
            <div className="text-register-container">
              <div className="text-register">
                <FormattedMessage
                  id="register.title"
                  defaultMessage="ĐĂNG KÝ"
                />
              </div>
            </div>
            <div className="col-12 form-group register-input">
              <label>
                <FormattedMessage
                  id="register.username"
                  defaultMessage="Tên đăng nhập:"
                />
              </label>
              <div className="custom-input">
                <img className="icon" src={userIcon} alt="User Icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder={LanguageUtils.getMessageByKey(
                    "register.username",
                    lang
                  )}
                  value={username}
                  onChange={this.handleOnChangeUsername}
                />
              </div>
            </div>
            <div className="col-12 form-group register-input">
              <label>
                <FormattedMessage id="register.email" defaultMessage="Email:" />
              </label>
              <div className="custom-input">
                <img className="icon" alt="Email Icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder={LanguageUtils.getMessageByKey(
                    "register.email",
                    lang
                  )}
                  value={email}
                  onChange={this.handleOnChangeEmail}
                />
              </div>
            </div>
            <div className="col-12 form-group register-input">
              <label>
                <FormattedMessage
                  id="register.password"
                  defaultMessage="Mật khẩu:"
                />
              </label>
              <div className="custom-input-password">
                <img className="icon" src={passIcon} alt="Password Icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder={LanguageUtils.getMessageByKey(
                    "register.password",
                    lang
                  )}
                  value={password}
                  onChange={this.handleOnChangePassword}
                />
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  onClick={this.togglePasswordVisibility}
                ></i>
              </div>
            </div>
            <div className="col-12 form-group register-input">
              <label>
                <FormattedMessage
                  id="register.confirm-password"
                  defaultMessage="Xác nhận mật khẩu:"
                />
              </label>
              <div className="custom-input-password">
                <img className="icon" src={passIcon} alt="Password Icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder={LanguageUtils.getMessageByKey(
                    "register.confirm-password",
                    lang
                  )}
                  value={confirmPassword}
                  onChange={this.handleOnChangeConfirmPassword}
                />
              </div>
            </div>
            {errorMessage && (
              <div className="col-12" style={{ color: "red" }}>
                {errorMessage}
              </div>
            )}
            <div className="col-12">
              <button
                ref={this.btnRegister}
                className="btn-register"
                onClick={this.handleRegister}
                disabled={isLoading}
              >
                <FormattedMessage
                  id="register.register"
                  defaultMessage="Đăng ký"
                />
              </button>
            </div>
            <div className="col-12 text-center mt-3">
              <span className="login-link">
                <FormattedMessage
                  id="register.have-account"
                  defaultMessage="Đã có tài khoản?"
                />
                <Link to="/login" className="login-link">
                  Đăng nhập ngay
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lang: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
