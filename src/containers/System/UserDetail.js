import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import './UserDetail.scss';
import { getUserById, updateUserDetail } from '../../services/userService';
import CommonUtils from '../../utils/CommonUtils';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

class UserDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            username: '',
            firstname: '',
            lastname: '',
            email: '',
            phone_number: '',
            address_infor: '',
            password: '',
            newPassword: '',
            confirmPassword: '',
            previewImgURL: '',
            avatar: '',
            isEditing: false,
            isChangingPassword: false,
            isSubmitting: false,
            errorMessage: '',
            successMessage: '',
            loading: true,
            isOpen: false
        }
    }

    componentDidMount() {
        
        const userId = this.props.userInfo?.userId;
        console.log(userId)
        if (userId) {
            this.setState({ userId });
            this.fetchUserData(userId);
        } else {
            this.setState({ loading: false, errorMessage: 'Không tìm thấy thông tin người dùng' });
        }
    }

    // Hàm lấy thông tin người dùng
    fetchUserData = async (userId) => {
        try {
            const response = await getUserById(userId);
            if (response && response.data) {
                const userData = response.data;
                const userInfo = userData.UserInfo || {};
                const UserAddress = userData.UserAddresses[0] || {};
               
                // Cập nhật state với thông tin người dùng
                this.setState({
                    username: userData.username || '',
                    firstname: userInfo.firstname || '',
                    lastname: userInfo.lastname || '',
                    email: userInfo.email || '',
                    phone_number: userInfo.phone_number || '',
                    address_infor: UserAddress.address_infor || '',
                    loading: false
                });

                // Xử lý ảnh đại diện nếu có
                if (userInfo.img && userInfo.img.data.length > 0) {
                    try {
                        // Chuyển đổi buffer thành binary
                        const imageUrl = new Buffer(userInfo.img, 'base64').toString('binary');
                        this.setState({ previewImgURL: imageUrl });
                    } catch (error) {
                        console.error('Lỗi khi chuyển đổi ảnh:', error);
                    }
                }
            } else {
                this.setState({ loading: false, errorMessage: 'Không tìm thấy thông tin người dùng' });
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            this.setState({
                loading: false,
                errorMessage: error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng'
            });
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
            
            if (file.size > 5 * 1024 * 1024) {
                this.setState({
                    errorMessage: 'Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.'
                });
                return;
            }

          
            if (!file.type.match('image.*')) {
                this.setState({
                    errorMessage: 'Vui lòng chọn file ảnh.'
                });
                return;
            }

            
            let objectUrl = URL.createObjectURL(file);
            this.setState({
                previewImgURL: objectUrl,
                errorMessage: ''
            });

            let base64String = await CommonUtils.fileToBase64(file);
            this.setState({ avatar: base64String });
        }
    }

    toggleEditMode = () => {
        this.setState({
            isEditing: !this.state.isEditing,
            isChangingPassword: false,
            errorMessage: '',
            successMessage: ''
        });
    }

    togglePasswordChange = () => {
        this.setState({
            isChangingPassword: !this.state.isChangingPassword,
            password: '',
            newPassword: '',
            confirmPassword: '',
            errorMessage: '',
            successMessage: ''
        });
    }

    openLightbox = () => {
        this.setState({ isOpen: true });
    };

    closeLightbox = () => {
        this.setState({ isOpen: false });
    };

    handleSaveChanges = async () => {
        const { userId, firstname, lastname, phone_number, address_infor, avatar } = this.state;

        if (!userId) {
            this.setState({
                errorMessage: 'Không tìm thấy thông tin người dùng',
                successMessage: ''
            });
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            // Cập nhật thông tin người dùng
            const userData = {
                firstname,
                lastname,
                phone_number,
                address_infor,
                img:avatar
            };

            const response = await updateUserDetail(userId, userData);

            if (response && response.data && response.data.success) {
                // Nếu có ảnh mới, cập nhật ảnh
                if (avatar) {
                    try {

                    } catch (imageError) {
                        console.error('Lỗi khi cập nhật ảnh:', imageError);
                    }
                }

                // Hiển thị thông báo thành công với Toast
                toast.success('Cập nhật thông tin thành công', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                this.setState({
                    isEditing: false,
                    isSubmitting: false,
                    successMessage: 'Cập nhật thông tin thành công',
                    errorMessage: ''
                });

                // Lấy lại thông tin người dùng để hiển thị cập nhật
                this.fetchUserData(userId);
            } else {
                // Hiển thị thông báo lỗi với Toast
                toast.error(response.data?.message || 'Cập nhật thông tin thất bại', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                this.setState({
                    isSubmitting: false,
                    errorMessage: response.data?.message || 'Cập nhật thông tin thất bại',
                    successMessage: ''
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            // Hiển thị thông báo lỗi với Toast
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            this.setState({
                isSubmitting: false,
                errorMessage: error.response?.data?.message || 'Lỗi khi cập nhật thông tin',
                successMessage: ''
            });
        }
    }

    handleChangePassword = async () => {
        const { userId, password, newPassword, confirmPassword } = this.state;

        // Kiểm tra các trường dữ liệu
        if (!password) {
            this.setState({ errorMessage: 'Vui lòng nhập mật khẩu hiện tại' });
            return;
        }

        if (!newPassword) {
            this.setState({ errorMessage: 'Vui lòng nhập mật khẩu mới' });
            return;
        }

        if (newPassword !== confirmPassword) {
            this.setState({ errorMessage: 'Mật khẩu mới không khớp' });
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            // Gọi API để đổi mật khẩu
            const response = await updateUserDetail(userId, {
                currentPassword: password,
                newPassword: newPassword
            });

            if (response && response.data && response.data.success) {
                // Hiển thị thông báo thành công với Toast
                toast.success('Đổi mật khẩu thành công', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                this.setState({
                    isChangingPassword: false,
                    isSubmitting: false,
                    password: '',
                    newPassword: '',
                    confirmPassword: '',
                    successMessage: 'Đổi mật khẩu thành công',
                    errorMessage: ''
                });
            } else {
                // Hiển thị thông báo lỗi với Toast
                toast.error(response.data?.message || 'Đổi mật khẩu thất bại', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                this.setState({
                    isSubmitting: false,
                    errorMessage: response.data?.message || 'Đổi mật khẩu thất bại',
                    successMessage: ''
                });
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            // Hiển thị thông báo lỗi với Toast
            toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            this.setState({
                isSubmitting: false,
                errorMessage: error.response?.data?.message || 'Lỗi khi đổi mật khẩu',
                successMessage: ''
            });
        }
    }

    render() {
        const {
            username, firstname, lastname, email, phone_number, address_infor,
            password, newPassword, confirmPassword,
            previewImgURL, isEditing, isChangingPassword, isSubmitting,
            errorMessage, successMessage, loading, isOpen
        } = this.state;

        return (
            <div className="user-detail-container">
                {isOpen && (
                    <Lightbox
                        mainSrc={previewImgURL || 'https://avatar.iran.liara.run/public'}
                        onCloseRequest={this.closeLightbox}
                    />
                )}
                <div className="title">Thông tin cá nhân</div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải thông tin...</p>
                    </div>
                ) : (
                    <div className="user-detail-content">
                        <div className="user-avatar-section">
                            <div
                                className="user-avatar"
                                style={{ backgroundImage: `url(${previewImgURL || 'https://avatar.iran.liara.run/public'})` }}
                                onClick={this.openLightbox}
                            ></div>

                            {isEditing && (
                                <div className="avatar-upload">
                                    <input
                                        id="previewImg"
                                        type="file"
                                        hidden
                                        onChange={(event) => this.handleOnChangeImage(event)}
                                    />
                                    <label className="upload-button" htmlFor="previewImg">
                                        <i className="fas fa-camera"></i> Thay đổi ảnh
                                    </label>
                                </div>
                            )}

                            <h3 className="user-name">{username}</h3>
                            <p className="user-role">{this.props.userInfo?.role || 'User'}</p>
                        </div>

                        <div className="user-info-section">
                            {errorMessage && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i> {errorMessage}
                                </div>
                            )}

                            {successMessage && (
                                <div className="success-message">
                                    <i className="fas fa-check-circle"></i> {successMessage}
                                </div>
                            )}

                            <div className="form-actions">
                                {isEditing ? (
                                    <>
                                        <button
                                            className="btn-cancel"
                                            onClick={this.toggleEditMode}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-times"></i> Hủy
                                        </button>
                                        <button
                                            className="btn-save"
                                            onClick={this.handleSaveChanges}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save"></i> Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-edit" onClick={this.toggleEditMode}>
                                            <i className="fas fa-pencil-alt"></i> Chỉnh sửa thông tin
                                        </button>
                                        <button className="btn-change-password" onClick={this.togglePasswordChange}>
                                            <i className="fas fa-key"></i> Đổi mật khẩu
                                        </button>
                                    </>
                                )}
                            </div>

                            {isChangingPassword ? (
                                <div className="password-change-form">
                                    <h3>Đổi mật khẩu</h3>

                                    <div className="form-group">
                                        <label>Mật khẩu hiện tại:</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(event) => this.handleOnChangeInput(event, 'password')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Mật khẩu mới:</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(event) => this.handleOnChangeInput(event, 'newPassword')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Xác nhận mật khẩu mới:</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) => this.handleOnChangeInput(event, 'confirmPassword')}
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="btn-cancel"
                                            onClick={this.togglePasswordChange}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-times"></i> Hủy
                                        </button>
                                        <button
                                            className="btn-save"
                                            onClick={this.handleChangePassword}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save"></i> Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="info-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Tên đăng nhập:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={username}
                                                    disabled={true} // Không cho phép thay đổi username
                                                />
                                            ) : (
                                                <p>{username}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Email:</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={email}
                                                    disabled={true} // Không cho phép thay đổi email
                                                />
                                            ) : (
                                                <p>{email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Họ:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={lastname}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'lastname')}
                                                />
                                            ) : (
                                                <p>{lastname}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Tên:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={firstname}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'firstname')}
                                                />
                                            ) : (
                                                <p>{firstname}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Số điện thoại:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={phone_number}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'phone_number')}
                                                />
                                            ) : (
                                                <p>{phone_number}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Địa chỉ:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={address_infor}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'address_infor')}
                                                />
                                            ) : (
                                                <p>{address_infor}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        userInfo: state.admin.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // Add dispatch actions if needed
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
