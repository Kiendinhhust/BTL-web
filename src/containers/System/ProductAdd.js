import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import upload_area from "../../assets/images/upload_area.svg";
import { addProduct } from "../../store/actions/productActions";
import "./ProductAdd.scss";
import checkmark from "../../assets/images/icons/checkmark.png";
const ProductAdd = (props) => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    priceCents: "",
    description: "",
    category: "Quần áo",
  });
  const [keywords, setKeywords] = useState([]);
  const [added, setAdded] = useState({
    checkCheckMark: false,
    timeOut: null,
  });

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
  const imageHandler = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setProductDetails({ ...productDetails, image: file });
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const addKeyword = () => {
    setKeywords([...keywords, ""]);
  };

  const handleKeywordChange = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  return (
    <div className="productadd-container">
      <div className="productadd-itemfield">
        <p>Product name</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="productadd-price">
        <div className="productadd-itemfield">
          <p>Price</p>
          <input
            value={productDetails.priceCents}
            onChange={changeHandler}
            type="text"
            name="priceCents"
            placeholder="Type here"
          />
        </div>
      </div>
      <div className="productadd-keywords">
        <button className="productadd-keyword-btn" onClick={addKeyword}>
          Add Keyword
        </button>
        {keywords.map((keyword, index) => (
          <input
            key={index}
            type="text"
            value={keyword}
            onChange={(e) => handleKeywordChange(index, e.target.value)}
            placeholder="Enter keyword..."
            className="productadd-keyword-input"
          />
        ))}
      </div>
      <br />
      <div className="productadd-itemfield">
        <p>Description</p>
        <textarea
          className="productadd-description"
          value={productDetails.description}
          onChange={changeHandler}
          name="description"
          placeholder="Type here"
        />
        <p>Category</p>
        <select
          className="productadd-category"
          value={productDetails.category}
          name="category"
          onChange={changeHandler}
          id=""
        >
          <option value="Quần áo">Quần áo</option>
          <option value="Phụ kiện">Phụ kiện</option>
          <option value="Giày dép">Giày dép</option>
          <option value="Đồ chơi">Đồ chơi</option>
          <option value="Đồ điện tử">Đồ điện tử</option>
          <option value="Đồ gia dụng">Đồ gia dụng</option>
          <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
        </select>
      </div>
      <br />
      <div className="productadd-itemfield">
        <label htmlFor="file-input" className="productadd-thumbnail-label">
          <img
            className="productadd-thumbnail-img"
            src={image ? URL.createObjectURL(image) : upload_area}
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

      <button
        onClick={() => {
          props.addProduct({
            image,
            name: productDetails.name,
            priceCents: productDetails.priceCents,
            keywords,
          });
          handleAdded();
        }}
        className="productadd-btn"
      >
        Add Product
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductAdd);
