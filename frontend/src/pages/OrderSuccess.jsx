import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetOrderDetailsQuery } from '../store/api/orderApiSlice';
import { BsCheckCircleFill } from 'react-icons/bs';
import { FaBox, FaTruck, FaCreditCard } from 'react-icons/fa';

const OrderSuccess = () => {
    const { id } = useParams();
    const { data: order, isLoading, error } = useGetOrderDetailsQuery(id);

    useEffect(() => {
        // Sayfa yüklendiğinde en üste scroll
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-medium text-gray-900 mb-4">Bir Hata Oluştu</h1>
                    <p className="text-gray-600 mb-8">{error.data?.message || 'Sipariş detayları yüklenirken bir hata oluştu.'}</p>
                    <Link to="/" className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Başarı Mesajı */}
                <div className="text-center mb-12">
                    <BsCheckCircleFill className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-3xl font-medium text-gray-900 mb-2">Siparişiniz Alındı!</h1>
                    <p className="text-gray-600">Sipariş numaranız: #{order?._id}</p>
                </div>

                {/* Sipariş Durumu */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Sipariş Durumu</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-500">
                                <FaBox className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">Sipariş Alındı</p>
                                <p className="text-sm text-gray-500">Siparişiniz başarıyla oluşturuldu</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Teslimat Bilgileri */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Teslimat Bilgileri</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Teslimat Adresi</h3>
                            <p className="text-sm text-gray-600">{order?.shippingAddress.fullName}</p>
                            <p className="text-sm text-gray-600">{order?.shippingAddress.address}</p>
                            <p className="text-sm text-gray-600">
                                {order?.shippingAddress.city}, {order?.shippingAddress.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">{order?.shippingAddress.country}</p>
                        </div>
                    </div>
                </div>

                {/* Sipariş Detayları */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Sipariş Detayları</h2>

                    {/* Müşteri Bilgileri */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Müşteri Bilgileri</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Ad Soyad:</span> {order?.shippingAddress.fullName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">E-posta:</span> {order?.shippingAddress.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Telefon:</span> {order?.shippingAddress.phone}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Kargo:</span> {
                                        order?.shippingAddress.shippingMethod === 'express'
                                            ? 'Express Kargo (1-3 iş günü)'
                                            : order?.shippingAddress.shippingMethod === 'regular'
                                                ? 'Standart Kargo (3-5 iş günü)'
                                                : 'Ücretsiz Kargo (7-10 iş günü)'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div className="space-y-4">
                        {order?.orderItems.map((item) => (
                            <div key={item._id} className="flex items-center">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-20 w-20 object-cover rounded"
                                />
                                <div className="ml-6 flex-1">
                                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Beden: {item.size} | Adet: {item.qty}
                                    </p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {item.price.toLocaleString('tr-TR')} TL
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Ödeme Özeti */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ara Toplam</span>
                                <span className="text-gray-900">{order?.itemsPrice.toLocaleString('tr-TR')} TL</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Kargo</span>
                                <span className="text-gray-900">
                                    {order?.shippingPrice === 0 ? 'Ücretsiz' : `${order?.shippingPrice.toLocaleString('tr-TR')} TL`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-medium pt-4 border-t border-gray-200">
                                <span className="text-gray-900">Toplam</span>
                                <span className="text-gray-900">{order?.totalPrice.toLocaleString('tr-TR')} TL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ödeme Bilgileri */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Ödeme Bilgileri</h2>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
                            <FaCreditCard className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{order?.paymentMethod}</p>
                            <p className="text-sm text-gray-500">Ödeme başarıyla tamamlandı</p>
                        </div>
                    </div>
                </div>

                {/* Alışverişe Devam Et */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-block bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Alışverişe Devam Et
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess; 