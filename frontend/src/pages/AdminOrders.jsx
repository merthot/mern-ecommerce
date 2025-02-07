import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../store/api/orderApiSlice';
import Loader from '../components/Loader';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AdminOrders = () => {
    const { data: orders, isLoading, error } = useGetOrdersQuery();
    const [updateOrderStatus] = useUpdateOrderStatusMutation();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const statusColors = {
        'Beklemede': 'bg-yellow-100 text-yellow-800',
        'İşleniyor': 'bg-blue-100 text-blue-800',
        'Kargoya Verildi': 'bg-purple-100 text-purple-800',
        'Teslim Edildi': 'bg-green-100 text-green-800',
        'İptal Edildi': 'bg-red-100 text-red-800'
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus({ orderId, status: newStatus }).unwrap();
            toast.success('Sipariş durumu güncellendi');
        } catch (err) {
            toast.error(err?.data?.message || 'Bir hata oluştu');
        }
    };

    const filteredOrders = orders?.filter(order => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = searchTerm === '' ||
            order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (isLoading) return <Loader />;
    if (error) return <div className="text-red-500">Bir hata oluştu: {error.message}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Siparişler</h1>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Müşteri adı veya sipariş ID ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="Beklemede">Beklemede</option>
                        <option value="İşleniyor">İşleniyor</option>
                        <option value="Kargoya Verildi">Kargoya Verildi</option>
                        <option value="Teslim Edildi">Teslim Edildi</option>
                        <option value="İptal Edildi">İptal Edildi</option>
                    </select>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders?.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order._id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.totalPrice.toFixed(2)} ₺
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            >
                                                <option value="Beklemede">Beklemede</option>
                                                <option value="İşleniyor">İşleniyor</option>
                                                <option value="Kargoya Verildi">Kargoya Verildi</option>
                                                <option value="Teslim Edildi">Teslim Edildi</option>
                                                <option value="İptal Edildi">İptal Edildi</option>
                                            </select>
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

export default AdminOrders; 