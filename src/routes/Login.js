import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../store/actions";
import { KeyCodeUtils, LanguageUtils } from "../utils";
import userIcon from '../../src/assets/images/user.svg';
import passIcon from '../../src/assets/images/pass.svg';
import './Login.scss';
import { FormattedMessage } from 'react-intl';
import { handleLoginApi } from '../services/userService';
import { Link } from 'react-router-dom';
class Login extends Component {
    constructor(props) {
        super(props);
        this.btnLogin = React.createRef();
        this.state = {
            username: '',
            password: '',
            showPassword: false,
            errorMessage: ''
        }
    }

    handleOnChangeUsername = (e) => {
        this.setState({
            username: e.target.value
        });
    }

    handleOnChangePassword = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    togglePasswordVisibility = () => {
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    // redirectToSystemPage = () => {
    //     const redirectPath = '/home';
    //     this.props.history.push(redirectPath);
    //   }

    handleLogin = async () => {
        this.setState({ errorMessage: '' });
        
        try {
            
            let response = await handleLoginApi(this.state.username, this.state.password);
            console.log('check',response.data.accessToken)
            if (response && response.data.accessToken) {
                // Tạo đối tượng userInfo  từ phản hồi API
                let userInfo  = {
                    username: response.data.username,
                    userId: response.data.userId,
                    email: response.data.email,
                    role: response.data.role,
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                }
                console.log('check', userInfo)
                
                // Lưu thông tin đăng nhập vào Redux
                this.props.adminLoginSuccess(userInfo );
                
                // Chuyển hướng đến trang hệ thống
                // this.redirectToSystemPage();
            }
        } catch (error) {
            console.error('Login failed:', error.response);
            if (error.response && error.response.data) {
                this.setState({
                    errorMessage: error.response.data.error || 'Đăng nhập thất bại!'
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
            if (!this.btnLogin.current || this.btnLogin.current.disabled) return;
            this.btnLogin.current.click();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        // Fix Warning: Can't perform a React state update on an unmounted component
        this.setState = () => {
            return;
        };
    }

    render() {
        const { username, password, errorMessage, showPassword } = this.state;
        const { lang } = this.props;

        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="text-login-container">
                            <div className="text-login">
                                <FormattedMessage id="login.login" defaultMessage="ĐĂNG NHẬP" />
                            </div>
                        </div>
                        <div className="col-12 form-group login-input">
                            <label><FormattedMessage id="login.username" defaultMessage="Tên đăng nhập:" /></label>
                            <div className="custom-input-password">
                                <img className="icon" src={userIcon} alt="User Icon" />
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={LanguageUtils.getMessageByKey("login.username", lang)}
                                    value={username} 
                                    onChange={this.handleOnChangeUsername} 
                                />
                            </div>
                        </div>
                        <div className="col-12 form-group login-input">
                            <label><FormattedMessage id="login.password" defaultMessage="Mật khẩu:" /></label>
                            <div className="custom-input-password">
                                <img className="icon" src={passIcon} alt="Password Icon" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control" 
                                    placeholder={LanguageUtils.getMessageByKey("login.password", lang)}
                                    value={password} 
                                    onChange={this.handleOnChangePassword} 
                                />
                                <i 
                                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} 
                                    onClick={this.togglePasswordVisibility}
                                ></i>
                            </div>
                        </div>
                        {errorMessage && (
                            <div className='col-12' style={{color:'red'}}>
                                {errorMessage}
                            </div>
                        )}
                        <div className="col-12">
                            <button 
                                ref={this.btnLogin}
                                className="btn-login" 
                                onClick={this.handleLogin}
                            >
                                <FormattedMessage id="login.login" defaultMessage="Đăng nhập" />
                            </button>
                        </div>
                        <div className="col-12">
                            <span className="forgot-password">
                                <FormattedMessage id="login.forgot" defaultMessage="Quên mật khẩu?" />
                            </span>
                        </div>
                        <div className="col-12 text-center mt-3">
                            <span className="register-link">
                                <FormattedMessage id="login.no-account" defaultMessage="Chưa có tài khoản?" /> 
                                <Link to="/register" className="register-link">
                                         Đăng ký ngay
                                </Link>
                            </span>
                        </div>
                        <div className="col-12 text-center mt-3">
                            <span className="text-other-login">
                                <FormattedMessage id="login.other" defaultMessage="Hoặc đăng nhập với:" />
                            </span>
                        </div>
                        <div className="col-12 social-login">
                            <i className="fab fa-facebook-f"></i>
                            <i className="fab fa-google"></i>
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
        navigate: (path) => dispatch(push(path)),
        adminLoginSuccess: (userInfo ) => dispatch(actions.adminLoginSuccess(userInfo )),
        // adminLoginFail: () => dispatch(actions.adminLoginFail()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
