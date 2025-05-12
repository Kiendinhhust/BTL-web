import React, { useEffect, useRef, useState } from "react";
import checkmark from "../../assets/images/icons/checkmark.png";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/navbarCartActions";
import "./ItemShop.scss";
import { accessToken, LoginHack } from "./LoginHack";
import axios from "axios";
import itemImageNull from "../../assets/images/icons/item.png";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
const ItemShop = (props) => {
  const info = props.item;
  // console.log(info);
  // const product = props.products.find((product) => product.product_id === id);
  const history = useHistory();
  const [price, setPrice] = useState(info?.price);
  const [stock, setStock] = useState(info?.stock);
  const [sale_price, setSalePrice] = useState(info?.sale_price);
  const [attributes, setAttributes] = useState(info?.attributes);
  const [file, setFile] = useState(null);
  const [state, setState] = useState({
    checkCheckMark: false,
    timeOut: null,
  });
  console.log(props.item);
  const imageHandler = (e) => {
    setFile(e.target.files[0]);
  };
  const handleAttributeChange = (att, value) => {
    const newAttributes = { ...attributes };
    newAttributes[att] = value;
    setAttributes(newAttributes);
  };
  const handleUpdate = () => {
    setState((prevState) => {
      prevState.timeOut && clearTimeout(prevState.timeOut);
      const timeOut = setTimeout(() => {
        setState((prevState) => ({ checkCheckMark: false }));
      }, 1000);
      return {
        checkCheckMark: true,
        timeOut,
      };
    });
    // props.addToCart({ quantity: cartQuantity, info, title: product.title });
  };
  const handleItemUpdate = async () => {
    await LoginHack;
    const formData = new FormData();
    let image_url;
    formData.append("image", file);
    console.log(file);
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
        image_url = response.data.url;
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(image_url);
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
    handleUpdate();
    history.push(window.location.pathname + window.location.search);
  };
  useEffect(() => {
    return () => {
      clearTimeout(state.timeOut);
    };
  }, [state.timeOut]);

  return (
    <div className="itemshop-container">
      <div className="itemshop-image-container">
        <label htmlFor={`itemshop-file-input${info?.item_id}`}>
          <img
            className="itemshop-image"
            src={
              (file && URL.createObjectURL(file)) ||
              info?.image_url ||
              itemImageNull
            }
            alt="Upload Thumbnail"
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id={`itemshop-file-input${info?.item_id}`}
          hidden
        />
      </div>

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
            value={price && Number(price)}
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
            value={sale_price && Number(sale_price)}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Enter sale price..."
            className="itemadd-attribute-input"
          />
          <hr />
        </div>
      </div>
      {state.checkCheckMark === true ? (
        <div className={`added-to-cart js-added-to-cart-${props.product_id}`}>
          <img className="itemshop-checkmark" src={checkmark} alt="checkmark" />
          <span className="itemshop-added">Updated</span>
        </div>
      ) : (
        <br className={`added-to-cart js-added-to-cart-${props.product_id}`} />
      )}

      <button
        className={`addToCart-button button-primary js-add-to-cart`}
        onClick={() => handleItemUpdate()}
      >
        Update
      </button>

      {/* Phần này là tùy chọn, bạn có thể thêm nếu muốn hiển thị thông tin chi tiết hơn */}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    cartQuantity: state.navbarCart.quantity,
    products: state.productR.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (payload) => dispatch(addToCart(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemShop);
