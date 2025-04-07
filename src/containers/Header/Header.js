
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
        let menu = [];
        let userInfo = this.props.userInfo;
        if(userInfo && !_.isEmpty(userInfo)){
           let role = userInfo.role;
           if(role === 'admin'){
               menu = adminMenu;
           }else if(role === 'seller'){
                menu = sellerMenu;
           }else if(role === 'buyer'){
               menu = buyerMenu;
           }
        }
        this.setState({
            menuApp: menu
        });
        console.log('check menuApp: ', menu);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render() {
        const { processLogout, userInfo, location } = this.props; // Get userInfo and location from props
        const { isDropdownOpen } = this.state;

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
                        <img
                            className="user-avatar"
                            src={userInfo?.image || defaultAvatar}
                            alt="User Avatar"
                        />
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
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
        adminLoginSuccess: (userInfo) => dispatch(adminLoginSuccess(userInfo)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
