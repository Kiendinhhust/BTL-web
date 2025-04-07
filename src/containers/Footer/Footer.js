import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './Footer.scss';

class Footer extends Component {
    render() {
        return (
            <footer className="footer-container">
                <div className="footer-content">
                    <div className="footer-section about">
                        <h2 className="logo-text">Google Clone</h2>
                        <p>
                            Nền tảng mua sắm trực tuyến hàng đầu Việt Nam, cung cấp đa dạng sản phẩm 
                            với chất lượng đảm bảo và dịch vụ khách hàng tuyệt vời.
                        </p>
                        <div className="contact">
                            <span><i className="fas fa-phone"></i> &nbsp; 123-456-789</span>
                            <span><i className="fas fa-envelope"></i> &nbsp; info@googleclone.com</span>
                        </div>
                        <div className="socials">
                            <a href="#"><i className="fab fa-facebook"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>

                    <div className="footer-section links">
                        <h2>Liên kết nhanh</h2>
                        <ul>
                            <li><Link to="/home">Trang chủ</Link></li>
                            <li><Link to="/about">Giới thiệu</Link></li>
                            <li><Link to="/services">Dịch vụ</Link></li>
                            <li><Link to="/contact">Liên hệ</Link></li>
                            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
                            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section contact-form">
                        <h2>Liên hệ với chúng tôi</h2>
                        <form action="#" method="post">
                            <input type="email" name="email" className="text-input contact-input" placeholder="Email của bạn..." />
                            <textarea name="message" className="text-input contact-input" placeholder="Tin nhắn của bạn..."></textarea>
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-paper-plane"></i> Gửi
                            </button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} Google Clone | Thiết kế bởi BTL-Web
                </div>
            </footer>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);