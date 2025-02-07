import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { savePaymentMethod, resetCart } from '../store/slices/cartSlice';
import { useCreateOrderMutation } from '../store/api/orderApiSlice';
import { toast } from 'react-toastify';

const Payment = () => {
    const cart = useSelector((state) => state.cart);
    const { cartItems, shippingAddress } = cart;

    const [createOrder] = useCreateOrderMutation();
    const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [useDifferentBillingAddress, setUseDifferentBillingAddress] = useState(false);
    const [billingAddress, setBillingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Türkiye'
    });

    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Hesaplamalar
    const itemsPrice = cartItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.qty || 1),
        0
    );
    const shippingPrice = shippingAddress?.shippingMethod === 'express' ? 22.50 :
        shippingAddress?.shippingMethod === 'regular' ? 7.50 : 0;
    const totalPrice = itemsPrice + shippingPrice;

    const handleBillingChange = (e) => {
        setBillingAddress({
            ...billingAddress,
            [e.target.name]: e.target.value
        });
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    };

    // Form validasyonu
    const validateForm = () => {
        const newErrors = {};

        // Kart numarası kontrolü
        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
            newErrors.cardNumber = 'Geçerli bir kart numarası giriniz';
        }

        // Kart üzerindeki isim kontrolü
        if (!cardName || cardName.trim().length < 3) {
            newErrors.cardName = 'Kart üzerindeki ismi giriniz';
        }

        // Son kullanma tarihi kontrolü
        if (!expiryDate || !expiryDate.includes('/') || expiryDate.length !== 5) {
            newErrors.expiryDate = 'Geçerli bir son kullanma tarihi giriniz';
        } else {
            const [month, year] = expiryDate.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;

            if (parseInt(month) < 1 || parseInt(month) > 12) {
                newErrors.expiryDate = 'Geçerli bir ay giriniz (01-12)';
            } else if (parseInt(year) < currentYear ||
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                newErrors.expiryDate = 'Kartınızın süresi dolmuş';
            }
        }

        // CVV kontrolü
        if (!cvv || cvv.length !== 3) {
            newErrors.cvv = 'Geçerli bir CVV giriniz';
        }

        // Farklı fatura adresi seçilmişse kontrol et
        if (useDifferentBillingAddress) {
            if (!billingAddress.fullName.trim()) {
                newErrors.billingFullName = 'Ad Soyad alanı zorunludur';
            }
            if (!billingAddress.address.trim()) {
                newErrors.billingAddress = 'Adres alanı zorunludur';
            }
            if (!billingAddress.city.trim()) {
                newErrors.billingCity = 'Şehir alanı zorunludur';
            }
            if (!billingAddress.postalCode.trim()) {
                newErrors.billingPostalCode = 'Posta kodu alanı zorunludur';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Lütfen tüm alanları doğru şekilde doldurunuz');
            return;
        }

        try {
            // Ödeme bilgilerini kaydet
            dispatch(savePaymentMethod({
                method: paymentMethod,
                details: {
                    cardNumber,
                    cardName,
                    expiryDate,
                    cvv,
                    billingAddress: useDifferentBillingAddress ? billingAddress : shippingAddress
                }
            }));

            // Hesaplamalar
            const itemsPrice = cartItems.reduce(
                (acc, item) => acc + (item.price || 0) * (item.qty || 1),
                0
            );
            const shippingPrice = shippingAddress?.shippingMethod === 'express' ? 22.50 :
                shippingAddress?.shippingMethod === 'regular' ? 7.50 : 0;
            const totalPrice = itemsPrice + shippingPrice;

            // Sipariş oluştur
            const order = await createOrder({
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty || 1,
                    image: item.images[0],
                    price: item.price,
                    size: item.selectedSize,
                    color: item.selectedColor,
                    product: item._id
                })),
                shippingAddress: {
                    fullName: shippingAddress.fullName,
                    email: shippingAddress.email,
                    phone: shippingAddress.phone,
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country || 'Türkiye',
                    shippingMethod: shippingAddress.shippingMethod
                },
                paymentMethod: 'Kredi Kartı',
                itemsPrice: Number(itemsPrice),
                shippingPrice: Number(shippingPrice),
                totalPrice: Number(totalPrice)
            }).unwrap();

            // Sepeti sıfırla
            dispatch(resetCart());

            toast.success('Siparişiniz başarıyla oluşturuldu');

            // Order Success sayfasına yönlendir
            navigate(`/order-success/${order._id}`, { replace: true });
        } catch (error) {
            toast.error(error?.data?.message || 'Sipariş oluşturulurken bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm mb-8">
                    <Link to="/cart" className="text-gray-500">Sepet</Link>
                    <span className="text-gray-400">›</span>
                    <Link to="/shipping" className="text-gray-500">Teslimat</Link>
                    <span className="text-gray-400">›</span>
                    <span className="font-medium text-gray-900">Ödeme</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sol Taraf - Ödeme Formu */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Ödeme Yöntemi Seçimi */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Ödeme Yöntemi</h2>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900">Kredi/Banka Kartı</span>
                                                <span className="block text-sm text-gray-500">Güvenli ödeme</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <img src="/visa.png" alt="Visa" className="h-8" />
                                                <img src="/mastercard.png" alt="Mastercard" className="h-8" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kredi Kartı Bilgileri */}
                            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Kart Bilgileri</h2>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kart Numarası *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            maxLength="19"
                                            className={`w-full border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                            placeholder="1234 5678 9012 3456"
                                        />
                                        {errors.cardNumber && (
                                            <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kart Üzerindeki İsim *
                                    </label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                        className={`w-full border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black uppercase`}
                                        placeholder="AD SOYAD"
                                    />
                                    {errors.cardName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Son Kullanma Tarihi *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                                maxLength="5"
                                                className={`w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                placeholder="MM/YY"
                                            />
                                            {errors.expiryDate && (
                                                <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CVV *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                                maxLength="3"
                                                className={`w-full border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                placeholder="123"
                                            />
                                            {errors.cvv && (
                                                <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fatura Adresi */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Fatura Adresi</h2>
                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={!useDifferentBillingAddress}
                                            onChange={() => setUseDifferentBillingAddress(!useDifferentBillingAddress)}
                                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-900">Teslimat adresi ile aynı</span>
                                    </label>

                                    {useDifferentBillingAddress && (
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ad Soyad *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={billingAddress.fullName}
                                                    onChange={handleBillingChange}
                                                    className={`w-full border ${errors.billingFullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                />
                                                {errors.billingFullName && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.billingFullName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Adres *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={billingAddress.address}
                                                    onChange={handleBillingChange}
                                                    className={`w-full border ${errors.billingAddress ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                />
                                                {errors.billingAddress && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.billingAddress}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Şehir *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={billingAddress.city}
                                                        onChange={handleBillingChange}
                                                        className={`w-full border ${errors.billingCity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                    />
                                                    {errors.billingCity && (
                                                        <p className="mt-1 text-sm text-red-500">{errors.billingCity}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Posta Kodu *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        value={billingAddress.postalCode}
                                                        onChange={handleBillingChange}
                                                        maxLength="5"
                                                        className={`w-full border ${errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                    />
                                                    {errors.billingPostalCode && (
                                                        <p className="mt-1 text-sm text-red-500">{errors.billingPostalCode}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sağ Taraf - Sipariş Özeti */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Özeti</h2>

                            {/* Ürünler */}
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item._id + item.selectedSize} className="flex items-center">
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="h-16 w-16 object-cover rounded"
                                        />
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Beden: {item.selectedSize} | Adet: {item.qty || 1}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.price.toLocaleString('tr-TR')} TL
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* İndirim Kodu */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    İndirim Kodu
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                                        placeholder="İndirim kodunuzu girin"
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                    >
                                        Uygula
                                    </button>
                                </div>
                            </div>

                            {/* Fiyat Detayları */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Ara Toplam</span>
                                    <span className="text-gray-900">{itemsPrice.toLocaleString('tr-TR')} TL</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Kargo</span>
                                    <span className="text-gray-900">
                                        {shippingPrice === 0 ? 'Ücretsiz' : `${shippingPrice.toLocaleString('tr-TR')} TL`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                                    <span className="text-gray-900">Toplam</span>
                                    <span className="text-gray-900">{totalPrice.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="mt-6 w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Siparişi Tamamla
                            </button>

                            <p className="mt-4 text-xs text-gray-500 text-center">
                                Siparişi tamamlayarak{' '}
                                <a href="#" className="text-black hover:underline">kullanım koşullarını</a>
                                {' '}kabul etmiş olursunuz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment; 