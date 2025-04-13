import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ShopManage.scss';

class ShopManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shopInfo: null,
            products: [],
            loading: true
        };
    }

    componentDidMount() {
        // Giả lập việc lấy thông tin cửa hàng từ API
        setTimeout(() => {
            this.setState({
                shopInfo: {
                    id: 1,
                    name: 'Shop ABC',
                    description: 'Cửa hàng bán các sản phẩm chất lượng cao',
                    address: '123 Đường XYZ, Quận 1, TP.HCM',
                    phone: '0123456789',
                    email: 'shop@example.com',
                    rating: 4.5,
                    totalSales: 1200
                },
                products: [
                    {
                        id: 1,
                        name: 'Sản phẩm 1',
                        price: 100000,
                        quantity: 50,
                        sold: 20,
                        image: 'https://via.placeholder.com/150'
                    },
                    {
                        id: 2,
                        name: 'Sản phẩm 2',
                        price: 200000,
                        quantity: 30,
                        sold: 15,
                        image: 'https://via.placeholder.com/150'
                    },
                    {
                        id: 3,
                        name: 'Sản phẩm 3',
                        price: 300000,
                        quantity: 20,
                        sold: 10,
                        image: 'https://via.placeholder.com/150'
                    }
                ],
                loading: false
            });
        }, 1000);
    }

    render() {
        const { shopInfo, products, loading } = this.state;

        if (loading) {
            return (
                <div className="shop-manage-container">
                    <div className="loading">Đang tải thông tin cửa hàng...</div>
                </div>
            );
        }

        return (
            <div className="shop-manage-container">
                <div className="shop-header">
                    <h1>Quản lý cửa hàng</h1>
                    <div className="shop-actions">
                        <button className="btn-edit-shop">
                            <i className="fas fa-edit"></i> Chỉnh sửa thông tin
                        </button>
                        <button className="btn-add-product">
                            <i className="fas fa-plus"></i> Thêm sản phẩm
                        </button>
                    </div>
                </div>

                <div className="shop-info-card">
                    <div className="shop-info-header">
                        <h2>{shopInfo.name}</h2>
                        <div className="shop-rating">
                            <i className="fas fa-star"></i> {shopInfo.rating}
                        </div>
                    </div>
                    <div className="shop-info-content">
                        <div className="info-item">
                            <i className="fas fa-info-circle"></i>
                            <span>{shopInfo.description}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{shopInfo.address}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-phone"></i>
                            <span>{shopInfo.phone}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-envelope"></i>
                            <span>{shopInfo.email}</span>
                        </div>
                    </div>
                    <div className="shop-stats">
                        <div className="stat-item">
                            <div className="stat-value">{shopInfo.totalSales}</div>
                            <div className="stat-label">Tổng đơn hàng</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{products.length}</div>
                            <div className="stat-label">Sản phẩm</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{products.reduce((total, product) => total + product.sold, 0)}</div>
                            <div className="stat-label">Đã bán</div>
                        </div>
                    </div>
                </div>

                <div className="products-section">
                    <h2>Danh sách sản phẩm</h2>
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <div className="product-price">{product.price.toLocaleString('vi-VN')} đ</div>
                                    <div className="product-stats">
                                        <span>Còn lại: {product.quantity}</span>
                                        <span>Đã bán: {product.sold}</span>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button className="btn-edit">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="btn-delete">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
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

export default connect(mapStateToProps, mapDispatchToProps)(ShopManage);