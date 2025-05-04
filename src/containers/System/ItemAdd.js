import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import upload_area from "../../assets/images/upload_area.svg";
import { addProduct } from "../../store/actions/productActions";
import "./ItemAdd.scss";
import checkmark from "../../assets/images/icons/checkmark.png";
import axios from "axios";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { accessToken, LoginHack } from "./LoginHack";
const ItemAdd = (props) => {
  const history = useHistory();
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image_url, setImageUrl] = useState(null);
  const [sale_price, setSalePrice] = useState("");
  const [attributes, setAttributes] = useState({});
  const [added, setAdded] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  const [image, setImage] = useState(upload_area);
  const imageHandler = async (e) => {
    const file = e.target.files[0];
    setImage(file);
    const formData = new FormData();
    formData.append("image", file);
    await LoginHack;
    await axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/utils/store/image/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        }
      )
      .then(function (response) {
        setImageUrl(response.data.url);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const handleItemAdd = async () => {
    await LoginHack;

    await axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/products/add-item/${props.product_id}`,
        {
          price,
          stock,
          image_url,
          sale_price,
          attributes,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        }
      )
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    handleAdded();
    props.toggle();
    history.push(window.location.pathname + window.location.search);
  };
  const handleAdded = () => {
    setAdded((prevState) => {
      prevState.timeOut && clearTimeout(prevState.timeOut);
      const timeOut = setTimeout(() => {
        setAdded((prevState) => ({ checkCheckMark: false }));
      }, 1000);
      return {
        checkCheckMark: true,
        timeOut,
      };
    });
  };

  useEffect(() => {
    return () => {
      clearTimeout(added.timeOut);
    };
  }, [added.timeOut]);

  const handleAttributeChange = (att, value) => {
    const newAttributes = { ...attributes };
    newAttributes[att] = value;
    setAttributes(newAttributes);
  };

  return (
    <div className="itemadd-container">
      {/* <div className="itemadd-price">
        <div className="itemadd-itemfield">
          <p>Price</p>
          <input
            value={productDetails.price}
            onChange={changeHandler}
            type="text"
            name="price"
            placeholder="Type here"
          />
        </div>
      </div> */}
      <div className="itemadd-attributes">
        <div>
          <p className="itemadd-p">Màu</p>
          <input
            type="text"
            value={attributes["Màu"]}
            onChange={(e) => handleAttributeChange("Màu", e.target.value)}
            placeholder="Enter color..."
            className="itemadd-attribute-input"
          />
          <p className="itemadd-p">Size</p>
          <input
            type="text"
            value={attributes["Size"]}
            onChange={(e) => handleAttributeChange("Size", e.target.value)}
            placeholder="Enter size..."
            className="itemadd-attribute-input"
          />
          <hr />
        </div>
      </div>
      <div className="itemadd-itemfield">
        <div>
          <p className="itemadd-p">Price</p>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price..."
            className="itemadd-attribute-input"
          />
          <p className="itemadd-p">Stock</p>
          <input
            type="text"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter stock..."
            className="itemadd-attribute-input"
          />
          <hr />
          <p className="itemadd-p">Sale Price</p>
          <input
            type="text"
            value={sale_price}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Enter sale price..."
            className="itemadd-attribute-input"
          />
          <hr />
        </div>
      </div>
      <div className="itemadd-itemfield">
        <label htmlFor="file-input" className="itemadd-thumbnail-label">
          <img
            className="itemadd-thumbnail-img"
            src={image_url || upload_area}
            alt="Upload Thumbnail"
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>

      <button onClick={() => handleItemAdd()} className="itemadd-btn">
        Add Item
      </button>
      {added.checkCheckMark && (
        <div className={`added-to-cart js-added-to-cart-${props.id}`}>
          <img className="product-checkmark" src={checkmark} alt="checkmark" />{" "}
          Added
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return { products: state.productR.products };
};

const mapDispatchToProps = (dispatch) => {
  return { addProduct: (payload) => dispatch(addProduct(payload)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemAdd);
