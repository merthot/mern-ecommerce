import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ProductCard = ({ product, isFavorited, handleFavoriteClick }) => {
    const isProductOutOfStock = (sizeStock) => {
        // Tüm bedenlerin stok durumunu kontrol et
        return Object.values(sizeStock).every(stock => stock === 0);
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

    return (
        <div className="group relative">
            <div className="relative">
                <Link to={`/product/${product._id}`}>
                    <div className="aspect-h-4 aspect-w-3 overflow-hidden rounded-lg bg-gray-100">
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover object-center group-hover:opacity-75"
                        />
                        {isProductOutOfStock(product.sizeStock) && (
                            <div className="absolute top-2 right-2">
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    Tükendi
                                </span>
                            </div>
                        )}
                        {hasActiveDiscount() && (
                            <div className="absolute top-2 left-2">
                                <span className="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    %{getDiscountAmount()} İndirim
                                </span>
                            </div>
                        )}
                    </div>
                </Link>
                <div className="absolute top-2 right-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteClick(product._id);
                        }}
                        className={`p-2 rounded-full ${isFavorited ? 'bg-red-50' : 'bg-white'
                            } shadow-md hover:scale-110 transition-transform`}
                    >
                        {isFavorited ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                        ) : (
                            <HeartIcon className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-sm text-gray-700 font-medium">
                    <Link to={`/product/${product._id}`}>
                        {product.name}
                    </Link>
                </h3>
                <div className="mt-1 flex flex-col">
                    {hasActiveDiscount() ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-red-600">
                                    {getDiscountedPrice().toLocaleString('tr-TR')} TL
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {product.price.toLocaleString('tr-TR')} TL
                                </span>
                            </div>
                            <span className="text-xs text-red-600 mt-0.5">
                                %{getDiscountAmount()} indirim
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-medium text-gray-900">
                            {product.price.toLocaleString('tr-TR')} TL
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard; 