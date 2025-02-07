import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../store/slices/cartSlice';

const Cart = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;

    // Hesaplamalar
    const itemsPrice = cartItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.qty || 1),
        0
    );
    const shippingPrice = itemsPrice > 150 ? 0 : 14.99;
    const totalPrice = itemsPrice + shippingPrice;

    const updateQty = (item, qty) => {
        dispatch(addToCart({ ...item, qty }));
    };

    const removeFromCartHandler = (id, size) => {
        dispatch(removeFromCart({ _id: id, selectedSize: size }));
    };

    const checkoutHandler = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login?redirect=/shipping');
        } else {
            navigate('/shipping');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-[1400px] px-4 pt-16 pb-24 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-light text-gray-900">Alışveriş Sepeti</h1>
                    <Link to="/" className="text-sm text-gray-600 hover:text-black transition-colors">
                        Alışverişe Devam Et →
                    </Link>
                </div>

                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
                    <div className="lg:col-span-8">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="mt-4 text-gray-500">Sepetinizde ürün bulunmuyor.</p>
                                <Link to="/" className="mt-4 text-sm text-black hover:underline">
                                    Alışverişe Başla
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={`${item._id}-${item.size}`} className="flex gap-8 p-6 bg-white rounded-lg shadow-sm">
                                        <div className="flex-shrink-0">
                                            <Link to={`/product/${item._id}`}>
                                                <img
                                                    src={item.images?.[0] || item.image}
                                                    alt={item.name}
                                                    className="h-40 w-32 object-cover object-center rounded-md"
                                                />
                                            </Link>
                                        </div>

                                        <div className="flex flex-1 flex-col">
                                            <div className="flex justify-between">
                                                <div>
                                                    <Link
                                                        to={`/product/${item._id}`}
                                                        className="text-lg font-medium text-gray-900 hover:underline"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <div className="mt-2 flex flex-col space-y-2">
                                                        {item.selectedSize && (
                                                            <div className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 w-fit">
                                                                Beden: {item.selectedSize}
                                                            </div>
                                                        )}
                                                        {item.color && (
                                                            <div className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 w-fit">
                                                                Renk: {item.color}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        {item.originalPrice && item.price < item.originalPrice ? (
                                                            <>
                                                                <span className="text-base font-medium text-red-600">
                                                                    {item.price.toLocaleString('tr-TR')} TL
                                                                </span>
                                                                <span className="text-sm text-gray-500 line-through">
                                                                    {item.originalPrice.toLocaleString('tr-TR')} TL
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-base font-medium text-gray-900">
                                                                {item.price.toLocaleString('tr-TR')} TL
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 flex items-center justify-between">
                                                <div className="flex items-center border border-gray-200 rounded">
                                                    <button
                                                        onClick={() => updateQty(item, Math.max(1, (item.qty || 1) - 1))}
                                                        className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-12 text-center text-sm font-medium">{item.qty || 1}</span>
                                                    <button
                                                        onClick={() => updateQty(item, Math.min(item.countInStock || 10, (item.qty || 1) + 1))}
                                                        className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCartHandler(item._id, item.selectedSize)}
                                                    className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Kaldır
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="mt-16 lg:mt-0 lg:col-span-4">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                                <h2 className="text-lg font-medium text-gray-900">Sipariş Özeti</h2>

                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <p className="text-gray-600">Ara Toplam</p>
                                        <p className="text-gray-900 font-medium">{itemsPrice.toLocaleString('tr-TR')} TL</p>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-gray-200 pt-4">
                                        <p className="text-gray-600">Kargo</p>
                                        <p className="text-gray-900 font-medium">
                                            {shippingPrice === 0 ? 'Ücretsiz' : `${shippingPrice.toLocaleString('tr-TR')} TL`}
                                        </p>
                                    </div>
                                    {shippingPrice > 0 && (
                                        <div className="text-xs text-gray-500 pt-1">
                                            150 TL üzeri alışverişlerde kargo ücretsiz!
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-gray-200 pt-4">
                                        <p className="text-base font-medium text-gray-900">Toplam</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {totalPrice.toLocaleString('tr-TR')} TL
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={checkoutHandler}
                                    className="w-full mt-6 bg-black text-white py-3 rounded hover:bg-gray-900 transition-colors text-sm font-medium"
                                >
                                    Sepeti Onayla
                                </button>

                                <div className="mt-4 text-xs text-gray-500 space-y-1">
                                    <p>• Siparişiniz 2-4 iş günü içinde kargoya verilecektir.</p>
                                    <p>• 14 gün içinde ücretsiz iade hakkınız bulunmaktadır.</p>
                                    <p>• Güvenli alışveriş ve SSL sertifikası ile koruma.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart; 