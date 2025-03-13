import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Header.scss'; // Bạn cần tạo file CSS/SCSS tương ứng

const Header = () => {
return (
<header className="header">
<nav className="nav-bar">
<ul className="nav-list">
<li className="nav-item">
<Link to="/login">Login</Link>
</li>
{/* Bạn có thể thêm các link khác vào đây nếu cần */}
</ul>
</nav>
</header>
);
}
const mapStateToProps = state => {
    return {
        isLoggedIn: state.admin.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);