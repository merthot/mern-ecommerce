import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FunnelIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Search = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortOption, setSortOption] = useState('featured'); // önerilen, fiyat-artan, fiyat-azalan
    const { data, isLoading } = useGetProductsQuery();
    const products = data?.products || [];

    const categories = [
        'Kadın',
        'Erkek',
        'Çocuk',
        'Giyim',
        'Ayakkabı',
        'Çanta',
        'Aksesuar'
    ];

    useEffect(() => {
        if (!query.trim()) {
            navigate(-1);
            return;
        }

        if (products.length > 0 && query) {
            let filtered = products.filter(product => {
                const searchTerms = query.toLowerCase().split(' ');
                const productName = product.name.toLowerCase();
                const productBrand = product.brand.toLowerCase();
                const productCategory = product.category.toLowerCase();

                return searchTerms.every(term =>
                    productName.includes(term) ||
                    productBrand.includes(term) ||
                    productCategory.includes(term)
                );
            });

            // Kategori filtresi
            if (selectedCategories.length > 0) {
                filtered = filtered.filter(product =>
                    selectedCategories.some(category =>
                        product.category.toLowerCase().includes(category.toLowerCase())
                    )
                );
            }

            // Fiyat filtresi
            if (priceRange.min) {
                filtered = filtered.filter(product => product.price >= Number(priceRange.min));
            }
            if (priceRange.max) {
                filtered = filtered.filter(product => product.price <= Number(priceRange.max));
            }

            // Sıralama
            switch (sortOption) {
                case 'price-asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                default:
                    // Varsayılan sıralama (önerilen)
                    break;
            }

            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    }, [query, products, navigate, selectedCategories, priceRange, sortOption]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: '', max: '' });
    };

    if (!query.trim()) return null;
    if (isLoading) return <Loader />;

    return (
        <div className="mx-auto">
            <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{filteredProducts.length} ÜRÜNLER</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-sm font-medium"
                        >
                            <FunnelIcon className="w-5 h-5" />
                            FİLTRELER
                        </button>
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none bg-transparent pr-8 py-1 text-sm font-medium cursor-pointer"
                            >
                                <option value="featured">SIRALAMA: ÖNERİLEN</option>
                                <option value="price-asc">SIRALAMA: ARTAN FİYAT</option>
                                <option value="price-desc">SIRALAMA: AZALAN FİYAT</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Filtreler */}
                {showFilters && (
                    <div className="w-64 flex-shrink-0 border-r border-gray-200 p-4">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium mb-4">Kategoriler</h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <label key={category} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category)}
                                                onChange={() => handleCategoryToggle(category)}
                                                className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black"
                                            />
                                            <span className="ml-2 text-sm">{category}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-4">Fiyat Aralığı</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={priceRange.min}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                            placeholder="Min"
                                            className="w-full px-3 py-2 border text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                    </div>
                                    <span className="text-gray-500">-</span>
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={priceRange.max}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                            placeholder="Max"
                                            className="w-full px-3 py-2 border text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                    </div>
                                </div>
                            </div>

                            {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2 text-sm hover:text-gray-900"
                                >
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Ürün Listesi */}
                <div className="flex-1">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <h2 className="text-lg font-medium text-gray-900">Sonuç Bulunamadı</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Aramanızla eşleşen ürün bulunamadı. Lütfen farklı anahtar kelimelerle tekrar deneyin.
                            </p>
                            <Link
                                to="/"
                                className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-black hover:bg-gray-800"
                            >
                                Ana Sayfaya Dön
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                            {filteredProducts.map(product => (
                                <div key={product._id} className="group relative border-gray-200">
                                    <button className="absolute top-4 right-4 z-10">
                                        <HeartIcon className="w-6 h-6 text-white" />
                                    </button>
                                    <Link to={`/product/${product._id}`}>
                                        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-sm">
                                                {product.name}
                                            </h3>
                                            <p className="mt-1 text-sm font-medium">{product.price.toLocaleString('tr-TR')} TL</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search; 