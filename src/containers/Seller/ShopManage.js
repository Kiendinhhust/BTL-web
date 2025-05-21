import React, { Component } from "react";
import { connect } from "react-redux";
import "./ShopManage.scss";
import { getShopByUserId } from "../../services/shopService";
import { getProductsByShop, deleteProduct, getItemsByProduct } from "../../services/productService";
import { getImageByPublicId } from "../../services/storeService";
import CommonUtils from "../../utils/CommonUtils";
import { toast } from "react-toastify";
import { withRouter } from "react-router-dom";
import ModalProduct from "./ModalProduct";

class ShopManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shopInfo: null,
      products: [],
      productItems: {}, // Store items for each product: { productId: [items] }
      loading: true,
      isModalOpen: false,
      selectedProduct: null,
      selectedItems: [], // Items for the selected product
      isEdit: false,
      currentPage: 1,
      totalPages: 0,
      pageSize: 10,
      totalItems: 0,
      showVariantDetails: false,
      selectedVariantIndex: -1,
      selectedProductId: null
    };
  }

  async componentDidMount() {
    try {
      await this.fetchShopInfo();
      if (this.state.shopInfo) {
        await this.fetchProducts();
      }
    } catch (error) {
      console.error("Error in componentDidMount:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      this.setState({ loading: false });
    }
  }

  fetchShopInfo = async () => {
    try {
      // Lấy thông tin shop từ API
      if (this.props.userInfo && this.props.userInfo.userId) {
        const res = await getShopByUserId(this.props.userInfo.userId);

        if (res && res.data && res.data.success) {
          const shopData = res.data.data;

          // Cập nhật state với thông tin shop
          this.setState({
            shopInfo: {
              id: shopData.shop_id,
              name: shopData.shop_name,
              description: shopData.description || "Chưa có mô tả",
              address: shopData.address || "Chưa có địa chỉ",
              phone: shopData.phone || "Chưa có số điện thoại",
              email: this.props.userInfo.email || "Chưa có email",
              rating: shopData.rating || 0,
              totalSales: shopData.total_orders || 0,
              totalRevenue: shopData.total_revenue || 0,
              status: shopData.status,
              rejectionReason: shopData.rejection_reason,
              image: shopData.img
                ? CommonUtils.getBase64Image(shopData.img)
                : null,
            }
          });
          return true;
        } else {
          toast.error("Không thể lấy thông tin shop");
          this.setState({ loading: false });
          return false;
        }
      } else {
        toast.error("Bạn cần đăng nhập để xem thông tin shop");
        this.setState({ loading: false });
        return false;
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast.error("Lỗi khi lấy thông tin shop");
      this.setState({ loading: false });
      return false;
    }
  }

  fetchProducts = async () => {
    try {
      const { currentPage, pageSize } = this.state;
      const shopId = this.state.shopInfo.id;

      const res = await getProductsByShop(shopId, currentPage, pageSize);
      console.log("Products response:", res);
      if (res.data && res.data.success) {
        // Lấy danh sách sản phẩm
        const products = res.data.products || [];

        // Lưu trữ items cho mỗi sản phẩm
        const productItems = { ...this.state.productItems };

        // Xử lý ảnh và lấy items cho mỗi sản phẩm
        const productsWithImages = await Promise.all(products.map(async (product) => {
          // Lấy danh sách items cho sản phẩm
          try {
            const itemsRes = await getItemsByProduct(product.product_id);
            console.log("Items response:", itemsRes);
            if (itemsRes.data && itemsRes.data.success) {
              const items = itemsRes.data.data.items || [];

              // Lưu items vào state
              productItems[product.product_id] = items;

              // Xử lý ảnh cho mỗi item
              const itemsWithImages = await Promise.all(items.map(async (item) => {
                if (item.image_url) {
                  try {
                    // Lấy URL ảnh từ public_id
                    const imageResult = await getImageByPublicId(item.image_url);
                    if (imageResult.success) {
                      return {
                        ...item,
                        imageUrl: imageResult.url // Thêm imageUrl để hiển thị
                      };
                    }
                  } catch (imgError) {
                    console.error("Error fetching item image:", imgError);
                  }
                }
                return item;
              }));

              productItems[product.product_id] = itemsWithImages;

              // Sử dụng ảnh của item đầu tiên cho sản phẩm nếu có
              if (itemsWithImages.length > 0 && itemsWithImages[0].imageUrl) {
                return {
                  ...product,
                  image_url: itemsWithImages[0].imageUrl
                };
              }
            }
          } catch (itemsError) {
            console.error("Error fetching items for product:", itemsError);
          }

          // Fallback: Nếu không có items hoặc có lỗi, sử dụng ảnh từ product nếu có
          if (product.image_url) {
            try {
              const imageResult = await getImageByPublicId(product.image_url);
              if (imageResult.success) {
                return {
                  ...product,
                  image_url: imageResult.url
                };
              }
            } catch (imgError) {
              console.error("Error fetching product image:", imgError);
            }
          }

          return product;
        }));

        this.setState({
          products: productsWithImages,
          productItems: productItems,
          totalPages: res.data.totalPages || 0,
          totalItems: res.data.totalItems || 0,
          loading: false
        });
      } else {
        toast.error("Không thể lấy danh sách sản phẩm");
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Có lỗi xảy ra khi lấy danh sách sản phẩm");
      this.setState({ loading: false });
    }
  }

  toggleModal = () => {
    this.setState({
      isModalOpen: !this.state.isModalOpen,
      selectedProduct: null,
      selectedItems: [],
      isEdit: false
    });
  }

  // Show variant details
  showVariantDetails = (productId, variantIndex) => {
    this.setState({
      showVariantDetails: true,
      selectedVariantIndex: variantIndex,
      selectedProductId: productId
    });
  }

  // Hide variant details
  hideVariantDetails = () => {
    this.setState({
      showVariantDetails: false,
      selectedVariantIndex: -1,
      selectedProductId: null
    });
  }

  openEditModal = (product) => {
    // Get items for the selected product
    const items = this.state.productItems[product.product_id] || [];

    this.setState({
      isModalOpen: true,
      selectedProduct: product,
      selectedItems: items,
      isEdit: true
    });
  }

  handleDeleteProduct = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        this.setState({ loading: true });
        const res = await deleteProduct(productId);

        if (res.data && res.data.success) {
          toast.success('Xóa sản phẩm thành công!');
          this.fetchProducts();
        } else {
          toast.error(res.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
          this.setState({ loading: false });
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        this.setState({ loading: false });
      }
    }
  }

  formatPrice = (price) => {
    // Handle NaN, undefined, or null values
    if (price === undefined || price === null || isNaN(price)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  formatPriceRange = (items) => {
    if (!items || items.length === 0) return '';

    // Find min and max prices
    const prices = items.map(item => {
      // Use sale_price if available, otherwise use regular price
      // Handle potential NaN values
      const salePrice = item.sale_price ? parseFloat(item.sale_price) : null;
      const regularPrice = item.price ? parseFloat(item.price) : 0;

      return salePrice !== null && !isNaN(salePrice) ? salePrice : regularPrice;
    }).filter(price => !isNaN(price) && price !== null);

    // If no valid prices, return default
    if (prices.length === 0) return '0 ₫';

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return this.formatPrice(minPrice);
    } else {
      return `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
    }
  }

  calculateTotalStock = (items) => {
    if (!items || items.length === 0) return 0;

    // Sum up all stock values
    return items.reduce((total, item) => total + parseInt(item.stock || 0), 0);
  }

  // Render variant details
  renderVariantDetails = () => {
    const { selectedProductId, selectedVariantIndex } = this.state;
    const items = this.state.productItems[selectedProductId] || [];

    if (items.length === 0) {
      return <div className="no-variants-message">Không có biến thể nào cho sản phẩm này</div>;
    }

    // Find the product
    const product = this.state.products.find(p => p.product_id === selectedProductId);

    if (!product) {
      return <div className="error-message">Không tìm thấy thông tin sản phẩm</div>;
    }

    return (
      <div className="variant-details-container">
        <div className="product-title">
          <h4>{product.title}</h4>
        </div>

        <div className="variants-tabs">
          <div className="variants-tabs-header">
            <button
              className={selectedVariantIndex === -1 ? 'active' : ''}
              onClick={() => this.setState({ selectedVariantIndex: -1 })}
            >
              Tất cả
            </button>

            {items.map((item, idx) => (
              <button
                key={idx}
                className={selectedVariantIndex === idx ? 'active' : ''}
                onClick={() => this.setState({ selectedVariantIndex: idx })}
              >
                {item.sku || `Biến thể ${idx+1}`}
              </button>
            ))}
          </div>

          <div className="variants-tabs-content">
            {selectedVariantIndex === -1 ? (
              // Show all variants
              <div className="variants-table">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Thuộc tính</th>
                      <th>Giá</th>
                      <th>Giá KM</th>
                      <th>Tồn kho</th>
                      <th>Hình ảnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.sku || `Biến thể ${idx+1}`}</td>
                        <td>
                          {Object.entries(item.attributes || {}).map(([key, value], attrIdx) => (
                            <div key={attrIdx} className="attribute-pair">
                              <span className="attribute-key">{key}:</span>
                              <span className="attribute-value">{value}</span>
                            </div>
                          ))}
                        </td>
                        <td>{this.formatPrice(item.price)}</td>
                        <td>{item.sale_price ? this.formatPrice(item.sale_price) : '-'}</td>
                        <td>{item.stock}</td>
                        <td>
                          {item.imageUrl ? (
                            <div className="variant-image" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                          ) : (
                            <div className="no-image">
                              <i className="fas fa-image"></i>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Show selected variant
              <div className="single-variant-details">
                {items[selectedVariantIndex] && (
                  <div className="variant-card">
                    <div className="variant-image-container">
                      {items[selectedVariantIndex].imageUrl ? (
                        <div
                          className="variant-image-large"
                          style={{ backgroundImage: `url(${items[selectedVariantIndex].imageUrl})` }}
                        ></div>
                      ) : (
                        <div className="no-image-large">
                          <i className="fas fa-image"></i>
                          <span>Không có hình ảnh</span>
                        </div>
                      )}
                    </div>

                    <div className="variant-info">
                      <div className="info-row">
                        <span className="info-label">SKU:</span>
                        <span className="info-value">{items[selectedVariantIndex].sku || `Biến thể ${selectedVariantIndex+1}`}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Giá:</span>
                        <span className="info-value">{this.formatPrice(items[selectedVariantIndex].price)}</span>
                      </div>

                      {items[selectedVariantIndex].sale_price && (
                        <div className="info-row">
                          <span className="info-label">Giá khuyến mãi:</span>
                          <span className="info-value sale-price">{this.formatPrice(items[selectedVariantIndex].sale_price)}</span>
                        </div>
                      )}

                      <div className="info-row">
                        <span className="info-label">Tồn kho:</span>
                        <span className="info-value">{items[selectedVariantIndex].stock}</span>
                      </div>

                      <div className="info-row attributes">
                        <span className="info-label">Thuộc tính:</span>
                        <div className="attributes-list">
                          {Object.entries(items[selectedVariantIndex].attributes || {}).map(([key, value], attrIdx) => (
                            <div key={attrIdx} className="attribute-pair">
                              <span className="attribute-key">{key}:</span>
                              <span className="attribute-value">{value}</span>
                            </div>
                          ))}
                          {Object.keys(items[selectedVariantIndex].attributes || {}).length === 0 && (
                            <span className="no-attributes">Không có thuộc tính</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { shopInfo, products, loading, isModalOpen, selectedProduct, isEdit } = this.state;
    console.log("products:", products);
    if (loading) {
      return (
        <div className="shop-manage-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <div>Đang tải thông tin cửa hàng...</div>
          </div>
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
            <button
              className="btn-add-product"
              onClick={this.toggleModal}
              disabled={shopInfo?.status !== 'accepted'}
            >
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
                {shopInfo.status === "pending" && (
                  <i className="fas fa-clock"></i>
                )}
                {shopInfo.status === "accepted" && (
                  <i className="fas fa-check-circle"></i>
                )}
                {shopInfo.status === "rejected" && (
                  <i className="fas fa-times-circle"></i>
                )}
              </div>
              <div className="status-text">
                {shopInfo.status === "pending" && "Đang chờ duyệt"}
                {shopInfo.status === "accepted" && "Đã được duyệt"}
                {shopInfo.status === "rejected" && "Đã bị từ chối"}
              </div>
              {shopInfo.status === "rejected" && shopInfo.rejectionReason && (
                <div className="rejection-reason">
                  <p>
                    <strong>Lý do:</strong> {shopInfo.rejectionReason}
                  </p>
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
              <div className="stat-value">
                {products.reduce((total, product) => total + product.sold, 0)}
              </div>
              <div className="stat-label">Đã bán</div>
            </div>
            {shopInfo.totalRevenue !== undefined && (
              <div className="stat-item">
                <div className="stat-value">
                  {shopInfo.totalRevenue.toLocaleString("vi-VN")} đ
                </div>
                <div className="stat-label">Doanh thu</div>
              </div>
            )}
          </div>
        </div>

        <div className="products-section">
          <h2>Danh sách sản phẩm</h2>
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.product_id} className="product-card">
                  <div className="product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} />
                    ) : (
                      <div className="no-image">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <div className="product-variants">
                      {this.state.productItems[product.product_id] &&
                       this.state.productItems[product.product_id].length > 0 ? (
                        <div className="variants-info">
                          <div className="variant-count">
                            {this.state.productItems[product.product_id].length} biến thể
                          </div>
                          <div className="price-range">
                            {this.formatPriceRange(this.state.productItems[product.product_id])}
                          </div>
                          <div className="total-stock">
                            Tổng tồn kho: {this.calculateTotalStock(this.state.productItems[product.product_id])}
                          </div>

                          {/* Variant list */}
                          <div className="variant-list">
                            <button
                              className="view-variants-btn"
                              onClick={() => this.showVariantDetails(product.product_id, -1)}
                            >
                              Xem tất cả biến thể
                            </button>

                            {/* Display first 3 variants as quick access */}
                            <div className="quick-variants">
                              {this.state.productItems[product.product_id].slice(0, 3).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="variant-item"
                                  onClick={() => this.showVariantDetails(product.product_id, idx)}
                                >
                                  <span className="variant-sku">{item.sku || `Biến thể ${idx+1}`}</span>
                                  <span className="variant-price">{this.formatPrice(item.sale_price || item.price)}</span>
                                </div>
                              ))}

                              {this.state.productItems[product.product_id].length > 3 && (
                                <div className="more-variants">
                                  +{this.state.productItems[product.product_id].length - 3} biến thể khác
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="no-variants">
                          Chưa có biến thể
                        </div>
                      )}
                    </div>
                    <div className="product-stats">
                      <span>Đã bán: {product.sold_count || 0}</span>
                    </div>
                  </div>
                  <div className="product-actions">
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
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

        <ModalProduct
          isOpen={isModalOpen}
          toggleModal={this.toggleModal}
          productData={selectedProduct}
          productItems={this.state.selectedItems}
          isEdit={isEdit}
          shopId={shopInfo?.id}
          fetchProducts={this.fetchProducts}
        />

        {/* Variant Details Modal */}
        {this.state.showVariantDetails && this.state.selectedProductId && (
          <div className="variant-details-modal">
            <div className="variant-details-content">
              <div className="variant-details-header">
                <h3>Chi tiết biến thể</h3>
                <button className="close-btn" onClick={this.hideVariantDetails}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="variant-details-body">
                {this.renderVariantDetails()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.admin.userInfo,
  };
};

export default connect(mapStateToProps)(withRouter(ShopManage));
