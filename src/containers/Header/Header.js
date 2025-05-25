import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import _ from "lodash";

import * as actions from "../../store/actions";
import { adminLoginSuccess } from "../../store/actions/adminActions";
import Navigator from "../../components/Navigator";
import { adminMenu, sellerMenu, buyerMenu } from "./menuApp";
import "./Header.scss";
import defaultAvatar from "../../assets/images/user.svg";
import { fetchUserDetail } from "../../store/actions/userDetailAction";
import "./Header.scss";
import cartImage from "../../assets/images/icons/cart.png";
import homeImage from "../../assets/images/icons/home.png";
import searchImage from "../../assets/images/icons/search.png";
import { getUserById } from "../../services/userService";
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      menuApp: [],
      userAvatar: null,
      loading: false,
      searching: "",
    };
    this.wrapperRef = React.createRef();
  }

  handleDropdownToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState((prevState) => ({
      isDropdownOpen: !prevState.isDropdownOpen,
    }));
  };

  handleSearchChange = (e) => {
    this.props.searchAction({
      search: e.target.value,
    });
  };
  handleDropdownToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState((prevState) => ({
      isDropdownOpen: !prevState.isDropdownOpen,
    }));
  };

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.setState({ isDropdownOpen: false });
    }
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
    let userInfo = this.props.userInfo;

    if (userInfo && !_.isEmpty(userInfo)) {
      this.props.fetchUserDetail(userInfo.userId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userDetail !== this.props.userDetail) {
      if (this.props.userDetail && this.props.userDetail.userInfo) {
        let userRole = this.props.userDetail.userInfo.role;
        let menu = [];

        if (userRole === "admin") {
          menu = adminMenu;
        } else if (userRole === "seller") {
          menu = sellerMenu;
        } else if (userRole === "buyer") {
          menu = buyerMenu;
        }

        this.setState({ menuApp: menu });
      }
    }
  }

  // Giữ nguyên componentWillUnmount
  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  // Hàm lấy thông tin người dùng và ảnh đại diện
  fetchUserData = async (userId) => {
    if (!userId) return;

    this.setState({ loading: true });

    try {
      // Lấy thông tin người dùng
      const userResponse = await getUserById(userId);

      if (userResponse && userResponse.data) {
        const userData = userResponse.data;

        // Kiểm tra xem có ảnh không
        if (userData.UserInfo && userData.UserInfo.img) {
          try {
            console.log("userData.UserInfo.img", userData.UserInfo.img);
            // Chuyển đổi buffer thành binary
            const imageUrl = new Buffer(
              userData.UserInfo.img,
              "base64"
            ).toString("binary");
            this.setState({ userAvatar: imageUrl });
          } catch (error) {
            console.error("Lỗi khi chuyển đổi ảnh:", error);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { processLogout, userInfo, location, userDetail } = this.props; // Get userInfo and location from props
    const { isDropdownOpen } = this.state;
    let imageBase64 = "";
    if (
      userDetail &&
      userDetail.userInfo &&
      userDetail.userInfo.UserInfo &&
      userDetail.userInfo.UserInfo.img
    ) {
      imageBase64 = new Buffer(
        userDetail.userInfo.UserInfo.img,
        "base64"
      ).toString("binary");
    }

    return (
      <div className="header-container">
        <div className="header-tabs-container">
          <Navigator
            menus={this.state.menuApp}
            currentPath={location.pathname}
          />
        </div>
        {/* <Link to="/home">
          <img className="header-home" src={homeImage} alt="Header Cart"></img>
        </Link> */}
        <div>
          <Link to="/cart">
            <div className="header2-cart-container">
              <img
                className="header2-cart"
                src={cartImage}
                alt="Header Cart"
              ></img>
              <div className="header2-nav-cart-count">
                {this.props.cartQuantity}
              </div>
            </div>
          </Link>
        </div>

        <div className="header-search-container">
          <input
            value={this.props.search || ""}
            className="searchBar"
            type="text"
            placeholder="Tìm kiếm..."
            name="search"
            id="search"
            onChange={this.handleSearchChange}
          />
          <img className="header-searchImage" src={searchImage} alt="Search" />
        </div>
        <Link to="/myorders" className="header-myorders">
          My Orders
        </Link>
        <div className="header-right-content">
          <div
            className={`user-info ${isDropdownOpen ? "active" : ""}`}
            onClick={this.handleDropdownToggle}
            ref={this.wrapperRef}
          >
            <span className="user-name">{userInfo?.username || "User"}</span>
            <div
              className="user-avatar"
              style={{
                backgroundImage: `url(${imageBase64 || defaultAvatar})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/system/user-detail" className="dropdown-item">
                  Chi tiết thông tin
                </Link>
                <Link to="/system/user-address" className="dropdown-item">
                  Chi tiết địa chỉ
                </Link>
              </div>
            )}
          </div>

          {/* nút logout */}
          <div
            className="btn btn-logout"
            title="Đăng xuất"
            onClick={processLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.admin.isLoggedIn,
    userInfo: state.admin.userInfo,
    cartQuantity: state.navbarCart.quantity,
    search: state.navbarCart.search,
    userDetail: state.userDetail,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: () => dispatch(actions.processLogout()),
    adminLoginSuccess: (userInfo) => dispatch(adminLoginSuccess(userInfo)),
    searchAction: (payload) => dispatch(actions.searchAction(payload)),
    fetchUserDetail: (userId) => dispatch(fetchUserDetail(userId)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
