import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ShopManage.scss';
import { getShopById } from '../../services/shopService';
import CommonUtils from '../../utils/CommonUtils';
import { toast } from 'react-toastify';

class ShopManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shopInfo: null,
            products: [],
            loading: true
        };
    }

    async componentDidMount() {
        try {
            // Lấy thông tin shop từ API
            if (this.props.userInfo && this.props.userInfo.userId) {
                const res = await getShopById(this.props.userInfo.ShopId);

                if (res && res.data && res.data.success) {
                    const shopData = res.data.data;

                    // Cập nhật state với thông tin shop
                    this.setState({
                        shopInfo: {
                            id: shopData.shop_id,
                            name: shopData.shop_name,
                            description: shopData.description || 'Chưa có mô tả',
                            address: shopData.address || 'Chưa có địa chỉ',
                            phone: shopData.phone || 'Chưa có số điện thoại',
                            email: this.props.userInfo.email || 'Chưa có email',
                            rating: shopData.rating || 0,
                            totalSales: shopData.total_orders || 0,
                            totalRevenue: shopData.total_revenue || 0,
                            status: shopData.status,
                            rejectionReason: shopData.rejection_reason,
                            image: shopData.img ? CommonUtils.getBase64Image(shopData.img) : null
                        },
                        // Tạm thời sử dụng dữ liệu mẫu cho sản phẩm
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
                } else {
                    toast.error('Không thể lấy thông tin shop');
                    this.setState({ loading: false });
                }
            } else {
                toast.error('Bạn cần đăng nhập để xem thông tin shop');
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error('Error fetching shop data:', error);
            toast.error('Lỗi khi lấy thông tin shop');
            this.setState({ loading: false });
        }
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
                        <div className="shop-header-left">
                            {shopInfo.image ? (
                                <div className="shop-image">
                                    <img src={shopInfo.image} alt={shopInfo.name} />
                                </div>
                            ) : (
                                <div className="shop-image no-image">
                                    <i className="fas fa-store"></i>
                                </div>
                            )}
                            <h2>{shopInfo.name}</h2>
                        </div>
                        <div className="shop-rating">
                            <i className="fas fa-star"></i> {shopInfo.rating}
                        </div>
                    </div>

                    {/* Hiển thị trạng thái shop */}
                    {shopInfo.status && (
                        <div className={`shop-status status-${shopInfo.status}`}>
                            <div className="status-icon">
                                {shopInfo.status === 'pending' && <i className="fas fa-clock"></i>}
                                {shopInfo.status === 'accepted' && <i className="fas fa-check-circle"></i>}
                                {shopInfo.status === 'rejected' && <i className="fas fa-times-circle"></i>}
                            </div>
                            <div className="status-text">
                                {shopInfo.status === 'pending' && 'Đang chờ duyệt'}
                                {shopInfo.status === 'accepted' && 'Đã được duyệt'}
                                {shopInfo.status === 'rejected' && 'Đã bị từ chối'}
                            </div>
                            {shopInfo.status === 'rejected' && shopInfo.rejectionReason && (
                                <div className="rejection-reason">
                                    <p><strong>Lý do:</strong> {shopInfo.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    )}

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
                        {shopInfo.totalRevenue !== undefined && (
                            <div className="stat-item">
                                <div className="stat-value">{shopInfo.totalRevenue.toLocaleString('vi-VN')} đ</div>
                                <div className="stat-label">Doanh thu</div>
                            </div>
                        )}
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

export default connect(mapStateToProps)(ShopManage);