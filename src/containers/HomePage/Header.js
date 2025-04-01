import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./Header.scss"; // Bạn cần tạo file CSS/SCSS tương ứng
import cartImage from "../../assets/images/icons/cart.png";
import homeImage from "../../assets/images/icons/home.png";
import searchImage from "../../assets/images/icons/search.png";
import { searchAction } from "../../store/actions/navbarCartActions";
const Header = (props) => {
  const handleSearchChange = (e) => {
    props.searchAction({
      search: e.target.value,
    });
  };
  return (
    <header className="header">
      <nav className="nav-bar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/home">
              <img
                className="home-header"
                src={homeImage}
                alt="Header Cart"
              ></img>
            </Link>
            <Link to="/cart">
              <img
                className="header-cart"
                src={cartImage}
                alt="Header Cart"
              ></img>
              <div className="nav-cart-count">{props.cartQuantity}</div>
            </Link>
            <img className="searchImage-header" src={searchImage} alt="" />
            <input
              value={props.search}
              onChange={handleSearchChange}
              className="searchBar"
              type="text"
              name=""
              id=""
            />
            <Link to="/login">Login</Link>
          </li>
          {/* Bạn có thể thêm các link khác vào đây nếu cần */}
        </ul>
      </nav>
    </header>
  );
};
const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.admin.isLoggedIn,
    cartQuantity: state.navbarCart.quantity,
    search: state.navbarCart.search,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchAction: (payload) => dispatch(searchAction(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
