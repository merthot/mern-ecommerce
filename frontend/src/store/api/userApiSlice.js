import { apiSlice } from './apiSlice';
import { updateFavorites } from '../slices/authSlice';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: 'users/login',
                method: 'POST',
                body: data,
                credentials: 'include'
            }),
        }),
        register: builder.mutation({
            query: (data) => ({
                url: 'users/register',
                method: 'POST',
                body: data,
                credentials: 'include'
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'users/logout',
                method: 'POST',
                credentials: 'include'
            }),
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: 'users/profile',
                method: 'PUT',
                body: data,
                credentials: 'include'
            }),
        }),
        getFavorites: builder.query({
            query: () => ({
                url: 'users/favorites',
                credentials: 'include'
            }),
            providesTags: ['Favorites', 'Product'],
        }),
        toggleFavorite: builder.mutation({
            query: (productId) => ({
                url: `/users/favorites/${productId}`,
                method: 'POST',
                credentials: 'include'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateFavorites(data.favorites));
                } catch (error) {
                    console.error('Favori güncelleme hatası:', error);
                }
            },
            invalidatesTags: ['Favorites', 'Product']
        }),
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: 'users/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation({
            query: (data) => ({
                url: `users/reset-password/${data.token}`,
                method: 'POST',
                body: { password: data.password },
            }),
        }),
        getAddresses: builder.query({
            query: () => ({
                url: 'users/addresses',
                credentials: 'include'
            }),
            providesTags: ['Addresses']
        }),
        addAddress: builder.mutation({
            query: (data) => ({
                url: 'users/addresses',
                method: 'POST',
                body: data,
                credentials: 'include'
            }),
            invalidatesTags: ['Addresses']
        }),
        updateAddress: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `users/addresses/${id}`,
                method: 'PUT',
                body: data,
                credentials: 'include'
            }),
            invalidatesTags: ['Addresses']
        }),
        deleteAddress: builder.mutation({
            query: (id) => ({
                url: `users/addresses/${id}`,
                method: 'DELETE',
                credentials: 'include'
            }),
            invalidatesTags: ['Addresses']
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUpdateProfileMutation,
    useGetFavoritesQuery,
    useToggleFavoriteMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetAddressesQuery,
    useAddAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} = userApiSlice; 