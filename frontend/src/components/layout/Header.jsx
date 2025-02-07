import { Fragment, useState, useRef, useEffect } from 'react';
import { Transition, Menu } from '@headlessui/react';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../../store/api/userApiSlice';
import { logout } from '../../store/slices/authSlice';
import { resetCart, addToCart, removeFromCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showCart, setShowCart] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const cartItems = useSelector(state => state.cart.cartItems);
    const userInfo = useSelector(state => state.auth.userInfo);
    const [logoutApiCall] = useLogoutMutation();

    // Dışarı tıklandığında menüyü kapatmak için ref ve useEffect ekleyelim
    const megaMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const categories = {
        'kadin': {
            title: 'Kadın',
            sections: [
                {
                    title: 'İNDİRİM',
                    isDiscount: true,
                    items: [
                        { name: 'Elbise', path: '/kadin/indirim/elbise', isDiscount: true, badge: 'YENİ' },
                        { name: 'Tişört', path: '/kadin/indirim/tisort', isDiscount: true },
                        { name: 'Gömlek', path: '/kadin/indirim/gomlek', isDiscount: true },
                        { name: 'Pantolon', path: '/kadin/indirim/pantolon', isDiscount: true },
                        { name: 'Ayakkabı', path: '/kadin/indirim/ayakkabi', isDiscount: true, badge: 'SON GÜN' },
                        { name: 'Çanta', path: '/kadin/indirim/canta', isDiscount: true }
                    ]
                },
                {
                    title: 'GİYİM',
                    items: [
                        { name: 'Elbise', path: '/kadin/giyim/elbise' },
                        { name: 'Tişört', path: '/kadin/giyim/tisort' },
                        { name: 'Gömlek', path: '/kadin/giyim/gomlek' },
                        { name: 'Pantolon', path: '/kadin/giyim/pantolon' },
                        { name: 'Etek', path: '/kadin/giyim/etek' },
                        { name: 'Ceket', path: '/kadin/giyim/ceket' },
                        { name: 'Mont & Kaban', path: '/kadin/giyim/mont-kaban' }
                    ]
                },
                {
                    title: 'AKSESUAR',
                    items: [
                        { name: 'Takı', path: '/kadin/aksesuar/taki' },
                        { name: 'Saat', path: '/kadin/aksesuar/saat' },
                        { name: 'Şal & Eşarp', path: '/kadin/aksesuar/sal-esarp' },
                        { name: 'Kemer', path: '/kadin/aksesuar/kemer' }
                    ]
                },
                {
                    title: 'ÇANTA',
                    items: [
                        { name: 'Omuz Çantası', path: '/kadin/canta/omuz-cantasi' },
                        { name: 'Sırt Çantası', path: '/kadin/canta/sirt-cantasi' },
                        { name: 'El Çantası', path: '/kadin/canta/el-cantasi' },
                        { name: 'Alışveriş Çantası', path: '/kadin/canta/alisveris-cantasi' }
                    ]
                },
                {
                    title: 'AYAKKABI',
                    items: [
                        { name: 'Topuklu', path: '/kadin/ayakkabi/topuklu' },
                        { name: 'Sneakers', path: '/kadin/ayakkabi/sneakers' },
                        { name: 'Bot', path: '/kadin/ayakkabi/bot' },
                        { name: 'Sandalet', path: '/kadin/ayakkabi/sandalet' }
                    ]
                }
            ]
        },
        'erkek': {
            title: 'Erkek',
            sections: [
                {
                    title: 'İNDİRİM',
                    isDiscount: true,
                    items: [
                        { name: 'Tişört', path: '/erkek/indirim/tisort', isDiscount: true },
                        { name: 'Gömlek', path: '/erkek/indirim/gomlek', isDiscount: true },
                        { name: 'Pantolon', path: '/erkek/indirim/pantolon', isDiscount: true },
                        { name: 'Ayakkabı', path: '/erkek/indirim/ayakkabi', isDiscount: true },
                        { name: 'Ceket', path: '/erkek/indirim/ceket', isDiscount: true }
                    ]
                },
                {
                    title: 'GİYİM',
                    items: [
                        { name: 'Tişört', path: '/erkek/giyim/tisort' },
                        { name: 'Gömlek', path: '/erkek/giyim/gomlek' },
                        { name: 'Pantolon', path: '/erkek/giyim/pantolon' },
                        { name: 'Ceket', path: '/erkek/giyim/ceket' },
                        { name: 'Mont & Kaban', path: '/erkek/giyim/mont-kaban' },
                        { name: 'Takım Elbise', path: '/erkek/giyim/takim-elbise' }
                    ]
                },
                {
                    title: 'Çanta',
                    items: [
                        { name: 'Sırt Çantası', path: '/erkek/canta/sirt-cantasi' },
                        { name: 'Evrak Çantası', path: '/erkek/canta/evrak-cantasi' },
                        { name: 'Spor Çanta', path: '/erkek/canta/spor-canta' }
                    ]
                },
                {
                    title: 'Ayakkabı',
                    items: [
                        { name: 'Sneakers', path: '/erkek/ayakkabi/sneakers' },
                        { name: 'Klasik', path: '/erkek/ayakkabi/klasik' },
                        { name: 'Bot', path: '/erkek/ayakkabi/bot' }
                    ]
                },
                {
                    title: 'Aksesuar',
                    items: [
                        { name: 'Saat', path: '/erkek/aksesuar/saat' },
                        { name: 'Kemer', path: '/erkek/aksesuar/kemer' },
                        { name: 'Kravat', path: '/erkek/aksesuar/kravat' },
                        { name: 'Cüzdan', path: '/erkek/aksesuar/cuzdan' }
                    ]
                }
            ]
        },
        'cocuk': {
            title: 'Çocuk',
            sections: [
                {
                    title: 'İNDİRİM',
                    isDiscount: true,
                    items: [
                        { name: 'Tişört', path: '/cocuk/indirim/tisort', isDiscount: true },
                        { name: 'Elbise', path: '/cocuk/indirim/elbise', isDiscount: true },
                        { name: 'Pantolon', path: '/cocuk/indirim/pantolon', isDiscount: true },
                        { name: 'Ayakkabı', path: '/cocuk/indirim/ayakkabi', isDiscount: true },
                        { name: 'Okul Ürünleri', path: '/cocuk/indirim/okul-urunleri', isDiscount: true }
                    ]
                },
                {
                    title: 'GİYİM',
                    items: [
                        { name: 'Tişört', path: '/cocuk/giyim/tisort' },
                        { name: 'Sweatshirt', path: '/cocuk/giyim/sweatshirt' },
                        { name: 'Pantolon', path: '/cocuk/giyim/pantolon' },
                        { name: 'Elbise', path: '/cocuk/giyim/elbise' },
                        { name: 'Mont & Kaban', path: '/cocuk/giyim/mont-kaban' }
                    ]
                },
                {
                    title: 'Çanta',
                    items: [
                        { name: 'Okul Çantası', path: '/cocuk/canta/okul-cantasi' },
                        { name: 'Sırt Çantası', path: '/cocuk/canta/sirt-cantasi' },
                        { name: 'Beslenme Çantası', path: '/cocuk/canta/beslenme-cantasi' }
                    ]
                },
                {
                    title: 'Ayakkabı',
                    items: [
                        { name: 'Sneakers', path: '/cocuk/ayakkabi/sneakers' },
                        { name: 'Bot', path: '/cocuk/ayakkabi/bot' },
                        { name: 'Sandalet', path: '/cocuk/ayakkabi/sandalet' }
                    ]
                },
                {
                    title: 'Aksesuar',
                    items: [
                        { name: 'Şapka', path: '/cocuk/aksesuar/sapka' },
                        { name: 'Çorap', path: '/cocuk/aksesuar/corap' },
                        { name: 'Eldiven', path: '/cocuk/aksesuar/eldiven' }
                    ]
                }
            ]
        }
    };

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            dispatch(resetCart());
            navigate('/login');
            toast.success('Başarıyla çıkış yapıldı');
        } catch (err) {
            toast.error(err?.data?.message || 'Çıkış yapılırken bir hata oluştu');
        }
    };

    return (
        <>
            <header className="bg-white border-b border-gray-200">
                <div className="mx-auto">
                    {/* Ana Menü */}
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0 pl-4">
                            <Link to="/">
                                <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
                            </Link>
                        </div>

                        <nav className="flex-1 flex justify-center">
                            <div className="flex items-center space-x-16 ml-32">
                                {Object.keys(categories).map(key => (
                                    <div
                                        key={key}
                                        className="relative group"
                                        onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                                    >
                                        <button className="py-6 text-sm font-medium text-gray-700 hover:text-black transition-colors">
                                            {categories[key].title}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </nav>

                        <div className="flex items-center space-x-6 pr-4">
                            {/* Arama Çubuğu */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ürün Ara"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                        }
                                    }}
                                    className="w-64 pl-10 pr-4 py-2 text-sm border-none rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Hesap Menüsü */}
                            <div className="flex items-center space-x-3">
                                <Menu as="div" className="relative">
                                    <Menu.Button
                                        className="group inline-flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        onClick={() => !userInfo && navigate('/login')}
                                    >
                                        <svg
                                            className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                            />
                                        </svg>
                                        {!userInfo && (
                                            <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                                                Oturum Aç
                                            </span>
                                        )}
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                {userInfo ? (
                                                    <>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link
                                                                    to="/account"
                                                                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    Hesabım
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                        {userInfo.isAdmin && (
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <Link
                                                                        to="/admin/dashboard"
                                                                        className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                                    >
                                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                                                        </svg>
                                                                        Admin Panel
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                        )}
                                                        {userInfo.isAdmin && (
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <Link
                                                                        to="/admin/discounts"
                                                                        className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                                    >
                                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                                        </svg>
                                                                        İndirim Yönetimi
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                        )}
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={handleLogout}
                                                                    className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                                                    </svg>
                                                                    Çıkış Yap
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link
                                                                    to="/login"
                                                                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                                                    </svg>
                                                                    Giriş Yap
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link
                                                                    to="/register"
                                                                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                                                    </svg>
                                                                    Kayıt Ol
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    </>
                                                )}
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>

                                {/* Favori İkonu */}
                                <Link
                                    to="/account/favorites"
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <HeartIcon className="w-6 h-6 text-gray-700 hover:text-black transition-colors" />
                                </Link>

                                <button
                                    onClick={() => setShowCart(true)}
                                    className="text-gray-700 hover:text-black relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mega Menü */}
                    <div
                        ref={megaMenuRef}
                        className={`absolute left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50 transform transition-all duration-300 ease-in-out ${activeMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                            }`}
                    >
                        <div className="max-w-7xl mx-auto px-8 py-12">
                            <div className="grid grid-cols-5 gap-x-8">
                                {activeMenu && categories[activeMenu]?.sections.map((section, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <h3 className={`text-sm font-bold tracking-wide uppercase pb-4 ${section.isDiscount ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                            {section.title}
                                        </h3>
                                        <ul className="flex flex-col space-y-3">
                                            {section.items.map((item, itemIdx) => (
                                                <li key={itemIdx}>
                                                    <Link
                                                        to={item.path}
                                                        className={`inline-flex items-center text-sm ${item.isDiscount
                                                            ? 'text-red-600 hover:text-red-700 font-medium'
                                                            : 'text-gray-600 hover:text-black'
                                                            } transition-colors`}
                                                        onClick={() => setActiveMenu(null)}
                                                    >
                                                        <span>{item.name}</span>
                                                        {item.badge && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sepet Drawer */}
            <div className={`fixed inset-0 z-50 ${showCart ? '' : 'pointer-events-none'}`}>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-black transition-opacity duration-300 ${showCart ? 'opacity-30' : 'opacity-0'
                        }`}
                    onClick={() => setShowCart(false)}
                />

                {/* Drawer */}
                <div
                    className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-medium">Sepetim ({cartItems.length})</h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="p-1 text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-gray-500 mb-4">Sepetiniz boş</p>
                                    <button
                                        onClick={() => setShowCart(false)}
                                        className="text-sm text-black hover:underline"
                                    >
                                        Alışverişe Başla
                                    </button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={`${item._id}-${item.selectedSize}`} className="flex gap-6 pb-6 border-b last:border-0">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="h-32 w-24 object-cover object-center rounded-md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                                    <div className="mt-2 flex flex-col space-y-2">
                                                        {item.selectedSize && (
                                                            <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 w-fit">
                                                                Beden: {item.selectedSize}
                                                            </div>
                                                        )}
                                                        {item.color && (
                                                            <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 w-fit">
                                                                Renk: {item.color}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center border border-gray-200 rounded">
                                                    <button
                                                        onClick={() => {
                                                            const newQty = Math.max(1, (item.qty || 1) - 1);
                                                            dispatch(addToCart({ ...item, qty: newQty }));
                                                        }}
                                                        className="px-2 py-1 text-gray-600 hover:text-black transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.qty || 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newQty = Math.min(10, (item.qty || 1) + 1);
                                                            dispatch(addToCart({ ...item, qty: newQty }));
                                                        }}
                                                        className="px-2 py-1 text-gray-600 hover:text-black transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => dispatch(removeFromCart({ _id: item._id, selectedSize: item.selectedSize }))}
                                                    className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Kaldır
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Drawer Footer */}
                        {cartItems.length > 0 && (
                            <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <p className="text-gray-500">Ara Toplam</p>
                                        <p className="font-medium">
                                            {cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0).toLocaleString('tr-TR')} TL
                                        </p>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <p className="text-gray-500">Kargo</p>
                                        <p className="font-medium">
                                            {cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0) > 150 ? 'Ücretsiz' : '14.99 TL'}
                                        </p>
                                    </div>
                                    {cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0) <= 150 && (
                                        <p className="text-xs text-gray-500">
                                            150 TL üzeri alışverişlerde kargo ücretsiz!
                                        </p>
                                    )}
                                    <div className="flex justify-between text-base font-medium pt-2 border-t">
                                        <p>Toplam</p>
                                        <p>
                                            {(cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0) +
                                                (cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0) > 150 ? 0 : 14.99)).toLocaleString('tr-TR')} TL
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Link
                                        to="/cart"
                                        onClick={() => setShowCart(false)}
                                        className="w-full block text-center px-6 py-3 text-sm font-medium text-black bg-white border border-black hover:bg-gray-50"
                                    >
                                        Sepete Git
                                    </Link>
                                    <Link
                                        to="/shipping"
                                        onClick={() => setShowCart(false)}
                                        className="w-full block text-center px-6 py-3 text-sm font-medium text-white bg-black hover:bg-gray-900"
                                    >
                                        Ödemeye Geç
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header; 