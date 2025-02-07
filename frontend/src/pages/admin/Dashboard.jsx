import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../store/api/productApiSlice';
import { useGetOrdersQuery } from '../../store/api/orderApiSlice';
import Loader from '../../components/Loader';

const Dashboard = () => {
    const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery();
    const { data: ordersData, isLoading: isLoadingOrders } = useGetOrdersQuery();
    const [timeRange, setTimeRange] = useState('today'); // today, week, month

    const products = productsData?.products || [];
    const orders = ordersData || [];

    // İstatistikleri hesapla
    const calculateStats = () => {
        if (!orders.length) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0 };

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const now = new Date();

            switch (timeRange) {
                case 'today':
                    return orderDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    return orderDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    return orderDate >= monthAgo;
                default:
                    return true;
            }
        });

        const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalOrders = filteredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        return { totalSales, totalOrders, avgOrderValue };
    };

    const stats = calculateStats();

    if (isLoadingProducts || isLoadingOrders) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Başlık */}
                <div className="mb-8">
                    <h1 className="text-2xl font-medium text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Mağazanızın genel durumunu kontrol edin</p>
                </div>

                {/* Zaman Aralığı Seçimi */}
                <div className="mb-6">
                    <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
                        {['today', 'week', 'month'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${timeRange === range
                                    ? 'bg-black text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {range === 'today' ? 'Bugün' : range === 'week' ? 'Bu Hafta' : 'Bu Ay'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Toplam Satış</h3>
                            <span className="p-2 bg-green-100 text-green-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalSales.toLocaleString('tr-TR')} TL</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Sipariş Sayısı</h3>
                            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Ortalama Sipariş Değeri</h3>
                            <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{stats.avgOrderValue.toLocaleString('tr-TR')} TL</p>
                    </div>
                </div>

                {/* Hızlı Erişim Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/admin/products/new"
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="font-medium text-gray-900">Yeni Ürün Ekle</h3>
                                <p className="text-sm text-gray-500">Yeni bir ürün oluşturun</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/products"
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="font-medium text-gray-900">Ürünleri Yönet</h3>
                                <p className="text-sm text-gray-500">Toplam {products.length} ürün</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="font-medium text-gray-900">Siparişleri Yönet</h3>
                                <p className="text-sm text-gray-500">Son {orders.length} sipariş</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Son Siparişler */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Son Siparişler</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sipariş ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Müşteri
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tutar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durum
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order._id.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.user?.name || 'Misafir'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.totalPrice.toLocaleString('tr-TR')} TL
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Teslim Edildi'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'Kargoya Verildi'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : order.status === 'İşleniyor'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : order.status === 'İptal Edildi'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status || 'Beklemede'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 