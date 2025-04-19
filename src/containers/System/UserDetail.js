import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import './UserDetail.scss';
import { fetchUserDetail, updateUserDetail } from '../../store/actions/userDetailAction';
import CommonUtils from '../../utils/CommonUtils';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import {
    getUserAddresses,
  } from '../../store/actions/userAddressAction';
class UserDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
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
            isOpen: false
        }
    }

    componentDidMount() {
        const userId = this.props.userInfo?.userId;
        console.log(userId);
        if (userId) {
            // Dispatch action để lấy thông tin user
            this.props.fetchUserDetail(userId);
            this.props.getUserAddresses(userId);
        } else {
            this.setState({ errorMessage: 'Không tìm thấy thông tin người dùng' });
        }
        
    }

    componentDidUpdate(prevProps) {
        // Xử lý khi có lỗi từ Redux store
        if (prevProps.userDetail.error !== this.props.userDetail.error && this.props.userDetail.error) {
            this.setState({ errorMessage: this.props.userDetail.error });
        }
        if (prevProps.userAddress.addresses !== this.props.userAddress.addresses) {
            const { addresses } = this.props.userAddress;
            if (addresses && addresses.length > 0) {
              // Cập nhật state hoặc thực hiện logic cần thiết
              console.log('Danh sách địa chỉ đã được cập nhật:', addresses);
            }
          }

        // Xử lý ảnh đại diện khi dữ liệu user được cập nhật
        if (prevProps.userDetail.userInfo !== this.props.userDetail.userInfo) {
            const userInfo = this.props.userDetail.userInfo;
            if (userInfo && userInfo.UserInfo && userInfo.UserInfo.img && userInfo.UserInfo.img.data && userInfo.UserInfo.img.data.length > 0) {
                try {
                    // Chuyển đổi buffer thành binary
                    const imageUrl = new Buffer(userInfo.UserInfo.img, 'base64').toString('binary');
                    this.setState({ previewImgURL: imageUrl });
                } catch (error) {
                    console.error('Lỗi khi chuyển đổi ảnh:', error);
                }
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
        const { avatar } = this.state;
        const { userInfo, userDetail } = this.props;
        const userId = userInfo?.userId;

        if (!userId) {
            this.setState({
                errorMessage: 'Không tìm thấy thông tin người dùng',
                successMessage: ''
            });
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            // Lấy các giá trị từ form (có thể lấy từ Redux store hoặc DOM)
            const firstname = document.querySelector('input[name="firstname"]').value;
            const lastname = document.querySelector('input[name="lastname"]').value;
            const phone_number = document.querySelector('input[name="phone_number"]').value;
            const address_infor = document.querySelector('input[name="address_infor"]').value;

            // Cập nhật thông tin người dùng qua Redux
            const userData = {
                firstname,
                lastname,
                phone_number,
                address_infor,
                img: avatar
            };

            const result = await this.props.updateUserDetail(userId, userData);

            if (result && result.success) {
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

                // Tải lại thông tin người dùng
                this.props.fetchUserDetail(userId);
            } else {
                // Hiển thị thông báo lỗi với Toast
                toast.error(result.message || 'Cập nhật thông tin thất bại', {
                    position: "top-right",
                    autoClose: 3000,
                });

                this.setState({
                    isSubmitting: false,
                    errorMessage: result.message || 'Cập nhật thông tin thất bại',
                    successMessage: ''
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            // Hiển thị thông báo lỗi với Toast
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin', {
                position: "top-right",
                autoClose: 3000,
            });

            this.setState({
                isSubmitting: false,
                errorMessage: error.response?.data?.message || 'Lỗi khi cập nhật thông tin',
                successMessage: ''
            });
        }
    }

    handleChangePassword = async () => {
        const { password, newPassword, confirmPassword } = this.state;
        const { userInfo } = this.props;

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
            // Gọi API để đổi mật khẩu qua Redux
            const result = await this.props.updateUserDetail(userInfo.userId, {
                currentPassword: password,
                newPassword: newPassword
            });

            if (result && result.success) {
                // Hiển thị thông báo thành công với Toast
                toast.success('Đổi mật khẩu thành công', {
                    position: "top-right",
                    autoClose: 3000,
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
                toast.error(result.message || 'Đổi mật khẩu thất bại', {
                    position: "top-right",
                    autoClose: 3000,
                });

                this.setState({
                    isSubmitting: false,
                    errorMessage: result.message || 'Đổi mật khẩu thất bại',
                    successMessage: ''
                });
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            // Hiển thị thông báo lỗi với Toast
            toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu', {
                position: "top-right",
                autoClose: 3000,
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
            password, newPassword, confirmPassword,
            previewImgURL, isEditing, isChangingPassword, isSubmitting,
            errorMessage, successMessage, isOpen
        } = this.state;
        
        const { userDetail, userInfo,userAddress } = this.props;
        console.log('userAddressd', userAddress);
        console.log('userDetail', userDetail);
        const userData = userDetail.userInfo || {};
        const userDetailInfo = userData.UserInfo || {};
        const userAddressDetail =  userAddress.addresses &&  userAddress.addresses.length > 0 
            ?  userAddress.addresses[0] 
            : {};
        
        return (
            <div className="user-detail-container">
                {isOpen && (
                    <Lightbox
                        mainSrc={previewImgURL || 'https://avatar.iran.liara.run/public'}
                        onCloseRequest={this.closeLightbox}
                    />
                )}
                <div className="title">Thông tin cá nhân</div>

                {userDetail.isLoading ? (
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

                            <h3 className="user-name">{userData.username}</h3>
                            <p className="user-role">{userInfo?.role || 'User'}</p>
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
                                                    name="username"
                                                    value={userData.username || ''}
                                                    disabled={true} // Không cho phép thay đổi username
                                                />
                                            ) : (
                                                <p>{userData.username || ''}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Email:</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={userDetailInfo.email || ''}
                                                    disabled={true} // Không cho phép thay đổi email
                                                />
                                            ) : (
                                                <p>{userDetailInfo.email || ''}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Họ:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="lastname"
                                                    value={userDetailInfo.lastname || ''}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'lastname')}
                                                />
                                            ) : (
                                                <p>{userDetailInfo.lastname || ''}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Tên:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="firstname"
                                                    value={userDetailInfo.firstname || ''}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'firstname')}
                                                />
                                            ) : (
                                                <p>{userDetailInfo.firstname || ''}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Số điện thoại:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    value={userDetailInfo.phone_number || ''}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'phone_number')}
                                                />
                                            ) : (
                                                <p>{userDetailInfo.phone_number || ''}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Địa chỉ:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="address_infor"
                                                    value={userAddressDetail.address_infor || ''}
                                                    onChange={(event) => this.handleOnChangeInput(event, 'address_infor')}
                                                />
                                            ) : (
                                                <p>{userAddressDetail.address_infor || ''}</p>
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
        userInfo: state.admin.userInfo,
        userDetail: state.userDetail,
        userAddress: state.userAddress
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getUserAddresses: (userId) => dispatch(getUserAddresses(userId)),
        fetchUserDetail: (userId) => dispatch(fetchUserDetail(userId)),
        updateUserDetail: (userId, userData) => dispatch(updateUserDetail(userId, userData))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
