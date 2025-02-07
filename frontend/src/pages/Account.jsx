import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateProfileMutation, useGetFavoritesQuery, useToggleFavoriteMutation } from '../store/api/userApiSlice';
import { useGetMyOrdersQuery } from '../store/api/orderApiSlice';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircleIcon, ShoppingBagIcon, HeartIcon, MapPinIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { addToCart } from '../store/slices/cartSlice';
import { useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation } from '../store/api/addressApiSlice';

const Account = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const location = useLocation();
    const currentPath = location.pathname.split('/').pop();
    const [activeTab, setActiveTab] = useState(currentPath || 'profile');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.auth);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const [selectedSizes, setSelectedSizes] = useState({});

    useEffect(() => {
        // localStorage'dan userInfo'yu kontrol et
        const storedUserInfo = localStorage.getItem('userInfo');

        if (!userInfo && !storedUserInfo) {
            navigate('/login');
        } else {
            const user = userInfo || JSON.parse(storedUserInfo);
            setName(user.name || '');
            setEmail(user.email || '');

            // Redux store'da userInfo yoksa ama localStorage'da varsa, store'u güncelle
            if (!userInfo && storedUserInfo) {
                dispatch(setCredentials(JSON.parse(storedUserInfo)));
            }
        }
    }, [userInfo, navigate, dispatch]);

    // URL değiştiğinde activeTab'i güncelle
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path === 'account') {
            setActiveTab('profile');
        } else {
            setActiveTab(path || 'profile');
        }
    }, [location]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'profile') {
            navigate('/account');
        } else {
            navigate(`/account/${tabId}`);
        }
    };

    const menuItems = [
        { id: 'profile', name: 'Profil Bilgileri', icon: UserCircleIcon },
        { id: 'purchases', name: 'Siparişlerim', icon: ShoppingBagIcon },
        { id: 'favorites', name: 'Favorilerim', icon: HeartIcon },
        { id: 'addresses', name: 'Adreslerim', icon: MapPinIcon },
    ];

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor');
            return;
        }

        try {
            const userData = {
                name,
                email,
                ...(password && { password })
            };

            const res = await updateProfile(userData).unwrap();
            dispatch(setCredentials(res));
            toast.success('Profil güncellendi');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'Bir hata oluştu');
        }
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [productId]: size
        }));
    };

    const handleAddToCart = (product) => {
        const selectedSize = selectedSizes[product._id];
        if (!selectedSize) {
            toast.error('Lütfen bir beden seçin');
            return;
        }

        dispatch(addToCart({
            ...product,
            quantity: 1,
            selectedSize
        }));
        toast.success('Ürün sepete eklendi');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sol Menü */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-1">
                            <div className="pb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-2xl font-medium text-gray-600">
                                            {name ? name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">{name}</h2>
                                        <p className="text-sm text-gray-500">{email}</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id)}
                                        className={`w-full flex items-center px-4 py-3 text-sm rounded-md transition-colors ${activeTab === item.id
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5 mr-3" />
                                        {item.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Sağ İçerik */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-medium text-gray-900">
                                    {menuItems.find(item => item.id === activeTab)?.name}
                                </h3>
                            </div>

                            {activeTab === 'profile' && (
                                <form onSubmit={submitHandler} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Ad Soyad
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                E-posta
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Yeni Şifre
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                Yeni Şifre Tekrar
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                                        >
                                            {isLoading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'purchases' && (
                                <div className="p-6">
                                    <OrdersList />
                                </div>
                            )}

                            {activeTab === 'favorites' && (
                                <div className="p-6">
                                    <FavoritesTab />
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="p-6">
                                    <AddressList />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrdersList = () => {
    const { data: orders, isLoading, error } = useGetMyOrdersQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Siparişler yüklenirken bir hata oluştu.</p>
            </div>
        );
    }

    if (!orders?.length) {
        return (
            <div className="text-center py-12">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz siparişiniz yok</h3>
                <p className="mt-1 text-sm text-gray-500">Alışverişe başlamak için ürünleri keşfedin.</p>
                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900"
                    >
                        Alışverişe Başla
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order._id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">
                                Sipariş #{order._id.slice(-8).toUpperCase()}
                            </h4>
                            <p className="text-sm text-gray-500">
                                {format(new Date(order.createdAt), 'd MMMM yyyy', { locale: tr })}
                            </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'İşleniyor' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'Kargoya Verildi' ? 'bg-purple-100 text-purple-800' :
                                            order.status === 'Teslim Edildi' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="flow-root">
                            <ul className="-my-4 divide-y divide-gray-200">
                                {order.orderItems.map((item) => (
                                    <li key={item._id} className="flex py-4">
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
                                                <p className="ml-4">{item.price} ₺</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">Adet: {item.qty}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Toplam</p>
                            <p>{order.totalPrice} ₺</p>
                        </div>

                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900"
                        >
                            Sipariş Detayları
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const FavoritesTab = () => {
    const { data: favorites, isLoading, refetch } = useGetFavoritesQuery();
    const [toggleFavorite] = useToggleFavoriteMutation();
    const [selectedSizes, setSelectedSizes] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [productId]: size
        }));
    };

    const handleAddToCart = (product) => {
        const selectedSize = selectedSizes[product._id];
        if (!selectedSize) {
            toast.error('Lütfen bir beden seçin');
            return;
        }

        dispatch(addToCart({
            ...product,
            quantity: 1,
            selectedSize
        }));
        toast.success('Ürün sepete eklendi');
    };

    const handleRemoveFavorite = async (productId) => {
        try {
            const response = await toggleFavorite(productId).unwrap();
            const newFavoritedState = response.favorites.includes(productId);

            // LocalStorage'dan mevcut favorileri al
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

            // Favori durumuna göre localStorage'ı güncelle
            if (newFavoritedState) {
                if (!favorites.includes(productId)) {
                    favorites.push(productId);
                }
            } else {
                const index = favorites.indexOf(productId);
                if (index > -1) {
                    favorites.splice(index, 1);
                }
            }

            // Güncellenmiş favori listesini localStorage'a kaydet
            localStorage.setItem('favorites', JSON.stringify(favorites));

            toast.success('Ürün favorilerden kaldırıldı');

            // Favori listesini yeniden çekmek için refetch yapıyoruz
            refetch();
        } catch (err) {
            toast.error('Bir hata oluştu');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!favorites?.length) {
        return (
            <div className="text-center py-12">
                <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz favori ürününüz yok</h3>
                <p className="mt-1 text-sm text-gray-500">Beğendiğiniz ürünleri favorilere ekleyebilirsiniz.</p>
                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                    >
                        Alışverişe Başla
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                    <div className="relative">
                        <Link to={`/product/${product._id}`} className="block relative aspect-[3/4] overflow-hidden">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </Link>
                        <button
                            onClick={() => handleRemoveFavorite(product._id)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                        >
                            <HeartIconSolid className="w-5 h-5 text-red-500" />
                        </button>
                    </div>

                    <div className="p-4 space-y-3">
                        <div>
                            <Link to={`/product/${product._id}`}>
                                <h3 className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                            <p className="text-lg font-medium text-gray-900 mt-1">
                                {product.price.toLocaleString('tr-TR')} TL
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 block">Beden:</label>
                            <div className="grid grid-cols-4 gap-2">
                                {product.sizes.map((size) => {
                                    const sizeValue = typeof size === 'object' ? size.name : size;
                                    const sizeStockValue = product.sizeStock?.[sizeValue] || 0;

                                    return (
                                        <button
                                            key={`size-${sizeValue}`}
                                            className={`
                                                py-2 text-sm border rounded-md transition-all duration-200
                                                ${sizeStockValue === 0
                                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                    : selectedSizes[product._id] === sizeValue
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-300 hover:border-black'
                                                }
                                            `}
                                            onClick={() => handleSizeSelect(product._id, sizeValue)}
                                            disabled={sizeStockValue === 0}
                                        >
                                            {sizeValue}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-900 transition-colors duration-200 text-sm font-medium"
                        >
                            Sepete Ekle
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AddressList = () => {
    const [formData, setFormData] = useState({
        title: '',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Türkiye',
        isDefault: false
    });

    const { data: addresses, isLoading } = useGetAddressesQuery();
    const [addAddress] = useAddAddressMutation();
    const [updateAddress] = useUpdateAddressMutation();
    const [deleteAddress] = useDeleteAddressMutation();

    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const saveAddress = async (e) => {
        e.preventDefault();

        try {
            if (editMode) {
                await updateAddress({ id: editId, ...formData }).unwrap();
                toast.success('Adres başarıyla güncellendi');
            } else {
                await addAddress(formData).unwrap();
                toast.success('Adres başarıyla eklendi');
            }

            resetForm();
            setShowForm(false);
        } catch (err) {
            toast.error(err?.data?.message || 'Bir hata oluştu');
        }
    };

    const editAddress = (address) => {
        setFormData(address);
        setEditMode(true);
        setEditId(address.id);
        setShowForm(true);
    };

    const handleDeleteAddress = async (id) => {
        try {
            await deleteAddress(id).unwrap();
            toast.success('Adres başarıyla silindi');
        } catch (err) {
            toast.error(err?.data?.message || 'Bir hata oluştu');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            fullName: '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'Türkiye',
            isDefault: false
        });
        setEditMode(false);
        setEditId(null);
    };

    const handleCancel = () => {
        resetForm();
        setShowForm(false);
    };

    if (isLoading) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition-colors duration-200"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Yeni Adres Ekle
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-4">
                        {editMode ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                    </h3>
                    <form onSubmit={saveAddress} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adres Başlığı
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Şehir
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adres
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200 resize-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Posta Kodu
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ülke
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black transition-colors duration-200 bg-gray-50 cursor-not-allowed"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isDefault"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black/5 transition-colors duration-200 cursor-pointer"
                            />
                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                Varsayılan adres olarak kaydet
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900"
                            >
                                {editMode ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Kayıtlı Adresler */}
            {addresses && addresses.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Kayıtlı Adresler</h3>
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="border rounded-lg p-4 relative hover:border-gray-400 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{address.title}</h4>
                                            {address.isDefault && (
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                                    Varsayılan
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{address.fullName}</p>
                                        <p className="text-sm text-gray-600">{address.phone}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {address.address}, {address.city} {address.postalCode}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => editAddress(address)}
                                            className="text-sm text-gray-600 hover:text-black"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!addresses?.length && !showForm && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz adres eklemediniz</h3>
                    <p className="mt-1 text-sm text-gray-500">Yeni bir teslimat adresi ekleyebilirsiniz.</p>
                </div>
            )}
        </div>
    );
};

export default Account; 