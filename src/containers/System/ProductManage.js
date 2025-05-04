import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./ProductManage.scss";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import productImageNull from "../../assets/images/icons/product.png";
import axios from "axios";
import ProductAdd from "./ProductAdd";
import ProductShop from "../../components/Product/ProductShop";
const ProductManage = (props) => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  let page = query.get("page");
  if (page === null || page <= 0) {
    page = 1;
  }
  let title = props.search;
  if (title === null || title === undefined) {
    title = "";
  }
  let shop_id = query.get("shop_id");
  if (shop_id === null) {
    shop_id = "";
  }
  useEffect(() => {
    axios({
      method: "get",
      url:
        title !== null
          ? `${process.env.REACT_APP_BACKEND_URL}/api/products?page=${page}&title=${title}`
          : `${process.env.REACT_APP_BACKEND_URL}/api/products?page=${page}`,
    }).then((response) => {
      setProducts(response.data.products);
      console.log(response);
    });
  }, [page, title]);
  const renderProductList = () => {
    return products.map((product) => (
      <ProductShop
        key={product.product_id}
        product={product}
        shop_id={shop_id}
      />
    ));
  };
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);
  return (
    <div className="productmanage-container">
      <button className="productmanage-addproduct" onClick={toggle}>
        Add Product
      </button>
      <Modal isOpen={modal} toggle={toggle} className="productmanage-modal">
        <ModalHeader toggle={toggle}>Add Product</ModalHeader>
        <ModalBody>
          <ProductAdd toggle={toggle} shop_id={shop_id} />
        </ModalBody>
      </Modal>
      <div className="productmanage-productscontainer">
        {renderProductList()}
      </div>
      <hr className="productmanage-dash" />
      <span className="productmanage-pagination">
        {page > 3 ? (
          <button
            onClick={() =>
              history.push(
                `/system/product-manage?page=${1}${
                  title !== null && title !== "" ? `&title=${title}` : ""
                }${
                  shop_id !== null && shop_id !== ""
                    ? `&shop_id=${shop_id}`
                    : ""
                }`
              )
            }
          >
            {1}
          </button>
        ) : null}
        {page - 2 > 0 && (
          <button
            onClick={() =>
              history.push(
                `/system/product-manage?page=${Number(page) - 2}${
                  title !== null && title !== "" ? `&title=${title}` : ""
                }${
                  shop_id !== null && shop_id !== ""
                    ? `&shop_id=${shop_id}`
                    : ""
                }`
              )
            }
          >
            {Number(page) - 2}
          </button>
        )}
        {page - 1 > 0 && (
          <button
            onClick={() =>
              history.push(
                `/system/product-manage?page=${Number(page) - 1}${
                  title !== null && title !== "" ? `&title=${title}` : ""
                }${
                  shop_id !== null && shop_id !== ""
                    ? `&shop_id=${shop_id}`
                    : ""
                }`
              )
            }
          >
            {Number(page) - 1}
          </button>
        )}

        <button
          className="productmanage-pagination-now"
          onClick={() =>
            history.push(
              `/system/product-manage?page=${Number(page)}${
                title !== null && title !== "" ? `&title=${title}` : ""
              }${
                shop_id !== null && shop_id !== "" ? `&shop_id=${shop_id}` : ""
              }`
            )
          }
        >
          {Number(page)}
        </button>
        <button
          onClick={() =>
            history.push(
              `/system/product-manage?page=${Number(page) + 1}${
                title !== null && title !== "" ? `&title=${title}` : ""
              }${
                shop_id !== null && shop_id !== "" ? `&shop_id=${shop_id}` : ""
              }`
            )
          }
        >
          {Number(page) + 1}
        </button>
        <button
          onClick={() =>
            history.push(
              `/system/product-manage?page=${Number(page) + 2}${
                title !== null && title !== "" ? `&title=${title}` : ""
              }${
                shop_id !== null && shop_id !== "" ? `&shop_id=${shop_id}` : ""
              }`
            )
          }
        >
          {Number(page) + 2}
        </button>
      </span>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    products: state.productR.products,
    search: state.navbarCart.search,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductManage);
