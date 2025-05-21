import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ProductManage.scss';
import { getProductsByShop, deleteProduct } from '../../services/productService';
import { getShopByUserId } from '../../services/shopService';
import ModalProduct from './ModalProduct';
import { toast } from 'react-toastify';

class ProductManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shopInfo: null,
            products: [],
            isLoading: true,
            isModalOpen: false,
            selectedProduct: null,
            isEdit: false,
            searchTitle: '',
            currentPage: 1,
            totalPages: 0,
            pageSize: 10,
            totalItems: 0
        };
    }

    async componentDidMount() {
        await this.fetchShopInfo();
        if (this.state.shopInfo) {
            await this.fetchProducts();
        }
    }

    fetchShopInfo = async () => {
        try {
            if (!this.props.userInfo || !this.props.userInfo.userId) {
                toast.error('Vui lòng đăng nhập để xem thông tin shop');
                return;
            }

            const res = await getShopByUserId(this.props.userInfo.userId);
            if (res.data && res.data.success) {
                this.setState({
                    shopInfo: res.data.data
                });
            } else {
                toast.error('Bạn chưa có shop. Vui lòng đăng ký shop trước.');
                this.props.history.push('/buyer/register-seller');
            }
        } catch (error) {
            console.error('Error fetching shop info:', error);
            toast.error('Không thể lấy thông tin shop. Vui lòng thử lại sau.');
        }
    }

    fetchProducts = async () => {
        try {
            this.setState({ isLoading: true });
            const { shopInfo, currentPage, pageSize, searchTitle } = this.state;

            if (!shopInfo || !shopInfo.shop_id) {
                this.setState({ isLoading: false });
                return;
            }

            const res = await getProductsByShop(shopInfo.shop_id, currentPage, pageSize, searchTitle);

            if (res.data && res.data.success) {
                this.setState({
                    products: res.data.products || [],
                    totalPages: res.data.totalPages || 0,
                    totalItems: res.data.totalItems || 0
                });
            } else {
                toast.error('Không thể lấy danh sách sản phẩm');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Có lỗi xảy ra khi lấy danh sách sản phẩm');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    handlePageChange = (selectedObject) => {
        this.setState({
            currentPage: selectedObject.selected + 1
        }, () => {
            this.fetchProducts();
        });
    }

    handleSearchChange = (event) => {
        this.setState({
            searchTitle: event.target.value
        });
    }

    handleSearch = () => {
        this.setState({
            currentPage: 1
        }, () => {
            this.fetchProducts();
        });
    }

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    toggleModal = () => {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            selectedProduct: null,
            isEdit: false
        });
    }

    openEditModal = (product) => {
        this.setState({
            isModalOpen: true,
            selectedProduct: product,
            isEdit: true
        });
    }

    handleDeleteProduct = (productId) => {
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');
        if (isConfirmed) {
            this.confirmDelete(productId);
        }
    }

    confirmDelete = async (productId) => {
        try {
            this.setState({ isLoading: true });
            const res = await deleteProduct(productId);

            if (res.data && res.data.success) {
                toast.success('Xóa sản phẩm thành công!');
                this.fetchProducts();
            } else {
                toast.error(res.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    renderProductStatus = (status) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-success">Đang bán</span>;
            case 'inactive':
                return <span className="badge badge-secondary">Ngừng bán</span>;
            case 'draft':
                return <span className="badge badge-warning">Bản nháp</span>;
            default:
                return <span className="badge badge-info">{status}</span>;
        }
    }

    render() {
        const {
            shopInfo, products, isLoading, isModalOpen, selectedProduct, isEdit,
            searchTitle, totalPages, currentPage
        } = this.state;

        return (
            <div className="product-manage-container">
                <div className="content-wrapper">
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Đang tải...</div>
                        </div>
                    )}
                    <div className="product-manage-header">
                        <h2>Quản lý sản phẩm</h2>
                        {shopInfo && (
                            <div className="shop-info">
                                <span>Shop: {shopInfo.shop_name}</span>
                                {shopInfo.status === 'pending' && (
                                    <span className="shop-status pending">Đang chờ duyệt</span>
                                )}
                                {shopInfo.status === 'accepted' && (
                                    <span className="shop-status accepted">Đã duyệt</span>
                                )}
                                {shopInfo.status === 'rejected' && (
                                    <span className="shop-status rejected">Đã từ chối</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="product-manage-actions">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTitle}
                                onChange={this.handleSearchChange}
                                onKeyDown={this.handleKeyDown}
                            />
                            <button onClick={this.handleSearch}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>

                        <button
                            className="btn-add-product"
                            onClick={this.toggleModal}
                            disabled={shopInfo?.status !== 'accepted'}
                        >
                            <i className="fas fa-plus"></i> Thêm sản phẩm
                        </button>
                    </div>

                    {shopInfo?.status !== 'accepted' && (
                        <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            {shopInfo?.status === 'pending'
                                ? 'Shop của bạn đang chờ duyệt. Bạn chỉ có thể thêm sản phẩm sau khi shop được duyệt.'
                                : 'Shop của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.'}
                        </div>
                    )}

                    <div className="product-list">
                        {products.length > 0 ? (
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Hình ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Tồn kho</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.product_id}>
                                            <td>{product.product_id}</td>
                                            <td>
                                                <div className="product-image">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.title} />
                                                    ) : (
                                                        <div className="no-image">
                                                            <i className="fas fa-image"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{product.title}</td>
                                            <td>{this.formatPrice(product.price)}</td>
                                            <td>{product.items && product.items.length > 0 ? product.items[0].stock : 0}</td>
                                            <td>{this.renderProductStatus(product.status)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => this.openEditModal(product)}
                                                        disabled={shopInfo?.status !== 'accepted'}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => this.handleDeleteProduct(product.product_id)}
                                                        disabled={shopInfo?.status !== 'accepted'}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-products">
                                <i className="fas fa-box-open"></i>
                                <p>Chưa có sản phẩm nào</p>
                                {shopInfo?.status === 'accepted' && (
                                    <button onClick={this.toggleModal}>Thêm sản phẩm đầu tiên</button>
                                )}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                <button
                                    className="pagination-button"
                                    onClick={() => this.handlePageChange({ selected: Math.max(0, currentPage - 2) })}
                                    disabled={currentPage === 1}
                                >
                                    Trước
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    // Hiển thị trang hiện tại, trang trước và trang sau
                                    if (
                                        index + 1 === currentPage ||
                                        index + 1 === currentPage - 1 ||
                                        index + 1 === currentPage + 1 ||
                                        index + 1 === 1 ||
                                        index + 1 === totalPages
                                    ) {
                                        return (
                                            <button
                                                key={index}
                                                className={`pagination-button ${index + 1 === currentPage ? 'active' : ''}`}
                                                onClick={() => this.handlePageChange({ selected: index })}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    }

                                    // Hiển thị dấu ... nếu có khoảng cách
                                    if (
                                        (index + 1 === currentPage - 2 && currentPage > 3) ||
                                        (index + 1 === currentPage + 2 && currentPage < totalPages - 2)
                                    ) {
                                        return <span key={index} className="pagination-ellipsis">...</span>;
                                    }

                                    return null;
                                })}

                                <button
                                    className="pagination-button"
                                    onClick={() => this.handlePageChange({ selected: Math.min(totalPages - 1, currentPage) })}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <ModalProduct
                    isOpen={isModalOpen}
                    toggleModal={this.toggleModal}
                    productData={selectedProduct}
                    isEdit={isEdit}
                    shopId={shopInfo?.shop_id}
                    fetchProducts={this.fetchProducts}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.admin.userInfo,
    };
};

export default connect(mapStateToProps)(ProductManage);
