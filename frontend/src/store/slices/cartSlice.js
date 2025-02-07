import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems'))
        : [],
    shippingAddress: localStorage.getItem('shippingAddress')
        ? JSON.parse(localStorage.getItem('shippingAddress'))
        : {},
    paymentMethod: localStorage.getItem('paymentMethod')
        ? JSON.parse(localStorage.getItem('paymentMethod'))
        : {},
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find(
                (x) => x._id === item._id && x.size === item.size
            );

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id && x.size === existItem.size ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }

            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action) => {
            const { _id, selectedSize } = action.payload;
            state.cartItems = state.cartItems.filter(
                (x) => !(x._id === _id && x.selectedSize === selectedSize)
            );
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        saveShippingAddress: (state, action) => {
            state.shippingAddress = {
                fullName: action.payload.fullName,
                email: action.payload.email,
                phone: action.payload.phone,
                address: action.payload.address,
                city: action.payload.city,
                postalCode: action.payload.postalCode,
                country: action.payload.country,
                shippingMethod: action.payload.shippingMethod
            };
            localStorage.setItem('cart', JSON.stringify(state));
        },
        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
            localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
        },
        resetCart: (state) => {
            state.cartItems = [];
            state.shippingAddress = {};
            state.paymentMethod = '';
            localStorage.removeItem('cartItems');
            localStorage.removeItem('shippingAddress');
            localStorage.removeItem('paymentMethod');
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    saveShippingAddress,
    savePaymentMethod,
    resetCart,
} = cartSlice.actions;

export default cartSlice.reducer; 