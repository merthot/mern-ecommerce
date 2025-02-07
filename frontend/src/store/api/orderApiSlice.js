import { apiSlice } from './apiSlice';

export const orderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (order) => ({
                url: '/orders',
                method: 'POST',
                body: order,
            }),
            invalidatesTags: ['Order'],
        }),
        getMyOrders: builder.query({
            query: () => '/orders/myorders',
            providesTags: ['Order'],
        }),
        getOrders: builder.query({
            query: () => ({
                url: '/orders',
                method: 'GET',
            }),
            providesTags: ['Order'],
        }),
        getOrderDetails: builder.query({
            query: (orderId) => `/orders/${orderId}`,
            providesTags: ['Order'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
        }),
        updateOrderPayment: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/pay`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order'],
        }),
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Order'],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrdersQuery,
    useGetOrderDetailsQuery,
    useUpdateOrderStatusMutation,
    useUpdateOrderPaymentMutation,
    useDeleteOrderMutation,
} = orderApiSlice; 