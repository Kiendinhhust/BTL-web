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
    <div className="product-add-container">
      <div className="addproduct-itemfield">
        <p>Product name</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
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
      <div className="addproduct-keywords">
        <button className="addproduct-keyword-btn" onClick={addKeyword}>
          Add Keyword
        </button>
        {keywords.map((keyword, index) => (
          <input
            key={index}
            type="text"
            value={keyword}
            onChange={(e) => handleKeywordChange(index, e.target.value)}
            placeholder="Enter keyword..."
            className="addproduct-keyword-input"
          />
        ))}
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input" className="addproduct-thumbnail-label">
          <img
            className="addproduct-thumbnail-img"
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
        className="addproduct-btn"
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
