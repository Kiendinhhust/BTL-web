import actionTypes from '../actions/actionTypes';

const initialState = {
    addresses: [],
    isLoading: false,
    error: null, 
};

const userAddressReducer = (state = initialState, action) => {
    switch (action.type) {
    // Các case cho địa chỉ
    case actionTypes.FETCH_USER_ADDRESSES_SUCCESS:
        return {
            ...state,
            addresses: action.payload,
        };
    case actionTypes.FETCH_USER_ADDRESSES_FAILURE:
        return {
            ...state,
            error: action.payload,
        };
    case actionTypes.ADD_USER_ADDRESS_SUCCESS:
        return {
            ...state,
            addresses: [...state.addresses, action.payload],
        };
    case actionTypes.UPDATE_USER_ADDRESS_SUCCESS:
        return {
            ...state,
            addresses: state.addresses.map(address => 
                address.address_id === action.payload.address_id 
                    ? action.payload 
                    : address
            ),
        };
    case actionTypes.DELETE_USER_ADDRESS_SUCCESS:
        return {
            ...state,
            addresses: state.addresses.filter(address => 
                address.address_id !== action.payload
            ),
        };
    case actionTypes.SET_DEFAULT_ADDRESS_SUCCESS:
        // Đưa địa chỉ mặc định lên đầu mảng
        const addressId = action.payload;
        const defaultAddress = state.addresses.find(
            address => address.address_id === addressId
        );
        
        if (defaultAddress) {
            const otherAddresses = state.addresses.filter(
                address => address.address_id !== addressId
            );
            
            return {
                ...state,
                addresses: [defaultAddress, ...otherAddresses],
            };
        }
        return state;
        
    default:
        return state;
}
};
export default userAddressReducer;