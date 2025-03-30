import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import './VerifyOTP.scss';
import { FormattedMessage } from 'react-intl';
import { verifyOtpApi, handleRegisterApi } from '../services/userService';

class VerifyOTP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otp: '',
            email: '',
            errorMessage: '',
            successMessage: ''
        }
    }

    componentDidMount() {
        // Lấy email từ query parameters
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');
        if (email) {
            this.setState({ email });
        } else {
            this.props.navigate('/register');
        }
    }

    handleOnChangeOTP = (e) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số
        if (/^\d*$/.test(value) && value.length <= 6) {
            this.setState({ otp: value });
        }
    }

    handleVerifyOTP = async () => {
        this.setState({ 
            errorMessage: '',
            successMessage: '' 
        });

        if (!this.state.otp || this.state.otp.length !== 6) {
            this.setState({ errorMessage: 'Vui lòng nhập đủ 6 chữ số OTP' });
            return;
        }
        console.log('Sending OTP:', this.state.otp);
        try {
            let response = await verifyOtpApi(this.state.otp, this.state.email);
            console.log('Response:', response);
    
          
            console.log('Response data:', response.data);
            if (response && response.data && response.data.token) {
                this.setState({
                    successMessage: 'Đăng ký thành công! Đang chuyển hướng...'
                });
                
                // Lưu token nếu cần
                localStorage.setItem('token', response.token);
                
                // Chuyển hướng đến trang đăng nhập sau 2 giây
                
                    this.props.navigate('/login');
               
            }
        } catch (error) {
            if (error.response && error.response.data) {
                this.setState({
                    errorMessage: error.response.data.error || 'Xác thực OTP thất bại!'
                });
            } else {
                this.setState({
                    errorMessage: 'Lỗi kết nối, vui lòng thử lại sau!'
                });
            }
        }
    }

    handleResendOTP = async () => {
        this.setState({ 
            errorMessage: '',
            successMessage: '' 
        });
        
        try {
            await handleRegisterApi(null, this.state.email, null, true); // Gửi lại OTP
            this.setState({
                successMessage: 'Mã OTP đã được gửi lại!'
            });
        } catch (error) {
            this.setState({
                errorMessage: 'Không thể gửi lại OTP, vui lòng thử lại sau!'
            });
        }
    }

    render() {
        const { otp, email, errorMessage, successMessage } = this.state;

        return (
            <div className="verify-otp-background">
                <div className="verify-otp-container">
                    <div className="verify-otp-content row">
                        <div className="text-verify-otp-container">
                            <div className="text-verify-otp">
                                <FormattedMessage id="verify-otp.title" defaultMessage="XÁC THỰC OTP" />
                            </div>
                        </div>
                        <div className="col-12 text-center mb-4">
                            <p className="verify-otp-instruction">
                                <FormattedMessage 
                                    id="verify-otp.instruction" 
                                    defaultMessage="Chúng tôi đã gửi mã xác thực đến email:" 
                                /> 
                                <strong> {email}</strong>
                            </p>
                            <p className="verify-otp-instruction">
                                <FormattedMessage 
                                    id="verify-otp.check" 
                                    defaultMessage="Vui lòng kiểm tra hòm thư của bạn và nhập mã OTP để hoàn tất đăng ký" 
                                />
                            </p>
                        </div>
                        <div className="col-12 form-group verify-otp-input">
                            <label>
                                <FormattedMessage id="verify-otp.code" defaultMessage="Mã OTP:" />
                            </label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nhập mã OTP 6 chữ số" 
                                value={otp} 
                                onChange={this.handleOnChangeOTP} 
                            />
                        </div>
                        {errorMessage && (
                            <div className='col-12' style={{color:'red'}}>
                                {errorMessage}
                            </div>
                        )}
                        {successMessage && (
                            <div className='col-12' style={{color:'green'}}>
                                {successMessage}
                            </div>
                        )}
                        <div className="col-12">
                            <button 
                                className="btn-verify-otp" 
                                onClick={this.handleVerifyOTP}
                            >
                                <FormattedMessage id="verify-otp.verify" defaultMessage="Xác nhận" />
                            </button>
                        </div>
                        <div className="col-12 text-center mt-3">
                            <span className="resend-otp-link" onClick={this.handleResendOTP}>
                                <FormattedMessage id="verify-otp.not-received" defaultMessage="Không nhận được mã?" /> 
                                <a href="#">
                                    <FormattedMessage id="verify-otp.resend" defaultMessage="Gửi lại OTP" />
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

export default connect(mapStateToProps, mapDispatchToProps)(VerifyOTP);
