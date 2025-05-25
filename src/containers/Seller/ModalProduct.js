import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { toast } from "react-toastify";
import "./ModalProduct.scss";
import { createProduct, updateProduct } from "../../services/productService";
import { uploadImage, getImageByPublicId } from "../../services/storeService";

class ModalProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      category_id: "",
      status: "active",
      items: [], // Array of items with their own properties
      currentItemIndex: 0, // Index of the currently edited item
      showItemForm: false, // Whether to show the item form
      isSubmitting: false,
      errors: {
        title: "",
        items: [], // Array of errors for each item
      },
    };
  }

  async componentDidMount() {
    if (this.props.productData) {
      const { title, description, category_id, status } =
        this.props.productData;

      // Khởi tạo state với dữ liệu cơ bản của sản phẩm
      this.setState({
        title: title || "",
        description: description || "",
        category_id: category_id || "",
        status: status || "active",
      });

      // Xử lý các items nếu có
      if (this.props.productItems && this.props.productItems.length > 0) {
        // Xử lý từng item và lấy URL ảnh từ public_id
        const itemsWithPreview = await Promise.all(
          this.props.productItems.map(async (item) => {
            let imagePreviewUrl = "";
            let imagePublicId = item.image_url || "";

            if (imagePublicId) {
              try {
                const imageResult = await getImageByPublicId(imagePublicId);
                if (imageResult.success) {
                  imagePreviewUrl = imageResult.url;
                }
              } catch (error) {
                console.error("Error fetching item image:", error);
              }
            }

            return {
              item_id: item.item_id,
              price: item.price || "",
              stock: item.stock || "",
              sale_price: item.sale_price || "",
              attributes: item.attributes || {},
              image_url: imagePublicId,
              previewImgURL: imagePreviewUrl,
              sku: item.sku || "",
            };
          })
        );

        this.setState({
          items: itemsWithPreview,
          errors: {
            ...this.state.errors,
            items: Array(itemsWithPreview.length).fill({}),
          },
        });
      } else {
        // Nếu không có items, tạo một item mặc định
        this.setState({
          items: [
            {
              price: "",
              stock: "",
              sale_price: "",
              attributes: {},
              image_url: "",
              previewImgURL: "",
              sku: "",
            },
          ],
          errors: {
            ...this.state.errors,
            items: [{}],
          },
        });
      }
    } else {
      // Nếu không có productData, tạo một item mặc định
      this.setState({
        items: [
          {
            price: "",
            stock: "",
            sale_price: "",
            attributes: {},
            image_url: "",
            previewImgURL: "",
            sku: "",
          },
        ],
        errors: {
          ...this.state.errors,
          items: [{}],
        },
      });
    }
  }

  async componentDidUpdate(prevProps) {
    // Nếu productData thay đổi
    if (
      prevProps.productData !== this.props.productData &&
      this.props.productData
    ) {
      const { title, description, category_id, status } =
        this.props.productData;

      // Cập nhật state với dữ liệu cơ bản của sản phẩm
      this.setState({
        title: title || "",
        description: description || "",
        category_id: category_id || "",
        status: status || "active",
      });
    }

    // Nếu productItems thay đổi
    if (prevProps.productItems !== this.props.productItems) {
      if (this.props.productItems && this.props.productItems.length > 0) {
        // Xử lý từng item và lấy URL ảnh từ public_id
        const itemsWithPreview = await Promise.all(
          this.props.productItems.map(async (item) => {
            let imagePreviewUrl = "";
            let imagePublicId = item.image_url || "";

            if (imagePublicId) {
              try {
                const imageResult = await getImageByPublicId(imagePublicId);
                if (imageResult.success) {
                  imagePreviewUrl = imageResult.url;
                }
              } catch (error) {
                console.error("Error fetching item image:", error);
              }
            }

            return {
              item_id: item.item_id,
              price: item.price || "",
              stock: item.stock || "",
              sale_price: item.sale_price || "",
              attributes: item.attributes || {},
              image_url: imagePublicId,
              previewImgURL: imagePreviewUrl,
              sku: item.sku || "",
            };
          })
        );

        this.setState({
          items: itemsWithPreview,
          errors: {
            ...this.state.errors,
            items: Array(itemsWithPreview.length).fill({}),
          },
        });
      } else if (this.state.items.length === 0) {
        // Nếu không có items, tạo một item mặc định
        this.setState({
          items: [
            {
              price: "",
              stock: "",
              sale_price: "",
              attributes: {},
              image_url: "",
              previewImgURL: "",
              sku: "",
            },
          ],
          errors: {
            ...this.state.errors,
            items: [{}],
          },
        });
      }
    }
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;

    // Xóa lỗi khi người dùng nhập
    if (copyState.errors[id]) {
      copyState.errors[id] = "";
    }

    this.setState({
      ...copyState,
    });
  };

  // Handle changes to item fields
  handleItemChange = (index, field, value) => {
    const items = [...this.state.items];
    items[index] = {
      ...items[index],
      [field]: value,
    };

    this.setState({ items });
  };

  // Handle changes to item attributes
  handleItemAttributeChange = (index, attributeName, value) => {
    const items = [...this.state.items];
    items[index] = {
      ...items[index],
      attributes: {
        ...items[index].attributes,
        [attributeName]: value,
      },
    };

    this.setState({ items });
  };

  // Handle image upload for an item
  handleItemImageUpload = async (event, index) => {
    let file = event.target.files[0];

    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      const errors = { ...this.state.errors };
      if (!errors.items[index]) errors.items[index] = {};
      errors.items[index].image =
        "Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.";
      this.setState({ errors });
      return;
    }

    // Validate file type
    if (!file.type.match("image.*")) {
      const errors = { ...this.state.errors };
      if (!errors.items[index]) errors.items[index] = {};
      errors.items[index].image = "Vui lòng chọn file ảnh.";
      this.setState({ errors });
      return;
    }

    // Create preview URL
    let objectUrl = URL.createObjectURL(file);
    const items = [...this.state.items];
    items[index] = {
      ...items[index],
      previewImgURL: objectUrl,
    };

    // Clear any previous errors
    const errors = { ...this.state.errors };
    if (!errors.items[index]) errors.items[index] = {};
    errors.items[index].image = "";

    this.setState({ items, errors });

    try {
      // Upload image using storeService
      const result = await uploadImage(file, "items");

      if (result.success) {
        items[index] = {
          ...items[index],
          image_url: result.public_id, // Store public_id
        };
        console.log("Image uploaded successfully:", result);
        this.setState({ items });
        toast.success("Tải ảnh lên thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else {
        toast.error(result.error || "Lỗi khi tải ảnh lên", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Lỗi khi tải ảnh lên", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  // Add a new item
  addItem = () => {
    const items = [...this.state.items];
    items.push({
      price: "",
      stock: "",
      sale_price: "",
      attributes: {},
      image_url: "",
      previewImgURL: "",
      sku: "",
    });

    const errors = { ...this.state.errors };
    errors.items.push({});

    this.setState({
      items,
      errors,
      currentItemIndex: items.length - 1, // Set focus to the new item
    });
  };

  // Remove an item
  removeItem = (index) => {
    if (this.state.items.length <= 1) {
      toast.warning("Sản phẩm phải có ít nhất một biến thể", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    const items = [...this.state.items];
    items.splice(index, 1);

    const errors = { ...this.state.errors };
    errors.items.splice(index, 1);

    const currentItemIndex = Math.min(index, items.length - 1);

    this.setState({ items, errors, currentItemIndex });
  };

  validateForm = () => {
    let isValid = true;
    let errors = {
      title: "",
      items: [...this.state.errors.items],
    };

    // Validate title
    if (!this.state.title.trim()) {
      errors.title = "Vui lòng nhập tên sản phẩm";
      isValid = false;
    }

    // Validate each item
    this.state.items.forEach((item, index) => {
      const itemErrors = {};

      // Validate price
      if (!item.price) {
        itemErrors.price = "Vui lòng nhập giá sản phẩm";
        isValid = false;
      } else if (isNaN(item.price) || parseFloat(item.price) <= 0) {
        itemErrors.price = "Giá sản phẩm phải là số dương";
        isValid = false;
      }

      // Validate stock
      if (!item.stock && item.stock !== 0) {
        itemErrors.stock = "Vui lòng nhập số lượng tồn kho";
        isValid = false;
      } else if (isNaN(item.stock) || parseInt(item.stock) < 0) {
        itemErrors.stock = "Số lượng tồn kho phải là số không âm";
        isValid = false;
      }

      // Validate sale_price if provided
      if (
        item.sale_price &&
        (isNaN(item.sale_price) || parseFloat(item.sale_price) <= 0)
      ) {
        itemErrors.sale_price = "Giá khuyến mãi phải là số dương";
        isValid = false;
      }

      // Check that sale_price is less than regular price
      if (
        item.sale_price &&
        parseFloat(item.sale_price) >= parseFloat(item.price)
      ) {
        itemErrors.sale_price = "Giá khuyến mãi phải nhỏ hơn giá gốc";
        isValid = false;
      }

      // Validate SKU
      if (!item.sku) {
        itemErrors.sku = "Vui lòng nhập mã SKU cho biến thể sản phẩm";
        isValid = false;
      }

      // Validate image
      if (!item.image_url && !item.previewImgURL) {
        itemErrors.image = "Vui lòng chọn ảnh cho biến thể sản phẩm";
        isValid = false;
      }

      errors.items[index] = itemErrors;
    });

    this.setState({ errors });
    return isValid;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Validate form
    if (!this.validateForm()) return;

    this.setState({ isSubmitting: true });

    try {
      const { title, description, category_id, status, items } = this.state;
      const shopId = this.props.shopId;

      // 2. Build payload with full items array
      const itemsPayload = items.map((item) => ({
        sku: item.sku || "",
        price: item.price !== "" ? parseFloat(item.price) : 0,
        stock: item.stock !== "" ? parseInt(item.stock, 10) : 0,
        sale_price: item.sale_price ? parseFloat(item.sale_price) : null,
        attributes: item.attributes || {},
        image_url: item.image_url || null,
      }));

      const productData = {
        title,
        description,
        category_id: category_id || null,
        status,
        shop_id: shopId,
        items: itemsPayload, // send all variants at once
      };

      // 3. Create or update product in one request
      let res;
      if (this.props.productData?.product_id) {
        res = await updateProduct(
          this.props.productData.product_id,
          productData
        );
      } else {
        res = await createProduct(productData);
      }

      if (!res.data?.success) {
        toast.error(res.data?.message || "Lỗi khi lưu sản phẩm", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        return;
      }
      toast.success(
        this.props.productData
          ? "Cập nhật thành công!"
          : "Thêm sản phẩm thành công!",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );

      // 4. Reset and refresh
      this.resetForm();
      this.props.toggleModal();
      this.props.fetchProducts();
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  resetForm = () => {
    this.setState({
      title: "",
      description: "",
      category_id: "",
      status: "active",
      items: [
        {
          price: "",
          stock: "",
          sale_price: "",
          attributes: {},
          image_url: "",
          previewImgURL: "",
          sku: "",
        },
      ],
      currentItemIndex: 0,
      showItemForm: false,
      errors: {
        title: "",
        items: [{}],
      },
    });
  };

  render() {
    const { isOpen, toggleModal, isEdit } = this.props;
    const {
      title,
      description,
      status,
      items,
      currentItemIndex,
      errors,
      isSubmitting,
    } = this.state;

    // Get current item
    const currentItem = items[currentItemIndex] || {
      price: "",
      stock: "",
      sale_price: "",
      attributes: {},
      image_url: "",
      previewImgURL: "",
    };

    // Get current item errors
    const itemErrors =
      errors.items && errors.items[currentItemIndex]
        ? errors.items[currentItemIndex]
        : {};

    return (
      <Modal
        isOpen={isOpen}
        toggle={toggleModal}
        className="modal-product-container"
        size="lg"
      >
        <div className={isSubmitting ? "loading-container" : ""}>
          {isSubmitting && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Đang xử lý...</div>
            </div>
          )}
          <ModalHeader toggle={toggleModal}>
            {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </ModalHeader>
          <ModalBody>
            <div className="modal-product-body">
              {/* Product Basic Information */}
              <div className="product-basic-info">
                <h5>Thông tin cơ bản</h5>
                <div className="form-row">
                  <div className="form-group col-12">
                    <label>Tên sản phẩm:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "title")
                      }
                      className={
                        errors.title
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                    />
                    {errors.title && (
                      <div className="invalid-feedback">{errors.title}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Trạng thái:</label>
                    <select
                      value={status}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "status")
                      }
                      className="form-control"
                    >
                      <option value="active">Đang bán</option>
                      <option value="inactive">Ngừng bán</option>
                      <option value="draft">Bản nháp</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả sản phẩm:</label>
                  <textarea
                    value={description}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, "description")
                    }
                    className="form-control"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              {/* Item Tabs */}
              <div className="product-items">
                <h5>Biến thể sản phẩm</h5>
                <div className="item-tabs">
                  <div className="item-tabs-header">
                    {items.map((itemData, index) => (
                      <div
                        key={index}
                        className={`item-tab ${
                          index === currentItemIndex ? "active" : ""
                        }`}
                        onClick={() =>
                          this.setState({ currentItemIndex: index })
                        }
                      >
                        {itemData.sku ? itemData.sku : `Biến thể ${index + 1}`}
                        {items.length > 1 && (
                          <button
                            className="remove-item-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.removeItem(index);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="add-item-tab" onClick={this.addItem}>
                      <i className="fas fa-plus"></i>
                    </div>
                  </div>

                  <div className="item-tab-content">
                    <div className="form-row">
                      <div className="form-group col-md-12">
                        <label>Mã SKU (VD: RED-M):</label>
                        <input
                          type="text"
                          value={currentItem.sku}
                          onChange={(event) =>
                            this.handleItemChange(
                              currentItemIndex,
                              "sku",
                              event.target.value
                            )
                          }
                          className={
                            itemErrors.sku
                              ? "form-control is-invalid"
                              : "form-control"
                          }
                          placeholder="Nhập mã SKU (VD: RED-M, BLUE-L)"
                        />
                        {itemErrors.sku && (
                          <div className="invalid-feedback">
                            {itemErrors.sku}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label>Giá (VNĐ):</label>
                        <input
                          type="number"
                          value={currentItem.price}
                          onChange={(event) =>
                            this.handleItemChange(
                              currentItemIndex,
                              "price",
                              event.target.value
                            )
                          }
                          className={
                            itemErrors.price
                              ? "form-control is-invalid"
                              : "form-control"
                          }
                        />
                        {itemErrors.price && (
                          <div className="invalid-feedback">
                            {itemErrors.price}
                          </div>
                        )}
                      </div>

                      <div className="form-group col-md-4">
                        <label>Giá khuyến mãi (VNĐ):</label>
                        <input
                          type="number"
                          value={currentItem.sale_price}
                          onChange={(event) =>
                            this.handleItemChange(
                              currentItemIndex,
                              "sale_price",
                              event.target.value
                            )
                          }
                          className={
                            itemErrors.sale_price
                              ? "form-control is-invalid"
                              : "form-control"
                          }
                        />
                        {itemErrors.sale_price && (
                          <div className="invalid-feedback">
                            {itemErrors.sale_price}
                          </div>
                        )}
                      </div>

                      <div className="form-group col-md-4">
                        <label>Số lượng tồn kho:</label>
                        <input
                          type="number"
                          value={currentItem.stock}
                          onChange={(event) =>
                            this.handleItemChange(
                              currentItemIndex,
                              "stock",
                              event.target.value
                            )
                          }
                          className={
                            itemErrors.stock
                              ? "form-control is-invalid"
                              : "form-control"
                          }
                        />
                        {itemErrors.stock && (
                          <div className="invalid-feedback">
                            {itemErrors.stock}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Thuộc tính:</label>
                      <div className="attributes-container">
                        <div className="attribute-row">
                          <input
                            type="text"
                            placeholder="Tên thuộc tính (VD: Màu sắc)"
                            className="form-control attribute-name"
                            value={Object.keys(currentItem.attributes)[0] || ""}
                            onChange={(e) => {
                              const oldKey =
                                Object.keys(currentItem.attributes)[0] || "";
                              const oldValue =
                                currentItem.attributes[oldKey] || "";
                              const newAttributes = {};
                              if (e.target.value) {
                                newAttributes[e.target.value] = oldValue;
                              }
                              this.handleItemChange(
                                currentItemIndex,
                                "attributes",
                                newAttributes
                              );
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Giá trị thuộc tính (VD: Đỏ)"
                            className="form-control attribute-value"
                            value={
                              Object.values(currentItem.attributes)[0] || ""
                            }
                            onChange={(e) => {
                              const key =
                                Object.keys(currentItem.attributes)[0] || "";
                              if (key) {
                                const newAttributes = {
                                  ...currentItem.attributes,
                                };
                                newAttributes[key] = e.target.value;
                                this.handleItemChange(
                                  currentItemIndex,
                                  "attributes",
                                  newAttributes
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Hình ảnh biến thể:</label>
                      <div className="upload-image">
                        <input
                          id={`itemImage-${currentItemIndex}`}
                          type="file"
                          hidden
                          onChange={(event) =>
                            this.handleItemImageUpload(event, currentItemIndex)
                          }
                        />
                        <label
                          className="upload-button"
                          htmlFor={`itemImage-${currentItemIndex}`}
                        >
                          <i className="fas fa-upload"></i> Chọn ảnh
                        </label>

                        <div className="preview-image">
                          {currentItem.previewImgURL ? (
                            <div
                              className="preview"
                              style={{
                                backgroundImage: `url(${currentItem.previewImgURL})`,
                              }}
                            ></div>
                          ) : (
                            <div className="no-preview">
                              <i className="fas fa-image"></i>
                              <span>Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                        {itemErrors.image && (
                          <div className="text-danger mt-2">
                            {itemErrors.image}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
              Hủy
            </Button>
            <Button
              color="primary"
              onClick={this.handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Đang xử lý..."
                : isEdit
                ? "Cập nhật"
                : "Thêm mới"}
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.admin.userInfo,
  };
};

export default connect(mapStateToProps)(ModalProduct);
