import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApiSlice';
import Loader from '../components/Loader';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
    const { data: products, isLoading } = useGetProductsQuery();

    const fadeInUp = {
        initial: { y: 60, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    // Ok ikonları için bileşenler
    function NextArrow(props) {
        const { onClick } = props;
        return (
            <button
                onClick={onClick}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-l-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        );
    }

    function PrevArrow(props) {
        const { onClick } = props;
        return (
            <button
                onClick={onClick}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-r-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
        );
    }

    if (isLoading) return <Loader />;

    // En yeni ürünleri al (son 12 ürün)
    const newArrivals = products?.products
        ? [...products.products]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 12)
        : [];

    const categories = [
        {
            title: 'Elbise',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
            link: '/kadin/giyim/elbise'
        },
        {
            title: 'Kadın Tişört',
            image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
            link: '/kadin/giyim/tisort'
        },
        {
            title: 'Erkek Gömlek',
            image: 'https://images.unsplash.com/photo-1563630423918-b58f07336ac9',
            link: '/erkek/giyim/gomlek'
        },
        {
            title: 'Ayakkabı',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
            link: '/erkek/ayakkabi/sneakers'
        },
        {
            title: 'Çanta',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
            link: '/kadin/canta/omuz-cantasi'
        },
        {
            title: 'Aksesuar',
            image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e',
            link: '/kadin/aksesuar/kolye'
        },
        {
            title: 'Pantolon',
            image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',
            link: '/erkek/giyim/pantolon'
        },
        {
            title: 'Ceket',
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
            link: '/erkek/giyim/ceket'
        }
    ];

    const categorySliderSettings = {
        ...sliderSettings,
        slidesToShow: 5,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
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

    const heroSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        fade: true,
        cssEase: 'linear',
        pauseOnHover: false,
        appendDots: dots => (
            <div style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
                <ul className="m-0 flex justify-center gap-2"> {dots} </ul>
            </div>
        ),
        customPaging: i => (
            <button className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-all duration-200" />
        )
    };

    const heroSlides = [
        {
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
            title: "Sezon Sonu İndirimi",
            description: "Tüm ürünlerde %50'ye varan indirimler",
            buttonText: "Hemen Keşfet",
            link: "/kadin/indirim/elbise"
        },
        {
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
            title: "Özel Kampanya",
            description: "Seçili ürünlerde büyük indirim fırsatı",
            buttonText: "Kampanyaları Gör",
            link: "/erkek/indirim/gomlek"
        },
        {
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
            title: "Yeni Sezon Koleksiyonu",
            description: "En yeni moda trendlerini keşfedin",
            buttonText: "Alışverişe Başla",
            link: "/kadin/giyim/canta"
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
            title: "Yeni Sezon Koleksiyonu",
            description: "En yeni moda trendlerini keşfedin",
            buttonText: "Alışverişe Başla",
            link: "/kadin/giyim/elbise"
        }
    ];

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative h-[600px] overflow-hidden"
            >
                <Slider {...heroSliderSettings}>
                    {heroSlides.map((slide, index) => (
                        <div key={index} className="relative h-[600px]">
                            <div className="absolute inset-0">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                            <div className="relative h-full flex items-center justify-center text-center">
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="space-y-8"
                                >
                                    <h1 className="text-5xl font-bold text-white">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                        {slide.description}
                                    </p>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            to={slide.link}
                                            className="inline-block bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition-colors"
                                        >
                                            {slide.buttonText}
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </motion.div>

            {/* Kategoriler */}
            <div className="space-y-8 pb-8 mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center mb-12 px-4"
                >
                    Öne Çıkan Kategoriler
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <Slider {...categorySliderSettings}>
                        {categories.map((category, index) => (
                            <div key={index} className="px-1">
                                <motion.div
                                    variants={fadeInUp}
                                    className="relative group overflow-hidden rounded-lg"
                                >
                                    <Link to={category.link}>
                                        <div className="aspect-[3/4]">
                                            <img
                                                src={category.image}
                                                alt={category.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <h3 className="text-lg font-bold text-white text-center px-2">{category.title}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </div>
                        ))}
                    </Slider>
                </motion.div>
            </div>

            {/* İlginizi Çekebilir */}
            <div className="space-y-16 pb-16 mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center mb-12 px-4"
                >
                    İlginizi Çekebilir
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <Slider {...sliderSettings}>
                        {products?.products?.slice(0, 8).map((product) => (
                            <div key={product._id} className="px-1">
                                <Link to={`/product/${product._id}`} className="block">
                                    <div className="relative aspect-[3/4] overflow-hidden">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {hasActiveDiscountForProduct(product) && (
                                            <div className="absolute top-2 left-2">
                                                <span className="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    %{getDiscountAmountForProduct(product)} İndirim
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-1 text-center px-4">
                                        <h3 className="text-sm text-gray-700">{product.name}</h3>
                                        <div className="mt-1">
                                            {hasActiveDiscountForProduct(product) ? (
                                                <>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-sm font-medium text-red-600">
                                                            {getDiscountedPriceForProduct(product).toLocaleString('tr-TR')} TL
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {product.price.toLocaleString('tr-TR')} TL
                                                        </span>
                                                    </div>

                                                </>
                                            ) : (
                                                <p className="text-sm font-medium text-gray-900">
                                                    {product.price.toLocaleString('tr-TR')} TL
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </motion.div>
            </div>

        </div>
    );
};

export default Home; 