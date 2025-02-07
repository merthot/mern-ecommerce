import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { saveShippingAddress } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import { useGetAddressesQuery } from '../store/api/userApiSlice';

const Shipping = () => {
    const cart = useSelector((state) => state.cart);
    const { cartItems, shippingAddress } = cart;

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(true);

    const [formData, setFormData] = useState({
        fullName: shippingAddress?.fullName || '',
        address: shippingAddress?.address || '',
        city: shippingAddress?.city || '',
        postalCode: shippingAddress?.postalCode || '',
        country: 'Türkiye',
        email: shippingAddress?.email || '',
        phone: shippingAddress?.phone || '',
        shippingMethod: shippingAddress?.shippingMethod || 'free'
    });

    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: addresses } = useGetAddressesQuery();
    const savedAddressesData = addresses?.addresses || [];

    useEffect(() => {
        // Varsayılan adresi seç
        const defaultAddress = savedAddressesData.find(addr => addr.isDefault);
        if (defaultAddress && !shippingAddress?.address) {
            setSelectedAddressId(defaultAddress.id);
            setFormData({
                fullName: defaultAddress.fullName,
                address: defaultAddress.address,
                city: defaultAddress.city,
                postalCode: defaultAddress.postalCode,
                country: defaultAddress.country,
                email: defaultAddress.email || '',
                phone: defaultAddress.phone,
                shippingMethod: 'free'
            });
            setShowNewAddressForm(false);
        }
    }, [savedAddressesData]);

    const handleAddressSelect = (addressId) => {
        const selectedAddress = savedAddressesData.find(addr => addr.id === addressId);
        if (selectedAddress) {
            setSelectedAddressId(addressId);
            setFormData({
                fullName: selectedAddress.fullName,
                address: selectedAddress.address,
                city: selectedAddress.city,
                postalCode: selectedAddress.postalCode,
                country: selectedAddress.country,
                email: selectedAddress.email || '',
                phone: selectedAddress.phone,
                shippingMethod: formData.shippingMethod
            });
            setShowNewAddressForm(false);
        }
    };

    // Hesaplamalar
    const itemsPrice = cartItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.qty || 1),
        0
    );
    const shippingPrice = formData.shippingMethod === 'express' ? 22.50 : formData.shippingMethod === 'regular' ? 7.50 : 0;
    const totalPrice = itemsPrice + shippingPrice;

    const validateForm = () => {
        const newErrors = {};

        // Ad Soyad kontrolü
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Ad Soyad alanı zorunludur';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Ad Soyad en az 3 karakter olmalıdır';
        }

        // E-posta kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta alanı zorunludur';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        // Telefon kontrolü
        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefon alanı zorunludur';
        } else if (formData.phone.trim().length < 10) {
            newErrors.phone = 'Geçerli bir telefon numarası giriniz';
        }

        // Adres kontrolü
        if (!formData.address.trim()) {
            newErrors.address = 'Adres alanı zorunludur';
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Adres daha detaylı olmalıdır';
        }

        // Şehir kontrolü
        if (!formData.city.trim()) {
            newErrors.city = 'Şehir alanı zorunludur';
        }

        // Posta kodu kontrolü
        if (!formData.postalCode.trim()) {
            newErrors.postalCode = 'Posta kodu alanı zorunludur';
        } else if (formData.postalCode.trim().length !== 5) {
            newErrors.postalCode = 'Geçerli bir posta kodu giriniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (validateForm()) {
            dispatch(saveShippingAddress(formData));
            navigate('/payment');
        } else {
            toast.error('Lütfen tüm alanları doğru şekilde doldurunuz');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm mb-8">
                    <Link to="/cart" className="text-gray-500">Sepet</Link>
                    <span className="text-gray-400">›</span>
                    <span className="font-medium text-gray-900">Teslimat</span>
                    <span className="text-gray-400">›</span>
                    <span className="text-gray-500">Ödeme</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sol Taraf - Form */}
                    <div className="lg:col-span-8">
                        <form onSubmit={submitHandler} className="space-y-8">
                            {/* Kayıtlı Adresler */}
                            {savedAddressesData.length > 0 && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Kayıtlı Adresler</h2>
                                    <div className="space-y-4">
                                        {savedAddressesData.map((address) => (
                                            <label
                                                key={address.id}
                                                className={`block relative border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddressId === address.id
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="savedAddress"
                                                    value={address.id}
                                                    checked={selectedAddressId === address.id}
                                                    onChange={() => handleAddressSelect(address.id)}
                                                    className="sr-only"
                                                />
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-gray-900">{address.title}</p>
                                                            {address.isDefault && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    Varsayılan
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">{address.fullName}</p>
                                                        <p className="text-sm text-gray-500">{address.phone}</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {address.address}, {address.city} {address.postalCode}
                                                        </p>
                                                    </div>
                                                    {selectedAddressId === address.id && (
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black">
                                                            <span className="h-2.5 w-2.5 rounded-full bg-white"></span>
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewAddressForm(true);
                                                setSelectedAddressId(null);
                                                setFormData({
                                                    fullName: '',
                                                    address: '',
                                                    city: '',
                                                    postalCode: '',
                                                    country: 'Türkiye',
                                                    email: '',
                                                    phone: '',
                                                    shippingMethod: 'free'
                                                });
                                            }}
                                            className="w-full py-3 px-4 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            + Yeni Adres Ekle
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Yeni Adres Formu */}
                            {showNewAddressForm && (
                                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Teslimat Bilgileri</h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ad Soyad *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                            placeholder="Adınızı ve soyadınızı girin"
                                        />
                                        {errors.fullName && (
                                            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            E-posta *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                            placeholder="E-posta adresinizi girin"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                            placeholder="Telefon numaranızı girin"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Adres *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                            placeholder="Sokak adı ve bina numarası"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Şehir *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                placeholder="Şehir"
                                            />
                                            {errors.city && (
                                                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Posta Kodu *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.postalCode}
                                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '') })}
                                                maxLength="5"
                                                className={`w-full border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                                                placeholder="Posta kodu"
                                            />
                                            {errors.postalCode && (
                                                <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Kargo Seçenekleri */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Kargo Seçenekleri</h2>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-black transition-colors">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="free"
                                                checked={formData.shippingMethod === 'free'}
                                                onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                                                className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-medium text-gray-900">Ücretsiz Kargo</span>
                                                <span className="block text-sm text-gray-500">7-10 iş günü</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">Ücretsiz</span>
                                    </label>

                                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-black transition-colors">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="regular"
                                                checked={formData.shippingMethod === 'regular'}
                                                onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                                                className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-medium text-gray-900">Standart Kargo</span>
                                                <span className="block text-sm text-gray-500">3-5 iş günü</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">7.50 TL</span>
                                    </label>

                                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-black transition-colors">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="express"
                                                checked={formData.shippingMethod === 'express'}
                                                onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                                                className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-medium text-gray-900">Express Kargo</span>
                                                <span className="block text-sm text-gray-500">1-3 iş günü</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">22.50 TL</span>
                                    </label>
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
                                            {(item.price * (item.qty || 1)).toLocaleString('tr-TR')} TL
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
                                onClick={submitHandler}
                                className="mt-6 w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Ödemeye Geç
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

export default Shipping; 