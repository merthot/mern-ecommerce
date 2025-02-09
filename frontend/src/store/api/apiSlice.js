import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 401) {
        api.dispatch({ type: 'auth/logout' });
    }

    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Product', 'Order', 'User', 'Favorites', 'Addresses'],
    endpoints: () => ({}),
}); 
