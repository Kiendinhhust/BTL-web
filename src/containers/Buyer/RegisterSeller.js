import React, { Component } from 'react';
import { connect } from 'react-redux';
import './RegisterSeller.scss';
import CommonUtils from '../../utils/CommonUtils';
import { createNewShop, fetchAllShopsStart } from '../../store/actions/shopAction';
import { getShopByUserId } from '../../services/shopService';
import { toast } from 'react-toastify';

class RegisterSeller extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shopName: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            avatar: '',
            previewImgURL: '',
            errorMessage: '',
            isSubmitting: false,
            shopId: null,
            shopStatus: null,
            rejectionReason: '',
            isRegistered: false
        };
    }

    async componentDidMount() {
        if (this.props.userInfo && this.props.userInfo.userId) {
            try {
                // Lấy shop mới nhất của người dùng theo userId
                const res = await getShopByUserId(this.props.userInfo.userId);
                if (res && res.data && res.data.success) {
                    const shopData = res.data.data;
                    this.setState({
                        shopId: shopData.shop_id,
                        shopStatus: shopData.status,
                        rejectionReason: shopData.rejection_reason || '',
                        isRegistered: true
                    });
                }
            } catch (error) {
                console.log('Người dùng chưa đăng ký shop hoặc có lỗi xảy ra:', error);
            }
        }
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

        const { shopName, description, address, phone, email, avatar } = this.state;

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

        // Gửi dữ liệu đăng ký
        this.setState({ isSubmitting: true, errorMessage: '' });

        try {
            const shopData = {
                shop_name: shopName,
                description,
                address,
                phone,
                owner_id: this.props.userInfo.userId,
                img: avatar
            };

            // Gọi action để tạo shop
            const res = await this.props.createShop(shopData);

            if (res && res.success) {
                toast.success('Đăng ký thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.', { autoClose: 2000 });
                this.props.fetchAllShops();

                // Lấy thông tin shop mới nhất sau khi tạo
                try {
                    const shopRes = await getShopByUserId(this.props.userInfo.userId);
                    if (shopRes && shopRes.data && shopRes.data.success) {
                        const shopData = shopRes.data.data;
                        // Cập nhật trạng thái
                        this.setState({
                            isRegistered: true,
                            shopId: shopData.shop_id,
                            shopStatus: shopData.status,
                            rejectionReason: shopData.rejection_reason || '',
                            shopName: '',
                            description: '',
                            address: '',
                            phone: '',
                            email: '',
                            avatar: '',
                            previewImgURL: '',
                            errorMessage: '',
                            isSubmitting: false
                        });
                    } else {
                        // Nếu không lấy được thông tin shop, sử dụng thông tin từ response tạo shop
                        this.setState({
                            isRegistered: true,
                            shopId: res.shop.shop_id,
                            shopStatus: 'pending',
                            shopName: '',
                            description: '',
                            address: '',
                            phone: '',
                            email: '',
                            avatar: '',
                            previewImgURL: '',
                            errorMessage: '',
                            isSubmitting: false
                        });
                    }
                } catch (error) {
                    console.error('Error fetching shop data after creation:', error);
                    // Nếu có lỗi, sử dụng thông tin từ response tạo shop
                    this.setState({
                        isRegistered: true,
                        shopId: res.shop.shop_id,
                        shopStatus: 'pending',
                        shopName: '',
                        description: '',
                        address: '',
                        phone: '',
                        email: '',
                        avatar: '',
                        previewImgURL: '',
                        errorMessage: '',
                        isSubmitting: false
                    });
                }
            } else {
                this.setState({
                    errorMessage: res.message || 'Có lỗi xảy ra khi đăng ký shop',
                    isSubmitting: false
                });
            }
        } catch (error) {
            console.error('Error creating shop:', error);
            this.setState({
                errorMessage: 'Lỗi hệ thống, vui lòng thử lại sau',
                isSubmitting: false
            });
        }
    }

    render() {
        const {
            shopName, description, address, phone, email,
            previewImgURL, errorMessage, isSubmitting, isRegistered,
            shopStatus, rejectionReason
        } = this.state;

        // Hiển thị thông báo trạng thái nếu đã đăng ký
        if (isRegistered) {
            return (
                <div className="register-seller-container">
                    <div className="register-seller-content">
                        <h1 className="title">Trạng thái đăng ký shop</h1>

                        <div className="shop-status-container">
                            {shopStatus === 'pending' && (
                                <div className="status-pending">
                                    <i className="fas fa-clock"></i>
                                    <h2>Đang chờ duyệt</h2>
                                    <p>Yêu cầu đăng ký shop của bạn đang được xem xét. Chúng tôi sẽ thông báo cho bạn khi có kết quả.</p>
                                </div>
                            )}

                            {shopStatus === 'rejected' && (
                                <div className="status-rejected">
                                    <i className="fas fa-times-circle"></i>
                                    <h2>Yêu cầu đã bị từ chối</h2>
                                    <p>Rất tiếc, yêu cầu đăng ký shop của bạn đã bị từ chối.</p>
                                    {rejectionReason && (
                                        <div className="rejection-reason">
                                            <h3>Lý do:</h3>
                                            <p>{rejectionReason}</p>
                                        </div>
                                    )}
                                    <button
                                        className="btn-reapply"
                                        onClick={() => this.setState({ isRegistered: false })}
                                    >
                                        Đăng ký lại
                                    </button>
                                </div>
                            )}

                            {shopStatus === 'accepted' && (
                                <div className="status-accepted">
                                    <i className="fas fa-check-circle"></i>
                                    <h2>Đăng ký thành công!</h2>
                                    <p>Chúc mừng! Shop của bạn đã được duyệt. Bạn có thể bắt đầu quản lý shop của mình ngay bây giờ.</p>
                                    <button
                                        className="btn-manage-shop"
                                        onClick={() => this.props.history.push('/seller/shop-manage')}
                                    >
                                        Quản lý shop
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

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
                                    <label>Số Điện Thoại:</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(event) => this.handleOnChangeInput(event, 'phone')}
                                        placeholder="Nhập số điện thoại"
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
        userInfo: state.admin.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        createShop: (data) => dispatch(createNewShop(data)),
        fetchAllShops: () => dispatch(fetchAllShopsStart())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterSeller);
