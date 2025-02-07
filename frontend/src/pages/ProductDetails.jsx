import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductDetailsQuery, useGetProductsQuery } from '../store/api/productApiSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useToggleFavoriteMutation } from '../store/api/userApiSlice';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDelivery, setShowDelivery] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { userInfo } = useSelector((state) => state.auth);
    const [toggleFavorite] = useToggleFavoriteMutation();
    const [isFavorited, setIsFavorited] = useState(false);

    const {
        data: product,
        isLoading,
        error,
    } = useGetProductDetailsQuery(id);

    const { data: relatedProducts } = useGetProductsQuery({
        category: product?.category,
        limit: 4
    }, {
        skip: !product?.category
    });

    useEffect(() => {
        if (product && userInfo) {
            setIsFavorited(userInfo.favorites?.includes(id) || false);
        } else {
            setIsFavorited(false);
        }
    }, [product, userInfo, id]);

    const addToCartHandler = () => {
        if (!selectedSize) {
            toast.error('Lütfen bir beden seçin');
            return;
        }

        const finalPrice = hasActiveDiscount() ? getDiscountedPrice() : product.price;

        dispatch(
            addToCart({
                ...product,
                quantity,
                selectedSize,
                price: finalPrice,
                originalPrice: product.price
            })
        );
        toast.success('Ürün sepete eklendi');
    };

    const handleFavoriteClick = async (productId) => {
        if (!userInfo) {
            toast.error('Favorilere eklemek için giriş yapmalısınız');
            navigate('/login');
            return;
        }

        try {
            const response = await toggleFavorite(productId).unwrap();
            const newFavoritedState = response.favorites.includes(productId);
            setIsFavorited(newFavoritedState);
            toast.success(newFavoritedState ? 'Ürün favorilere eklendi' : 'Ürün favorilerden çıkarıldı');
        } catch (error) {
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    // Örnek beden tablosu
    const sizeChart = {
        'XS': { göğüs: '82-85', bel: '64-67', kalça: '90-93' },
        'S': { göğüs: '86-89', bel: '68-71', kalça: '94-97' },
        'M': { göğüs: '90-93', bel: '72-75', kalça: '98-101' },
        'L': { göğüs: '94-97', bel: '76-79', kalça: '102-105' },
        'XL': { göğüs: '98-101', bel: '80-83', kalça: '106-109' },
        'XXL': { göğüs: '102-105', bel: '84-87', kalça: '110-113' }
    };

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
        setShowImageModal(true);
    };

    const handleSizeClick = (sizeValue) => {
        const stockValue = product.sizeStock?.[sizeValue] || 0;
        if (stockValue > 0) {
            setSelectedSize(sizeValue);
        }
    };

    const hasActiveDiscount = () => {
        if (!product.discount?.isActive) return false;
        const now = new Date();
        const startDate = new Date(product.discount.startDate);
        const endDate = new Date(product.discount.endDate);
        return now >= startDate && now <= endDate;
    };

    const getDiscountedPrice = () => {
        if (!hasActiveDiscount()) return product.price;
        if (product.discount.type === 'percentage') {
            const discountedPrice = product.price * (1 - product.discount.amount / 100);
            return Math.round(discountedPrice);
        }
        return Math.max(product.price - product.discount.amount, 0);
    };

    const getDiscountAmount = () => {
        if (!hasActiveDiscount()) return 0;
        if (product.discount.type === 'percentage') {
            return product.discount.amount;
        }
        const discountPercentage = (product.discount.amount / product.price) * 100;
        return Math.round(discountPercentage);
    };

    const hasActiveDiscountForProduct = (product) => {
        if (!product.discount?.isActive) return false;
        const now = new Date();
        const startDate = new Date(product.discount.startDate);
        const endDate = new Date(product.discount.endDate);
        return now >= startDate && now <= endDate;
    };

    const getDiscountedPriceForProduct = (product) => {
        if (!hasActiveDiscountForProduct(product)) return product.price;
        if (product.discount.type === 'percentage') {
            const discountedPrice = product.price * (1 - product.discount.amount / 100);
            return Math.round(discountedPrice);
        }
        return Math.max(product.price - product.discount.amount, 0);
    };

    const getDiscountAmountForProduct = (product) => {
        if (!hasActiveDiscountForProduct(product)) return 0;
        if (product.discount.type === 'percentage') {
            return product.discount.amount;
        }
        const discountPercentage = (product.discount.amount / product.price) * 100;
        return Math.round(discountPercentage);
    };

    if (isLoading) return <Loader />;
    if (error) return <div>Hata: {error.data?.message || error.error}</div>;

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sol taraf - Ürün görselleri */}
                    <div className="md:w-2/3">
                        <div className="grid grid-cols-2 gap-2">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="aspect-[3/4] relative overflow-hidden group [&:hover]:cursor-pointer"
                                    onClick={() => handleImageClick(index)}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} - ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sağ taraf - Ürün bilgileri */}
                    <div className="md:w-1/3 md:sticky md:top-8 h-fit py-8">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-500 tracking-wide uppercase mb-2">{product.brand}</h2>
                                <button
                                    onClick={() => handleFavoriteClick(id)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    {isFavorited ? (
                                        <HeartIconSolid className="w-6 h-6 text-red-500" />
                                    ) : (
                                        <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500" />
                                    )}
                                </button>
                            </div>
                            <h1 className="text-2xl font-light mb-3 tracking-wide">{product.name}</h1>
                            <div className="flex items-baseline gap-2 mb-6">
                                {hasActiveDiscount() ? (
                                    <>
                                        <p className="text-2xl font-medium text-red-600">
                                            {getDiscountedPrice().toLocaleString('tr-TR')} TL
                                        </p>
                                        <p className="text-lg text-gray-500 line-through">
                                            {product.price.toLocaleString('tr-TR')} TL
                                        </p>
                                        <span className="text-sm text-red-600 font-medium">
                                            %{getDiscountAmount()} indirim
                                        </span>
                                    </>
                                ) : (
                                    <p className="text-2xl font-medium">{product.price.toLocaleString('tr-TR')} TL</p>
                                )}
                            </div>
                            {/* Renk seçenekleri */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm text-gray-500">Renk:</span>
                                    <div className="flex gap-2">
                                        {product.colors.map((color, index) => (
                                            <div
                                                key={`color-${color}-${index}`}
                                                className="w-6 h-6 rounded-full border border-gray-300"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Beden seçimi */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500">Beden:</span>
                                <button
                                    onClick={() => setShowSizeChart(true)}
                                    className="text-xs text-gray-600 underline hover:text-black transition-colors"
                                >
                                    Beden Tablosu
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {Array.isArray(product.sizes) ? (
                                    product.sizes.map((size) => {
                                        const sizeValue = typeof size === 'object' ? size.name : size;
                                        const sizeStockValue = product.sizeStock?.[sizeValue] || 0;

                                        return (
                                            <button
                                                key={`size-${sizeValue}`}
                                                className={`
                                                    py-3 text-sm border rounded-md transition-all duration-200 relative w-full
                                                    ${sizeStockValue === 0
                                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : selectedSize === sizeValue
                                                            ? 'border-black bg-black text-white hover:opacity-90'
                                                            : sizeStockValue < 3
                                                                ? 'border-orange-300 hover:border-orange-400'
                                                                : 'border-gray-300 hover:border-black'
                                                    }
                                                `}
                                                onClick={() => handleSizeClick(sizeValue)}
                                                disabled={sizeStockValue === 0}
                                            >
                                                <div className="flex flex-col items-center justify-center min-h-[32px]">
                                                    <span>{sizeValue}</span>
                                                    {sizeStockValue > 0 && sizeStockValue < 3 && (
                                                        <span className="text-[10px] text-orange-500 font-medium mt-0.5">Tükeniyor</span>
                                                    )}
                                                </div>
                                                {sizeStockValue === 0 && (
                                                    <>
                                                        <div className="absolute inset-0 bg-white/40" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="h-px w-full bg-gray-400 rotate-12" />
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="col-span-3 text-sm text-gray-500">Beden bilgisi bulunamadı</p>
                                )}
                            </div>
                        </div>

                        {/* Stok durumu */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">
                                {selectedSize ? (
                                    (() => {
                                        const stockValue = product.sizeStock?.[selectedSize] || 0;
                                        return stockValue > 0 ? 'Stokta Var' : 'Stokta Yok';
                                    })()
                                ) : (
                                    'Lütfen bir beden seçin'
                                )}
                            </p>
                        </div>

                        {/* Sepete ekle butonu */}
                        {selectedSize && product.sizeStock?.[selectedSize] > 0 ? (
                            <button
                                onClick={addToCartHandler}
                                className="w-full bg-black text-white py-4 mb-4 hover:bg-gray-900 disabled:bg-gray-400 text-sm font-medium"
                            >
                                Sepete Ekle
                            </button>
                        ) : (
                            <button
                                className="w-full border border-black py-4 mb-4 text-sm font-medium"
                                disabled={!selectedSize}
                            >
                                {selectedSize ? 'Stoğa Gelince Haber Ver' : 'Beden Seçiniz'}
                            </button>
                        )}

                        {/* Ürün detayları */}
                        <div className="mt-8 space-y-4">
                            {/* Ürün Detayları Accordion */}
                            <div className="border-t border-gray-200">
                                <button
                                    className="flex justify-between items-center w-full py-4"
                                    onClick={() => setShowDetails(!showDetails)}
                                >
                                    <span className="text-sm font-medium">Ürün Detayları</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showDetails && (
                                    <div className="pb-4 text-sm text-gray-600 space-y-4">
                                        {/* Ürün Açıklaması */}
                                        {product?.description && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Ürün Açıklaması</h4>
                                                <p className="mt-1 whitespace-pre-line">{product.description}</p>
                                            </div>
                                        )}

                                        {/* Kumaş Bilgisi */}
                                        {product?.fabric && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Kumaş Bilgisi</h4>
                                                <p className="mt-1 whitespace-pre-line">{product.fabric}</p>
                                            </div>
                                        )}

                                        {/* Ürün Detayları */}
                                        {product?.productDetails && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Ürün Detayları</h4>
                                                <p className="mt-1 whitespace-pre-line">{product.productDetails}</p>
                                            </div>
                                        )}

                                        {/* Model Ölçüleri */}
                                        {product?.modelMeasurements && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Model Ölçüleri</h4>
                                                <p className="mt-1 whitespace-pre-line">{product.modelMeasurements}</p>
                                            </div>
                                        )}

                                        {/* Yıkama Talimatları */}
                                        {product?.careInstructions && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Yıkama Talimatları</h4>
                                                <p className="mt-1 whitespace-pre-line">{product.careInstructions}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Teslimat & İade Accordion */}
                            <div className="border-t border-gray-200">
                                <button
                                    className="flex justify-between items-center w-full py-4"
                                    onClick={() => setShowDelivery(!showDelivery)}
                                >
                                    <span className="text-sm font-medium">Teslimat & İade</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${showDelivery ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showDelivery && (
                                    <div className="pb-4 text-sm text-gray-600 space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                            <p>Ücretsiz Kargo (150 TL üzeri alışverişlerde)</p>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <p>30 Gün İade Hakkı</p>
                                        </div>
                                        <p>Ürünleriniz 1-3 iş günü içinde kargoya verilir. İade işlemlerinizi kolayca gerçekleştirebilirsiniz.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* İlgini Çekebilecek Ürünler */}
                {relatedProducts && relatedProducts.products && relatedProducts.products.length > 0 && (
                    <div className="mx-auto py-16">
                        <h2 className="text-center text-2xl font-medium text-gray-900 mb-8">İlgini Çekebilecek Ürünler</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                            {relatedProducts.products
                                .filter(relatedProduct => relatedProduct._id !== id)
                                .slice(0, 4)
                                .map((relatedProduct) => (
                                    <div key={relatedProduct._id} className="group relative border-[0.5px] border-gray-200">
                                        <Link
                                            to={`/product/${relatedProduct._id}`}
                                            className="block"
                                        >
                                            <div className="relative aspect-[3/4]">
                                                <img
                                                    src={relatedProduct.images[0]}
                                                    alt={relatedProduct.name}
                                                    className="absolute w-full h-full object-cover object-center"
                                                />
                                                {hasActiveDiscountForProduct(relatedProduct) && (
                                                    <div className="absolute top-2 left-2">
                                                        <span className="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                            %{getDiscountAmountForProduct(relatedProduct)} İndirim
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Favori Butonu */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleFavoriteClick(relatedProduct._id);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 rounded-full"
                                                >
                                                    {relatedProduct.isFavorited ? (
                                                        <HeartIconSolid className="h-6 w-6 text-black" />
                                                    ) : (
                                                        <HeartIcon className="h-6 w-6 text-white" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-sm text-gray-700">{relatedProduct.name}</h3>
                                                <div className="mt-1">
                                                    {hasActiveDiscountForProduct(relatedProduct) ? (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-red-600">
                                                                    {getDiscountedPriceForProduct(relatedProduct).toLocaleString('tr-TR')} TL
                                                                </span>
                                                                <span className="text-sm text-gray-500 line-through">
                                                                    {relatedProduct.price.toLocaleString('tr-TR')} TL
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {relatedProduct.price.toLocaleString('tr-TR')} TL
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Resim Modalı */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 bg-white flex">
                    {/* Sol taraf - Küçük resimler */}
                    <div className="w-24 h-screen overflow-y-auto py-4 px-2 hidden md:block border-r">
                        <div className="space-y-2">
                            {product.images.map((image, index) => (
                                <button
                                    key={`modal-thumb-${index}`}
                                    className={`w-full aspect-[3/4] ${selectedImageIndex === index
                                        ? 'ring-2 ring-black'
                                        : 'opacity-50 hover:opacity-100'
                                        } transition-all duration-200`}
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} - ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orta - Ana resim */}
                    <div className="flex-1 h-screen relative">
                        <div className="h-full flex items-center justify-center p-4">
                            {/* Önceki resim butonu */}
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 p-2 hover:bg-gray-100 rounded-full z-50"
                                onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Ana resim */}
                            <img
                                src={product.images[selectedImageIndex]}
                                alt={`${product.name} - ${selectedImageIndex + 1}`}
                                className="max-h-screen max-w-full object-contain"
                            />

                            {/* Sonraki resim butonu */}
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 p-2 hover:bg-gray-100 rounded-full z-50"
                                onClick={() => setSelectedImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Kapatma butonu */}
                        <button
                            className="absolute top-4 right-4 text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 z-50"
                            onClick={() => setShowImageModal(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Beden Tablosu Modal */}
            {showSizeChart && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-black opacity-75"></div>
                        </div>
                        <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Beden Tablosu</h3>
                                    <button
                                        onClick={() => setShowSizeChart(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Beden</th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Göğüs (cm)</th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Bel (cm)</th>
                                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Kalça (cm)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(sizeChart).map(([size, measurements]) => (
                                                <tr key={size} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{size}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{measurements.göğüs}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{measurements.bel}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{measurements.kalça}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 text-xs text-gray-500">
                                    <p>* Ölçüler santimetre (cm) cinsindendir.</p>
                                    <p>* Ölçüler yaklaşık değerlerdir ve üründen ürüne farklılık gösterebilir.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails; 