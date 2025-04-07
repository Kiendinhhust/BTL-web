import React, { Component } from 'react';
import { connect } from 'react-redux';
import './RegisterSeller.scss';
import CommonUtils from '../../utils/CommonUtils';

class RegisterSeller extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shopName: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            businessLicense: '',
            avatar: '',
            previewImgURL: '',
            errorMessage: '',
            isSubmitting: false
        };
    }

    handleOnChangeInput = (event, id) => {
        let copyState = { ...this.state };
        copyState[id] = event.target.value;
        this.setState({
            ...copyState
        });
    }

    handleOnChangeImage = async (event) => {
        let file = event.target.files[0];
        
        if (file) {
            // Kiểm tra kích thước file (giới hạn 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.setState({
                    errorMessage: 'Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.'
                });
                return;
            }
            
            // Kiểm tra loại file
            if (!file.type.match('image.*')) {
                this.setState({
                    errorMessage: 'Vui lòng chọn file ảnh.'
                });
                return;
            }
            
            // Tạo URL xem trước
            let objectUrl = URL.createObjectURL(file);
            this.setState({
                previewImgURL: objectUrl,
                errorMessage: ''
            });

            // Chuyển đổi file thành base64
            let base64 = await CommonUtils.fileToBase64(file);
            this.setState({
                avatar: base64
            });
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        
        const { shopName, description, address, phone, email, businessLicense, avatar } = this.state;
        
        // Kiểm tra dữ liệu
        if (!shopName) {
            this.setState({ errorMessage: 'Vui lòng nhập tên cửa hàng' });
            return;
        }
        
        if (!description) {
            this.setState({ errorMessage: 'Vui lòng nhập mô tả cửa hàng' });
            return;
        }
        
        if (!address) {
            this.setState({ errorMessage: 'Vui lòng nhập địa chỉ cửa hàng' });
            return;
        }
        
        if (!phone) {
            this.setState({ errorMessage: 'Vui lòng nhập số điện thoại' });
            return;
        }
        
        if (!email) {
            this.setState({ errorMessage: 'Vui lòng nhập email' });
            return;
        }
        
        if (!businessLicense) {
            this.setState({ errorMessage: 'Vui lòng nhập mã giấy phép kinh doanh' });
            return;
        }
        
        // Gửi dữ liệu đăng ký
        this.setState({ isSubmitting: true, errorMessage: '' });
        
        // Giả lập gửi API
        setTimeout(() => {
            // Giả lập thành công
            alert('Đăng ký thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.');
            this.setState({
                shopName: '',
                description: '',
                address: '',
                phone: '',
                email: '',
                businessLicense: '',
                avatar: '',
                previewImgURL: '',
                errorMessage: '',
                isSubmitting: false
            });
        }, 2000);
    }

    render() {
        const { shopName, description, address, phone, email, businessLicense, previewImgURL, errorMessage, isSubmitting } = this.state;

        return (
            <div className="register-seller-container">
                <div className="register-seller-content">
                    <h1 className="title">Đăng ký trở thành người bán</h1>
                    
                    <div className="register-form">
                        <form onSubmit={this.handleSubmit}>
                            <div className="form-row">
                                <div className="form-group col-6">
                                    <label>Tên cửa hàng:</label>
                                    <input 
                                        type="text" 
                                        value={shopName}
                                        onChange={(event) => this.handleOnChangeInput(event, 'shopName')}
                                        placeholder="Nhập tên cửa hàng"
                                    />
                                </div>
                                
                                <div className="form-group col-6">
                                    <label>Email:</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(event) => this.handleOnChangeInput(event, 'email')}
                                        placeholder="Nhập email"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group col-6">
                                    <label>Số điện thoại:</label>
                                    <input 
                                        type="text" 
                                        value={phone}
                                        onChange={(event) => this.handleOnChangeInput(event, 'phone')}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                
                                <div className="form-group col-6">
                                    <label>Mã giấy phép kinh doanh:</label>
                                    <input 
                                        type="text" 
                                        value={businessLicense}
                                        onChange={(event) => this.handleOnChangeInput(event, 'businessLicense')}
                                        placeholder="Nhập mã giấy phép kinh doanh"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Địa chỉ cửa hàng:</label>
                                <input 
                                    type="text" 
                                    value={address}
                                    onChange={(event) => this.handleOnChangeInput(event, 'address')}
                                    placeholder="Nhập địa chỉ cửa hàng"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Mô tả cửa hàng:</label>
                                <textarea 
                                    value={description}
                                    onChange={(event) => this.handleOnChangeInput(event, 'description')}
                                    placeholder="Nhập mô tả về cửa hàng của bạn"
                                    rows="4"
                                ></textarea>
                            </div>
                            
                            <div className="form-group">
                                <label>Logo cửa hàng:</label>
                                <div className="upload-image">
                                    <input 
                                        id="previewImg" 
                                        type="file" 
                                        hidden 
                                        onChange={(event) => this.handleOnChangeImage(event)}
                                    />
                                    <label className="upload-button" htmlFor="previewImg">
                                        <i className="fas fa-upload"></i> Chọn ảnh
                                    </label>
                                    
                                    <div className="preview-image">
                                        {previewImgURL ? (
                                            <div 
                                                className="preview" 
                                                style={{ backgroundImage: `url(${previewImgURL})` }}
                                            ></div>
                                        ) : (
                                            <div className="no-preview">
                                                <i className="fas fa-image"></i>
                                                <span>Chưa có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {errorMessage && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i> {errorMessage}
                                </div>
                            )}
                            
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i> Đăng ký
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.admin.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterSeller);