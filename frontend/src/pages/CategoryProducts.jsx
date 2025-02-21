import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApiSlice';
import { useToggleFavoriteMutation, useGetFavoritesQuery } from '../store/api/userApiSlice';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import CategoryMenu from '../components/CategoryMenu';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const CategoryProducts = () => {
    const { category, subcategory, type } = useParams();
    const { data, isLoading, error } = useGetProductsQuery();
    const { data: favoritesData } = useGetFavoritesQuery(undefined, {
        skip: !useSelector((state) => state.auth.userInfo)
    });
    const { userInfo } = useSelector((state) => state.auth);
    const [toggleFavorite] = useToggleFavoriteMutation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState('recommended');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        colors: [],
        sizes: [],
        minPrice: '',
        maxPrice: ''
    });

    const availableSizes = ['32', '34', '36', '38', '40', '42', '44', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = [
        { name: 'Beyaz', value: '#FFFFFF', displayClass: 'bg-white border border-gray-300' },
        { name: 'Siyah', value: '#000000', displayClass: 'bg-black' },
        { name: 'Gri', value: '#808080', displayClass: 'bg-gray-500' },
        { name: 'Kırmızı', value: '#FF0000', displayClass: 'bg-red-600' },
        { name: 'Mavi', value: '#0000FF', displayClass: 'bg-blue-600' },
        { name: 'Yeşil', value: '#008000', displayClass: 'bg-green-600' },
        { name: 'Sarı', value: '#FFFF00', displayClass: 'bg-yellow-400' },
        { name: 'Mor', value: '#800080', displayClass: 'bg-purple-600' },
        { name: 'Turuncu', value: '#FFA500', displayClass: 'bg-orange-500' },
        { name: 'Pembe', value: '#FFC0CB', displayClass: 'bg-pink-400' },
        { name: 'Kahverengi', value: '#A52A2A', displayClass: 'bg-amber-800' },
        { name: 'Lacivert', value: '#000080', displayClass: 'bg-blue-900' },
    ];

    // URL'deki kategori yolunu düzgün formata çevir
    const formatCategory = (text) => {
        if (!text) return '';

        // Türkçe karakter düzeltmeleri
        const corrections = {
            'kadin': 'Kadın',
            'erkek': 'Erkek',
            'cocuk': 'Çocuk',
            'giyim': 'Giyim',
            'canta': 'Çanta',
            'ayakkabi': 'Ayakkabı',
            'aksesuar': 'Aksesuar',
            'elbise': 'Elbise',
            'tisort': 'Tişört',
            'pantolon': 'Pantolon',
            'etek': 'Etek',
            'ceket': 'Ceket',
            'gomlek': 'Gömlek',
            'omuz-cantasi': 'Omuz Çantası',
            'el-cantasi': 'El Çantası'
        };

        return corrections[text.toLowerCase()] || text;
    };

    // Kategori yolunu oluştur
    const urlPath = [
        formatCategory(category),
        formatCategory(subcategory),
        formatCategory(type)
    ]
        .filter(Boolean)
        .join('/');

    const handleColorToggle = (colorName) => {
        setFilters(prev => ({
            ...prev,
            colors: prev.colors.includes(colorName)
                ? prev.colors.filter(c => c !== colorName)
                : [...prev.colors, colorName]
        }));
    };

    const handleSizeToggle = (size) => {
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const handlePriceChange = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const hasActiveDiscount = (product) => {
        if (!product?.discount?.isActive) return false;
        const now = new Date();
        const startDate = new Date(product.discount.startDate);
        const endDate = new Date(product.discount.endDate);
        return now >= startDate && now <= endDate;
    };

    const getDiscountedPrice = (product) => {
        if (!hasActiveDiscount(product)) return product.price;
        if (product.discount.type === 'percentage') {
            return product.price * (1 - product.discount.amount / 100);
        }
        return Math.max(product.price - product.discount.amount, 0);
    };

    const getDiscountAmount = (product) => {
        if (!hasActiveDiscount(product)) return 0;
        if (product.discount.type === 'percentage') {
            return product.discount.amount;
        }
        return Math.round((product.discount.amount / product.price) * 100);
    };

    useEffect(() => {
        if (data?.products) {
            const updatedProducts = data.products.map(product => ({
                ...product,
                isFavorited: userInfo?.favorites?.includes(product._id) || false
            }));
            setProducts(updatedProducts);
        } else {
            setProducts([]);
        }
    }, [data, userInfo, favoritesData]);

    // Filtrelenmiş ve sıralanmış ürünleri hesapla
    const sortedProducts = useMemo(() => {
        if (!products.length) return [];

        // Önce kategori filtresini uygula
        let filtered = products.filter(product => {
            // URL'deki kategori yolunu parçalara ayır
            const urlParts = urlPath.split('/');
            const productCategories = product.category.split('/');

            // İndirim kategorisi kontrolü
            const isDiscountCategory = urlParts.includes('indirim');
            const hasDiscount = hasActiveDiscount(product);

            // Eğer indirim kategorisindeyse ve ürün indirimli ise
            if (isDiscountCategory && hasDiscount) {
                // Ana kategori eşleşmesi yeterli (örn: Kadın/indirim için tüm indirimli kadın ürünleri)
                return productCategories[0] === urlParts[0];
            }

            // Normal kategori kontrolü
            if (!product.category.startsWith(urlPath)) return false;

            // Renk filtresi
            if (filters.colors.length > 0 && !filters.colors.includes(product.color)) return false;

            // Beden filtresi
            if (filters.sizes.length > 0 && !product.sizes.some(size => filters.sizes.includes(size))) return false;

            // Fiyat filtresi
            const discountedPrice = getDiscountedPrice(product);
            if (filters.minPrice && discountedPrice < Number(filters.minPrice)) return false;
            if (filters.maxPrice && discountedPrice > Number(filters.maxPrice)) return false;

            return true;
        });

        // Sonra sıralama uygula
        switch (sortOption) {
            case 'price-asc':
                return filtered.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
            case 'price-desc':
                return filtered.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
            case 'newest':
                return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            default:
                return filtered;
        }
    }, [products, filters, sortOption, urlPath]);

    // Filtre menüsünü dışarı tıklandığında kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showFilters && !event.target.closest('.filter-menu') && !event.target.closest('.filter-button')) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    const handleFavoriteClick = async (productId) => {
        if (!userInfo) {
            toast.error('Favorilere eklemek için giriş yapmalısınız');
            navigate('/login');
            return;
        }

        try {
            const response = await toggleFavorite(productId).unwrap();
            const newFavoritedState = response.favorites.includes(productId);

            // Ürün listesini güncelle
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product._id === productId
                        ? { ...product, isFavorited: newFavoritedState }
                        : product
                )
            );

            toast.success(newFavoritedState ? 'Ürün favorilere eklendi' : 'Ürün favorilerden çıkarıldı');
        } catch (error) {
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <div>Hata: {error.data?.message || error.error}</div>;

    return (
        <>
            <CategoryMenu />
            <div className="relative">
                {/* Üst bilgi ve filtreler */}
                <div className="flex justify-between items-center py-2 border-b relative">
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-xs font-medium">{sortedProducts.length} ÜRÜNLER</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${showFilters
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                />
                            </svg>
                            FİLTRELER
                        </button>
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 appearance-none cursor-pointer pr-10 transition-colors duration-200"
                            >
                                <option value="recommended">SIRALAMA: ÖNERİLEN</option>
                                <option value="price-asc">DÜŞÜK FİYAT</option>
                                <option value="price-desc">YÜKSEK FİYAT</option>
                                <option value="newest">EN YENİ</option>
                            </select>
                            <svg
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-900 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Filtre Menüsü */}
                    {showFilters && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg z-[1000] filter-menu">
                            <div className="p-4 space-y-6">
                                {/* Renk Filtreleri */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Renkler</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {colors.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => handleColorToggle(color.name)}
                                                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${filters.colors.includes(color.name)
                                                    ? 'bg-gray-100'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full ${color.displayClass}`} />
                                                <span className="text-xs">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Beden Filtreleri */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Bedenler</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => handleSizeToggle(size)}
                                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${filters.sizes.includes(size)
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fiyat Aralığı */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Fiyat Aralığı</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={filters.minPrice}
                                                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                                placeholder="Min"
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                        </div>
                                        <span className="text-gray-500">-</span>
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={filters.maxPrice}
                                                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                                placeholder="Max"
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Filtreleri Temizle */}
                                {(filters.colors.length > 0 || filters.sizes.length > 0 || filters.minPrice || filters.maxPrice) && (
                                    <button
                                        onClick={() => setFilters({
                                            colors: [],
                                            sizes: [],
                                            minPrice: '',
                                            maxPrice: ''
                                        })}
                                        className="w-full py-2 text-sm text-gray-900 hover:text-gray-700 transition-colors"
                                    >
                                        Filtreleri Temizle
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {sortedProducts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Bu kategoride ürün bulunamadı.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-y-12 lg:p-0">
                        {sortedProducts.map(product => (
                            <div key={product._id} className="group relative">
                                <Link to={`/product/${product._id}`}>
                                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 lg:rounded-none">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                        {hasActiveDiscount(product) && (
                                            <div className="absolute top-2 left-2">
                                                <span className="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    %{getDiscountAmount(product)} İndirim
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFavoriteClick(product._id);
                                    }}
                                    className="absolute top-2 right-2 p-2 z-10 transition-colors duration-200 rounded-full hover:bg-white/10"
                                >
                                    {product.isFavorited ? (
                                        <HeartIconSolid className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 drop-shadow-sm" />
                                    ) : (
                                        <HeartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white hover:text-red-600 drop-shadow-sm transition-colors" />
                                    )}
                                </button>
                                <div className="mt-2 lg:mt-4">
                                    <h3 className="text-xs lg:text-sm text-gray-700 px-1 lg:px-4 line-clamp-2 lg:line-clamp-none">
                                        <Link to={`/product/${product._id}`}>
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <div className="mt-1 px-1 lg:px-4">
                                        {hasActiveDiscount(product) ? (
                                            <>
                                                <div className="flex items-center gap-1 lg:gap-2">
                                                    <span className="text-xs lg:text-sm font-medium text-red-600">
                                                        {getDiscountedPrice(product).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
                                                    </span>
                                                    <span className="text-xs lg:text-sm text-gray-500 line-through">
                                                        {product.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs lg:text-sm font-medium text-gray-900">
                                                {product.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default CategoryProducts; 