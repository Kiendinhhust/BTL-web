import actionTypes from "../actions/actionTypes";
import axios from "axios";
const initialState = {
  products: [],
};

const productReducer = async (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_PRODUCT:
      let products;
      await axios({
        method: "get",
        url: `${process.env.REACT_APP_BACKEND_URL}/api/products?page=1`,
        responseType: "stream",
      }).then(function (response) {
        console.log(response.data);
        products = response.data.products;
      });
      return {
        ...state,
        products,
      };
    // case actionTypes.ADD_PRODUCT:
    //   const newProducts1 = [
    //     ...state.products,
    //     {
    //       id: crypto.randomUUID(),
    //       image: action.payload.image,
    //       rating: { star: 0, count: 0 },
    //       name: action.payload.name,
    //       priceCents: Number(action.payload.priceCents),
    //       keywords: action.payload.keywords,
    //     },
    //   ];
    //   return {
    //     ...state,
    //     products: newProducts1,
    //   };
    // case actionTypes.REMOVE_PRODUCT:
    //   const newProducts2 = state.products.filter(
    //     (product) => product.id !== action.payload.id
    //   );
    //   return {
    //     ...state,
    //     products: newProducts2,
    //   };
    default:
      return { ...state };
  }
};
export default productReducer;
