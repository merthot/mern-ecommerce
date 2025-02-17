import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
        updateFavorites: (state, action) => {
            if (state.userInfo) {
                state.userInfo.favorites = action.payload;
                localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
            }
        },
        logout: (state) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
    },
});

export const { setCredentials, updateFavorites, logout } = authSlice.actions;

export default authSlice.reducer; 