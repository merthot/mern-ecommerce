import { apiSlice } from './apiSlice';

export const addressApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
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
    useGetAddressesQuery,
    useAddAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} = addressApiSlice; 