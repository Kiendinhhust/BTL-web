import React, { Component, useEffect, useState } from "react";
import { connect } from "react-redux";
import ProductAdmin from "../../components/Product/ProductShop";
import "./ProductManage.scss";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import ProductAdd from "./ProductAdd";
import ItemShop from "./ItemShop";
const ItemManage = (props) => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const query = new URLSearchParams(location.search);
  let title = props.search;
  if (title === null || title === undefined) {
    title = "";
  }
  const shop_id = query.get("shop_id") || "";
  const product_id = query.get("product_id") || "";
  const [modal, setModal] = useState(false);
  //
  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BACKEND_URL}/api/products/item/${product_id}`,
    }).then((response) => {
      setItems(response.data);
    });
  }, [product_id]);
  const renderItemList = () => {
    return items?.map((item) => (
      <ItemShop
        key={item.item_id}
        item={item}
        shop_id={shop_id}
        product_id={product_id}
      />
    ));
  };

  const toggle = () => setModal(!modal);
  return (
    <div className="productmanage-container">
      <button className="productmanage-addproduct" onClick={toggle}>
        Add Item
      </button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Add Item</ModalHeader>
        <ModalBody>
          {/* <ProductAdd toggle={toggle} shop_id={shop_id} /> */}
        </ModalBody>
      </Modal>
      <div className="productmanage-productscontainer">{renderItemList()}</div>
      <hr className="productmanage-dash" />
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

export default connect(mapStateToProps, mapDispatchToProps)(ItemManage);
