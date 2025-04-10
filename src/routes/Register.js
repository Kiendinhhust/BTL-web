import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import { KeyCodeUtils, LanguageUtils } from "../utils";
import userIcon from '../../src/assets/images/user.svg';
import passIcon from '../../src/assets/images/pass.svg';
import './Register.scss';
import { FormattedMessage } from 'react-intl';
import { handleRegisterApi } from '../services/userService';

class Register extends Component {
    constructor(props) {
        super(props);
        this.btnRegister = React.createRef();
        this.state = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            errorMessage: ''
        }
    }

    handleOnChangeUsername = (e) => {
        this.setState({
            username: e.target.value
        });
    }

    handleOnChangeEmail = (e) => {
        this.setState({
            email: e.target.value
        });
    }

    handleOnChangePassword = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    handleOnChangeConfirmPassword = (e) => {
        this.setState({
            confirmPassword: e.target.value
        });
    }

    togglePasswordVisibility = () => {
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    validateInputs = () => {
        if (!this.state.username || !this.state.email || !this.state.password) {
            this.setState({
                errorMessage: 'Vui lòng điền đầy đủ thông tin!'
            });
            return false;
        }

        if (this.state.password !== this.state.confirmPassword) {
            this.setState({
                errorMessage: 'Mật khẩu xác nhận không khớp!'
            });
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.state.email)) {
            this.setState({
                errorMessage: 'Email không hợp lệ!'
            });
            return false;
        }

        return true;
    }

    handleRegister = async () => {
        this.setState({ errorMessage: '' });
    
        // Validate form
        if (!this.state.username || !this.state.email || !this.state.password) {
            this.setState({ errorMessage: 'Vui lòng điền đầy đủ thông tin' });
            return;
        }
    
        if (this.state.password !== this.state.confirmPassword) {
            this.setState({ errorMessage: 'Mật khẩu xác nhận không khớp' });
            return;
        }
    
        try {
            let response = await handleRegisterApi(
                this.state.username,
                this.state.email,
                this.state.password
            );
            
            // Kiểm tra nếu response có message "OTP đã được gửi đến email của bạn!"
            if (response && response.data && response.data.message === 'OTP đã được gửi đến email của bạn!') {
                // Chuyển hướng đến trang VerifyOTP với email trong query string
                this.props.navigate(`/verify-otp?email=${this.state.email}`);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                this.setState({
                    errorMessage: error.response.data.error || 'Đăng ký thất bại!'
                });
            } else {
                this.setState({
                    errorMessage: 'Lỗi kết nối, vui lòng thử lại sau!'
                });
            }
        }
    }
    

    handleKeyDown = (event) => {
        const keyCode = event.which || event.keyCode;
        if (keyCode === KeyCodeUtils.ENTER) {
            event.preventDefault();
            if (!this.btnRegister.current || this.btnRegister.current.disabled) return;
            this.btnRegister.current.click();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        // Fix Warning
        this.setState = () => {
            return;
        };
    }

    render() {
        const { username, email, password, confirmPassword, errorMessage, showPassword } = this.state;
        const { lang } = this.props;

        return (
            <div className="register-background">
                <div className="register-container">
                    <div className="register-content row">
                        <div className="text-register-container">
                            <div className="text-register">
                                <FormattedMessage id="register.title" defaultMessage="ĐĂNG KÝ" />
                            </div>
                        </div>
                        <div className="col-12 form-group register-input">
                            <label><FormattedMessage id="register.username" defaultMessage="Tên đăng nhập:" /></label>
                            <div className="custom-input">
                                <img className="icon" src={userIcon} alt="User Icon" />
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={LanguageUtils.getMessageByKey("register.username", lang)}
                                    value={username} 
                                    onChange={this.handleOnChangeUsername} 
                                />
                            </div>
                        </div>
                        <div className="col-12 form-group register-input">
                            <label><FormattedMessage id="register.email" defaultMessage="Email:" /></label>
                            <div className="custom-input">
                                <img className="icon" />
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    placeholder={LanguageUtils.getMessageByKey("register.email", lang)}
                                    value={email} 
                                    onChange={this.handleOnChangeEmail} 
                                />
                            </div>
                        </div>
                        <div className="col-12 form-group register-input">
                            <label><FormattedMessage id="register.password" defaultMessage="Mật khẩu:" /></label>
                            <div className="custom-input-password">
                                <img className="icon" src={passIcon} alt="Password Icon" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control" 
                                    placeholder={LanguageUtils.getMessageByKey("register.password", lang)}
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
                            <label><FormattedMessage id="register.confirm-password" defaultMessage="Xác nhận mật khẩu:" /></label>
                            <div className="custom-input-password">
                                <img className="icon" src={passIcon} alt="Password Icon" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control" 
                                    placeholder={LanguageUtils.getMessageByKey("register.confirm-password", lang)}
                                    value={confirmPassword} 
                                    onChange={this.handleOnChangeConfirmPassword} 
                                />
                            </div>
                        </div>
                        {errorMessage && (
                            <div className='col-12' style={{color:'red'}}>
                                {errorMessage}
                            </div>
                        )}
                        <div className="col-12">
                            <button 
                                ref={this.btnRegister}
                                className="btn-register" 
                                onClick={this.handleRegister}
                            >
                                <FormattedMessage id="register.register" defaultMessage="Đăng ký" />
                            </button>
                        </div>
                        <div className="col-12 text-center mt-3">
                            <span className="login-link">
                                <FormattedMessage id="register.have-account" defaultMessage="Đã có tài khoản?" /> 
                                <a href="/login">
                                    <FormattedMessage id="register.login" defaultMessage="Đăng nhập ngay" />
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        lang: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigate: (path) => dispatch(push(path))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
