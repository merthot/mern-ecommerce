import { useParams } from 'react-router-dom';
import { useGetOrderDetailsQuery } from '../store/api/orderApiSlice';
import Loader from '../components/Loader';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FaBox, FaTruck, FaCreditCard } from 'react-icons/fa';

const OrderDetails = () => {
    const { id } = useParams();
    const { data: order, isLoading, error } = useGetOrderDetailsQuery(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Sipariş detayları yüklenirken bir hata oluştu.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Beklemede':
                return 'bg-yellow-100 text-yellow-800';
            case 'İşleniyor':
                return 'bg-blue-100 text-blue-800';
            case 'Kargoya Verildi':
                return 'bg-purple-100 text-purple-800';
            case 'Teslim Edildi':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Sipariş Başlığı */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-medium text-gray-900">
                                Sipariş Detayları
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Sipariş No: #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                                {format(new Date(order.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Sipariş Durumu */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Sipariş Durumu</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${order.status === 'Beklemede' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-500'}`}>
                                <FaBox className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">Sipariş Alındı</p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(order.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Müşteri ve Teslimat Bilgileri */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Teslimat Bilgileri</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Teslimat Adresi</h3>
                            <p className="text-sm text-gray-600">{order.shippingAddress.fullName}</p>
                            <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-sm text-gray-600">
                                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">İletişim Bilgileri</h3>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">E-posta:</span> {order.shippingAddress.email}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Telefon:</span> {order.shippingAddress.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sipariş Detayları */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Sipariş Özeti</h2>
                    <div className="space-y-4">
                        {order.orderItems.map((item) => (
                            <div key={item._id} className="flex items-center">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <div className="ml-6 flex flex-1 flex-col">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">{item.price.toLocaleString('tr-TR')} TL</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Beden: {item.size} | Adet: {item.qty}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Ödeme Özeti */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ara Toplam</span>
                                <span className="text-gray-900">{order.itemsPrice.toLocaleString('tr-TR')} TL</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Kargo</span>
                                <span className="text-gray-900">
                                    {order.shippingPrice === 0 ? 'Ücretsiz' : `${order.shippingPrice.toLocaleString('tr-TR')} TL`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-medium pt-4 border-t border-gray-200">
                                <span className="text-gray-900">Toplam</span>
                                <span className="text-gray-900">{order.totalPrice.toLocaleString('tr-TR')} TL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ödeme Bilgileri */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Ödeme Bilgileri</h2>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
                            <FaCreditCard className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{order.paymentMethod}</p>
                            <p className="text-sm text-gray-500">Ödeme başarıyla tamamlandı</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails; 