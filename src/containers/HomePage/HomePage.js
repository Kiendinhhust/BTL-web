import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./HomePage.scss";
import Product from "../../components/Product/Product";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
const HomePage = (props) => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  let page = query.get("page");
  if (page === null || page <= 0) {
    page = 1;
  }
  let title = props.search;
  if (title === null) {
    title = "";
  }
  useEffect(() => {
    axios({
      method: "get",
      url:
        title !== null
          ? `${process.env.REACT_APP_BACKEND_URL}/api/products?page=${page}&title=${title}`
          : `${process.env.REACT_APP_BACKEND_URL}/api/products?page=${page}`,
      headers: {},
    }).then((response) => {
      setProducts(response.data.products);
    });
  }, [page, title]);
  const renderProductList = () => {
    return products.map((product) => (
      <Product
        key={product.product_id}
        product={product}
        // id={product.product_id}
        // rating={product.rating}
        // name={product.title}
      />
    ));
  };

  return (
    <div className="homepage-container">
      <div className="homepage-productscontainer">{renderProductList()}</div>
      <hr className="homepage-dash" />
      <span className="homepage-pagination">
        {page > 3 ? (
          <button
            onClick={() =>
              history.push(
                title !== null && title !== ""
                  ? `/home?page=${1}&title=${title}`
                  : `/home?page=${1}`
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
                title !== null && title !== ""
                  ? `/home?page=${Number(page) - 2}&title=${title}`
                  : `/home?page=${Number(page) - 2}`
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
                title !== null && title !== ""
                  ? `/home?page=${Number(page) - 1}&title=${title}`
                  : `/home?page=${Number(page) - 1}`
              )
            }
          >
            {Number(page) - 1}
          </button>
        )}

        <button
          className="homepage-pagination-now"
          onClick={() =>
            history.push(
              title !== null && title !== ""
                ? `/home?page=${Number(page)}&title=${title}`
                : `/home?page=${Number(page)}`
            )
          }
        >
          {Number(page)}
        </button>
        <button
          onClick={() =>
            history.push(
              title !== null && title !== ""
                ? `/home?page=${Number(page) + 1}&title=${title}`
                : `/home?page=${Number(page) + 1}`
            )
          }
        >
          {Number(page) + 1}
        </button>
        <button
          onClick={() =>
            history.push(
              title !== null && title !== ""
                ? `/home?page=${Number(page) + 2}&title=${title}`
                : `/home?page=${Number(page) + 2}`
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
    isLoggedIn: state.admin.isLoggedIn,
    search: state.navbarCart.search,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
