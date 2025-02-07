import { apiSlice } from './apiSlice';

export const productApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => ({
                url: 'products',
                credentials: 'include'
            }),
            keepUnusedDataFor: 5,
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map(({ _id }) => ({ type: 'Product', id: _id })),
                        { type: 'Product', id: 'LIST' },
                        'Favorites'
                    ]
                    : [{ type: 'Product', id: 'LIST' }, 'Favorites']
        }),
        getProductDetails: builder.query({
            query: (productId) => ({
                url: `products/${productId}`,
                credentials: 'include'
            }),
            providesTags: ['Product'],
        }),
        createProduct: builder.mutation({
            query: (data) => ({
                url: '/products',
                method: 'POST',
                body: {
                    name: data.name,
                    price: Number(data.price),
                    description: data.description,
                    images: data.images,
                    brand: data.brand,
                    category: data.category,
                    sizes: data.sizes,
                    sizeStock: data.sizeStock,
                    color: data.color,
                    fabric: data.fabric,
                    productDetails: data.productDetails,
                    modelMeasurements: data.modelMeasurements,
                    careInstructions: data.careInstructions,
                },
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation({
            query: (data) => ({
                url: `/products/${data._id}`,
                method: 'PUT',
                body: {
                    name: data.name,
                    price: Number(data.price),
                    description: data.description,
                    images: data.images,
                    brand: data.brand,
                    category: data.category,
                    sizes: data.sizes,
                    sizeStock: data.sizeStock,
                    color: data.color,
                    fabric: data.fabric,
                    productDetails: data.productDetails,
                    modelMeasurements: data.modelMeasurements,
                    careInstructions: data.careInstructions,
                    discount: data.discount
                },
                credentials: 'include'
            }),
            invalidatesTags: ['Product'],
        }),
        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `products/${productId}`,
                method: 'DELETE',
                credentials: 'include'
            }),
            invalidatesTags: ['Product'],
        }),
        uploadProductImage: builder.mutation({
            query: (data) => ({
                url: 'products/upload',
                method: 'POST',
                body: data,
                credentials: 'include'
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductDetailsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUploadProductImageMutation,
} = productApiSlice; 