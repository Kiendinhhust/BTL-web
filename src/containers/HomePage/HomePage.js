import React, { useEffect } from "react";
import { connect } from "react-redux";
import "./HomePage.scss";
import Product from "../../components/Product/Product";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
const HomePage = (props) => {
  const filteredProducts = props.products.filter((product) =>
    product.name.toLowerCase().includes(props.search.toLowerCase())
  );
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  let page = query.get("page");
  if (page === null || page <= 0) {
    page = 1;
  }
  console.log(page);
  return (
    <div className="homepage-container">
      <div className="homepage-productscontainer">
        {filteredProducts.map((product) => (
          <Product
            key={product.id}
            id={product.id}
            rating={product.rating}
            name={product.name}
            image={product.image}
            priceCents={product.priceCents}
            keywords={product.keywords}
          />
        ))}
      </div>
      <hr className="homepage-dash" />
      <span className="homepage-pagination">
        {page - 2 > 0 && (
          <button
            onClick={() => history.push(`/home?page=${Number(page) - 2}`)}
          >
            {Number(page) - 2}
          </button>
        )}
        {page - 1 > 0 && (
          <button
            onClick={() => history.push(`/home?page=${Number(page) - 1}`)}
          >
            {Number(page) - 1}
          </button>
        )}
        <button onClick={() => history.push(`/home?page=${Number(page)}`)}>
          {Number(page)}
        </button>
        <button onClick={() => history.push(`/home?page=${Number(page) + 1}`)}>
          {Number(page) + 1}
        </button>
        <button onClick={() => history.push(`/home?page=${Number(page) + 2}`)}>
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
    products: state.productR.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
