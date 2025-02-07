import { useState, useEffect } from 'react';
import { useGetProductsQuery, useUpdateProductMutation } from '../../store/api/productApiSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Discounts = () => {
    const { data, isLoading, refetch } = useGetProductsQuery({});
    const [updateProduct] = useUpdateProductMutation();

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [discountType, setDiscountType] = useState('percentage');
    const [discountAmount, setDiscountAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const products = data?.products || [];

    const handleProductSelect = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleSelectAll = () => {
        if (products.length > 0) {
            if (selectedProducts.length === products.length) {
                setSelectedProducts([]);
            } else {
                setSelectedProducts(products.map(product => product._id));
            }
        }
    };

    const calculateDiscountedPrice = (product) => {
        if (!product.discount?.isActive) return product.price;

        if (product.discount.type === 'percentage') {
            return product.price * (1 - product.discount.amount / 100);
        }
        return Math.max(product.price - product.discount.amount, 0);
    };

    const isDiscountActive = (product) => {
        if (!product.discount?.isActive) return false;
        const now = new Date();
        const startDate = new Date(product.discount.startDate);
        const endDate = new Date(product.discount.endDate);
        return now >= startDate && now <= endDate;
    };

    const handleApplyDiscount = async () => {
        if (!selectedProducts.length) {
            toast.error('Lütfen en az bir ürün seçin');
            return;
        }

        if (!discountAmount || !startDate || !endDate) {
            toast.error('Lütfen tüm indirim bilgilerini doldurun');
            return;
        }

        try {
            const updatePromises = selectedProducts.map(async (productId) => {
                if (!productId) {
                    console.error('Geçersiz ürün ID\'si:', productId);
                    return null;
                }

                const currentProduct = products.find(p => p._id === productId);
                if (!currentProduct) {
                    console.error('Ürün bulunamadı:', productId);
                    return null;
                }

                const discountData = {
                    type: discountType,
                    amount: Number(discountAmount),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: true
                };

                const updatedProduct = {
                    ...currentProduct,
                    discount: discountData,
                    discountedPrice: calculateDiscountedPrice({
                        ...currentProduct,
                        discount: discountData
                    })
                };

                delete updatedProduct._id;
                delete updatedProduct.__v;
                delete updatedProduct.createdAt;
                delete updatedProduct.updatedAt;

                return updateProduct({
                    _id: productId,
                    ...updatedProduct
                }).unwrap();
            });

            await Promise.all(updatePromises.filter(Boolean));
            await refetch();

            toast.success('İndirimler başarıyla uygulandı');
            setSelectedProducts([]);
            setDiscountAmount('');
            setStartDate('');
            setEndDate('');
        } catch (error) {
            console.error('İndirim uygulama hatası:', error);
            toast.error(error?.data?.message || 'Bir hata oluştu');
        }
    };

    const handleRemoveDiscount = async (productId) => {
        if (!productId) {
            toast.error('Geçersiz ürün ID\'si');
            return;
        }

        try {
            const currentProduct = products.find(p => p._id === productId);
            if (!currentProduct) {
                toast.error('Ürün bulunamadı');
                return;
            }

            await updateProduct({
                _id: productId,
                name: currentProduct.name,
                price: currentProduct.price,
                description: currentProduct.description,
                images: currentProduct.images,
                brand: currentProduct.brand,
                category: currentProduct.category,
                sizes: currentProduct.sizes,
                sizeStock: currentProduct.sizeStock,
                color: currentProduct.color,
                fabric: currentProduct.fabric,
                productDetails: currentProduct.productDetails,
                modelMeasurements: currentProduct.modelMeasurements,
                careInstructions: currentProduct.careInstructions,
                discount: {
                    type: 'percentage',
                    amount: 0,
                    startDate: null,
                    endDate: null,
                    isActive: false
                }
            }).unwrap();

            toast.success('İndirim başarıyla kaldırıldı');
            refetch();
        } catch (error) {
            console.error('İndirim kaldırma hatası:', error);
            toast.error(error?.data?.message || 'Bir hata oluştu');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">İndirim Yönetimi</h1>

            {/* İndirim Ekleme Formu */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-lg font-medium mb-4">Toplu İndirim Uygula</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            İndirim Tipi
                        </label>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="percentage">Yüzde (%)</option>
                            <option value="fixed">Sabit Tutar (TL)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            İndirim Miktarı
                        </label>
                        <input
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder={discountType === 'percentage' ? '% olarak girin' : 'TL olarak girin'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Başlangıç Tarihi
                        </label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bitiş Tarihi
                        </label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleApplyDiscount}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    >
                        Seçili Ürünlere İndirimi Uygula
                    </button>
                </div>
            </div>

            {/* Ürün Listesi */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={products.length > 0 && selectedProducts.length === products.length}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ürün
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Normal Fiyat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İndirim
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İndirimli Fiyat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Geçerlilik
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => handleProductSelect(product._id)}
                                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-10 w-10 object-cover rounded"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {product.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {product.price.toLocaleString('tr-TR')} TL
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isDiscountActive(product) ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {product.discount.type === 'percentage'
                                                    ? `%${product.discount.amount}`
                                                    : `${product.discount.amount} TL`}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isDiscountActive(product) ? (
                                            <div className="text-sm text-gray-900">
                                                {calculateDiscountedPrice(product).toLocaleString('tr-TR')} TL
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isDiscountActive(product) ? (
                                            <div className="text-sm text-gray-500">
                                                {format(new Date(product.discount.startDate), 'd MMM HH:mm', { locale: tr })} -{' '}
                                                {format(new Date(product.discount.endDate), 'd MMM HH:mm', { locale: tr })}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isDiscountActive(product) && (
                                            <button
                                                onClick={() => handleRemoveDiscount(product._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                İndirimi Kaldır
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Discounts; 