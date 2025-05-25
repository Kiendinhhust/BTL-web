import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./HomePage.scss";
import Product from "../../components/Product/Product";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import { toast } from "react-toastify";
import { getImageByPublicId } from "../../services/storeService";

const HomePage = (props) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productItems, setProductItems] = useState({});
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
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch products
        const response = await axios({
          method: "get",
          url:
            title !== null
              ? `${process.env.REACT_APP_BACKEND_URL}/api/products?page=${page}&title=${title}`
              : `${process.env.REACT_APP_BACKEND_URL}/api/products?page=${page}`,
          headers: {},
        });

        // Process products and fetch items for each product
        const productsData = response.data.products || [];

        // Create a map to store items for each product
        const itemsMap = {};

        // Fetch items for each product and process images
        const productsWithImages = await Promise.all(
          productsData.map(async (product) => {
            try {
              // Fetch items for this product
              const itemsResponse = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/products/item/${product.product_id}`
              );

              // Check if the response has the expected structure
              let items = [];
              console.log(
                `Items response for product ${product.product_id}:`,
                itemsResponse.data
              );

              if (
                itemsResponse.data &&
                itemsResponse.data.data &&
                Array.isArray(itemsResponse.data.data.items)
              ) {
                items = itemsResponse.data.data.items;
                console.log(
                  `Using data.data.items for product ${product.product_id}`
                );
              } else if (
                itemsResponse.data &&
                itemsResponse.data.data &&
                itemsResponse.data.data.items
              ) {
                // Handle case where items might be an object instead of array
                console.log(
                  `Items is not an array, converting for product ${product.product_id}`
                );
                items = [itemsResponse.data.data.items];
              } else if (Array.isArray(itemsResponse.data)) {
                items = itemsResponse.data;
                console.log(
                  `Using direct array for product ${product.product_id}`
                );
              } else if (
                itemsResponse.data &&
                typeof itemsResponse.data === "object"
              ) {
                // Try to extract items from the response object
                if (
                  itemsResponse.data.success &&
                  Array.isArray(itemsResponse.data.data)
                ) {
                  items = itemsResponse.data.data;
                  console.log(
                    `Using data array for product ${product.product_id}`
                  );
                }
              } else {
                console.log(
                  `Unexpected items response format for product ${product.product_id}:`,
                  itemsResponse.data
                );
              }

              console.log(
                `Final items for product ${product.product_id}:`,
                items
              );

              // Process each item to get image URL from public_id
              let processedItems = [];

              if (Array.isArray(items) && items.length > 0) {
                try {
                  processedItems = await Promise.all(
                    items.map(async (item) => {
                      if (!item) return null;

                      let imageUrl = null;

                      if (item.image_url) {
                        try {
                          const imageResult = await getImageByPublicId(
                            item.image_url
                          );
                          if (imageResult.success) {
                            imageUrl = imageResult.url;
                          }
                        } catch (imgError) {
                          console.error("Error fetching item image:", imgError);
                        }
                      }

                      return {
                        ...item,
                        imageUrl,
                      };
                    })
                  );

                  // Filter out any null items
                  processedItems = processedItems.filter(
                    (item) => item !== null
                  );
                } catch (mapError) {
                  console.error(
                    `Error processing items for product ${product.product_id}:`,
                    mapError
                  );
                  processedItems = [];
                }
              } else {
                console.log(
                  `No valid items to process for product ${product.product_id}`
                );
              }

              // Store processed items in the map
              itemsMap[product.product_id] = processedItems;

              // If product has a main image, process it too
              if (product.image_url) {
                try {
                  const imageResult = await getImageByPublicId(
                    product.image_url
                  );
                  if (imageResult.success) {
                    return {
                      ...product,
                      image_url: imageResult.url,
                    };
                  }
                } catch (imgError) {
                  console.error("Error fetching product image:", imgError);
                }
              }

              return product;
            } catch (error) {
              console.error(
                `Error fetching items for product ${product.product_id}:`,
                error
              );
              return product;
            }
          })
        );

        setProducts(productsWithImages);
        setProductItems(itemsMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Có lỗi xảy ra khi tải sản phẩm", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, title]);

  const renderProductList = () => {
    console.log("Products:", products);
    console.log("Product Items:", productItems);
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="no-products">
          <i className="fas fa-box-open"></i>
          <p>Không tìm thấy sản phẩm nào</p>
        </div>
      );
    }

    return products.map((product) => (
      <Product
        key={product.product_id}
        product={product}
        items={productItems[product.product_id] || []}
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

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
