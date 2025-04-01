import actionTypes from "../actions/actionTypes";
import { products } from "../../assets/data/products";
const initialState = {
  products: [],
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_PRODUCT:
      return {
        ...state,
        products,
      };
    case actionTypes.ADD_PRODUCT:
      const newProducts1 = [
        ...state.products,
        {
          id: crypto.randomUUID(),
          image: action.payload.image,
          rating: { star: 0, count: 0 },
          name: action.payload.name,
          priceCents: Number(action.payload.priceCents),
          keywords: action.payload.keywords,
        },
      ];
      return {
        ...state,
        products: newProducts1,
      };
    case actionTypes.REMOVE_PRODUCT:
      const newProducts2 = state.products.filter(
        (product) => product.id !== action.payload.id
      );
      return {
        ...state,
        products: newProducts2,
      };
    default:
      return { ...state };
  }
};
export default productReducer;
