import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import _ from 'lodash';

import * as actions from "../../store/actions";
import { adminLoginSuccess } from "../../store/actions/adminActions";
import Navigator from '../../components/Navigator';
import { adminMenu ,sellerMenu,buyerMenu } from './menuApp';
import './Header.scss';
import defaultAvatar from '../../assets/images/user.svg';
import { fetchUserDetail  } from '../../store/actions/userDetailAction';

class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDropdownOpen: false,
            menuApp: [],
        };
        this.wrapperRef = React.createRef();
    }

    handleDropdownToggle = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState(prevState => ({
            isDropdownOpen: !prevState.isDropdownOpen
        }));
    };

    handleClickOutside = (event) => {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.setState({ isDropdownOpen: false });
        }
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        let userInfo = this.props.userInfo;
        
        if(userInfo && !_.isEmpty(userInfo)){
          this.props.fetchUserDetail(userInfo.userId);
        }
      }
      

      componentDidUpdate(prevProps) {
        if (prevProps.userDetail !== this.props.userDetail) {
          if (this.props.userDetail && this.props.userDetail.userInfo) {
            let userRole = this.props.userDetail.userInfo.role;
            let menu = [];
            
            if (userRole === 'admin') {
              menu = adminMenu;
            } else if (userRole === 'seller') {
              menu = sellerMenu;
            } else if (userRole === 'buyer') {
              menu = buyerMenu;
            }
            
            this.setState({ menuApp: menu });
          }
        }
      }
      
    
      
      // Giữ nguyên componentWillUnmount
      componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
      }

    render() {
        const { processLogout, userInfo, location, userDetail } = this.props; // Get userInfo and location from props
        const { isDropdownOpen } = this.state;
        let imageBase64 = '';
        if(userDetail && userDetail.userInfo && userDetail.userInfo.UserInfo && userDetail.userInfo.UserInfo.img){
            imageBase64 = new Buffer(userDetail.userInfo.UserInfo.img, 'base64').toString('binary');
        }

        return (
            <div className="header-container">
                <div className="header-tabs-container">
                    <Navigator menus={this.state.menuApp} currentPath={location.pathname} />
                </div>

                <div className="header-right-content">
                    <div className={`user-info ${isDropdownOpen ? 'active' : ''}`}
                         onClick={this.handleDropdownToggle}
                         ref={this.wrapperRef}>
                        <span className="user-name">{userInfo?.username || 'User'}</span>
                        <div
                            className="user-avatar"
                            style={{
                                backgroundImage: `url(${imageBase64 || defaultAvatar})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        ></div>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <Link to="/system/user-detail" className="dropdown-item">Chi tiết thông tin</Link>
                                <Link to="/system/user-address" className="dropdown-item">Chi tiết địa chỉ</Link>
                            </div>
                        )}
                    </div>

                    {/* nút logout */}
                    <div className="btn btn-logout" title="Đăng xuất" onClick={processLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.admin.isLoggedIn,
        userInfo: state.admin.userInfo,
        userDetail: state.userDetail
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
        adminLoginSuccess: (userInfo) => dispatch(adminLoginSuccess(userInfo)),
        fetchUserDetail : (userId) => dispatch(fetchUserDetail (userId))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
