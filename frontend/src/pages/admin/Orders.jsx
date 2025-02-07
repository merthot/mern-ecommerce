import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../../store/api/orderApiSlice';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import { useDeleteOrderMutation } from '../../store/api/orderApiSlice';

const Orders = () => {
    const [expandedOrder, setExpandedOrder] = useState(null);
    const { data: orders, isLoading, refetch } = useGetOrdersQuery();
    const [updateOrderStatus] = useUpdateOrderStatusMutation();
    const [deleteOrder] = useDeleteOrderMutation();

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
            toast.success('Sipariş durumu güncellendi');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Sipariş durumu güncellenirken bir hata oluştu');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
            try {
                await deleteOrder(orderId).unwrap();
                toast.success('Sipariş başarıyla silindi');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || 'Sipariş silinirken bir hata oluştu');
            }
        }
    };

    const statusColors = {
        'Beklemede': 'bg-yellow-100 text-yellow-800',
        'İşleniyor': 'bg-blue-100 text-blue-800',
        'Kargoya Verildi': 'bg-purple-100 text-purple-800',
        'Teslim Edildi': 'bg-green-100 text-green-800',
        'İptal Edildi': 'bg-red-100 text-red-800'
    };

    if (isLoading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Siparişler</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {orders?.map((order) => (
                    <div key={order._id} className="border-b border-gray-200 last:border-b-0">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleOrderExpand(order._id)}
                        >
                            <div className="flex items-center space-x-4">
                                <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    {format(new Date(order.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteOrder(order._id);
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                                {expandedOrder === order._id ? (
                                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                        </div>

                        {/* Genişletilmiş Sipariş Detayları */}
                        {expandedOrder === order._id && (
                            <div className="border-t border-gray-200 p-4">
                                {/* Müşteri Bilgileri */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-3">Müşteri Bilgileri</h3>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600">Ad Soyad</p>
                                            <p className="font-medium">{order.user?.name || order.shippingAddress?.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">E-posta</p>
                                            <p className="font-medium">{order.user?.email || order.shippingAddress?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Telefon</p>
                                            <p className="font-medium">{order.shippingAddress?.phone || "Belirtilmemiş"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                                            <p className="font-medium">
                                                {format(new Date(order.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Teslimat Adresi */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-3">Teslimat Adresi</h3>
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-600">Adres</p>
                                            <p className="font-medium">{order.shippingAddress.address}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">İl</p>
                                                <p className="font-medium">{order.shippingAddress.city}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Posta Kodu</p>
                                                <p className="font-medium">{order.shippingAddress.postalCode}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Ülke</p>
                                            <p className="font-medium">{order.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sipariş Ürünleri */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-3">Sipariş Detayı</h3>
                                    <div className="space-y-4">
                                        {order.orderItems.map((item) => (
                                            <div key={item._id} className="flex items-center border-b border-gray-100 pb-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-20 w-20 object-cover rounded-lg"
                                                />
                                                <div className="ml-4 flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <div className="mt-1 text-sm text-gray-600 grid grid-cols-2 gap-2">
                                                        <p>Beden: {item.size}</p>
                                                        <p>Renk: {item.color}</p>
                                                        <p>Adet: {item.qty}</p>
                                                        <p>Birim Fiyat: {item.price.toLocaleString('tr-TR')} TL</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{(item.price * item.qty).toLocaleString('tr-TR')} TL</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fiyat Özeti */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-3">Ödeme Bilgileri</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ara Toplam</span>
                                            <span>{order.itemsPrice.toLocaleString('tr-TR')} TL</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Kargo</span>
                                            <span>{order.shippingPrice.toLocaleString('tr-TR')} TL</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg pt-2 border-t">
                                            <span>Toplam</span>
                                            <span>{order.totalPrice.toLocaleString('tr-TR')} TL</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sipariş Durumu Güncelleme */}
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Sipariş Durumu</h3>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Beklemede">Beklemede</option>
                                        <option value="İşleniyor">İşleniyor</option>
                                        <option value="Kargoya Verildi">Kargoya Verildi</option>
                                        <option value="Teslim Edildi">Teslim Edildi</option>
                                        <option value="İptal Edildi">İptal Edildi</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders; 