import { Link, useParams, useLocation } from 'react-router-dom';

const CategoryMenu = () => {
    const { category, subcategory } = useParams();
    const location = useLocation();

    const allCategories = {
        'kadin': {
            'giyim': {
                title: 'GİYİM',
                items: [
                    { path: '/kadin/giyim/elbise', label: 'Elbise' },
                    { path: '/kadin/giyim/tisort', label: 'Tişört' },
                    { path: '/kadin/giyim/gomlek', label: 'Gömlek' },
                    { path: '/kadin/giyim/pantolon', label: 'Pantolon' },
                    { path: '/kadin/giyim/etek', label: 'Etek' },
                    { path: '/kadin/giyim/ceket', label: 'Ceket' },
                    { path: '/kadin/giyim/mont-kaban', label: 'Mont & Kaban' }
                ]
            },
            'canta': {
                title: 'ÇANTA',
                items: [
                    { path: '/kadin/canta/omuz-cantasi', label: 'Omuz Çantası' },
                    { path: '/kadin/canta/sirt-cantasi', label: 'Sırt Çantası' },
                    { path: '/kadin/canta/el-cantasi', label: 'El Çantası' },
                    { path: '/kadin/canta/alisveris-cantasi', label: 'Alışveriş Çantası' }
                ]
            },
            'ayakkabi': {
                title: 'AYAKKABI',
                items: [
                    { path: '/kadin/ayakkabi/topuklu', label: 'Topuklu' },
                    { path: '/kadin/ayakkabi/sneakers', label: 'Sneakers' },
                    { path: '/kadin/ayakkabi/bot', label: 'Bot' },
                    { path: '/kadin/ayakkabi/sandalet', label: 'Sandalet' }
                ]
            },
            'aksesuar': {
                title: 'AKSESUAR',
                items: [
                    { path: '/kadin/aksesuar/taki', label: 'Takı' },
                    { path: '/kadin/aksesuar/saat', label: 'Saat' },
                    { path: '/kadin/aksesuar/sal-esarp', label: 'Şal & Eşarp' },
                    { path: '/kadin/aksesuar/kemer', label: 'Kemer' }
                ]
            }
        },
        'erkek': {
            'giyim': {
                title: 'GİYİM',
                items: [
                    { path: '/erkek/giyim/tisort', label: 'Tişört' },
                    { path: '/erkek/giyim/gomlek', label: 'Gömlek' },
                    { path: '/erkek/giyim/pantolon', label: 'Pantolon' },
                    { path: '/erkek/giyim/ceket', label: 'Ceket' },
                    { path: '/erkek/giyim/mont-kaban', label: 'Mont & Kaban' },
                    { path: '/erkek/giyim/takim-elbise', label: 'Takım Elbise' }
                ]
            },
            'canta': {
                title: 'ÇANTA',
                items: [
                    { path: '/erkek/canta/sirt-cantasi', label: 'Sırt Çantası' },
                    { path: '/erkek/canta/evrak-cantasi', label: 'Evrak Çantası' },
                    { path: '/erkek/canta/spor-canta', label: 'Spor Çanta' }
                ]
            },
            'ayakkabi': {
                title: 'AYAKKABI',
                items: [
                    { path: '/erkek/ayakkabi/sneakers', label: 'Sneakers' },
                    { path: '/erkek/ayakkabi/klasik', label: 'Klasik' },
                    { path: '/erkek/ayakkabi/bot', label: 'Bot' }
                ]
            },
            'aksesuar': {
                title: 'AKSESUAR',
                items: [
                    { path: '/erkek/aksesuar/saat', label: 'Saat' },
                    { path: '/erkek/aksesuar/kemer', label: 'Kemer' },
                    { path: '/erkek/aksesuar/kravat', label: 'Kravat' },
                    { path: '/erkek/aksesuar/cuzdan', label: 'Cüzdan' }
                ]
            }
        },
        'cocuk': {
            'giyim': {
                title: 'GİYİM',
                items: [
                    { path: '/cocuk/giyim/tisort', label: 'Tişört' },
                    { path: '/cocuk/giyim/sweatshirt', label: 'Sweatshirt' },
                    { path: '/cocuk/giyim/pantolon', label: 'Pantolon' },
                    { path: '/cocuk/giyim/elbise', label: 'Elbise' },
                    { path: '/cocuk/giyim/mont-kaban', label: 'Mont & Kaban' }
                ]
            },
            'canta': {
                title: 'ÇANTA',
                items: [
                    { path: '/cocuk/canta/okul-cantasi', label: 'Okul Çantası' },
                    { path: '/cocuk/canta/sirt-cantasi', label: 'Sırt Çantası' },
                    { path: '/cocuk/canta/beslenme-cantasi', label: 'Beslenme Çantası' }
                ]
            },
            'ayakkabi': {
                title: 'AYAKKABI',
                items: [
                    { path: '/cocuk/ayakkabi/sneakers', label: 'Sneakers' },
                    { path: '/cocuk/ayakkabi/bot', label: 'Bot' },
                    { path: '/cocuk/ayakkabi/sandalet', label: 'Sandalet' }
                ]
            },
            'aksesuar': {
                title: 'AKSESUAR',
                items: [
                    { path: '/cocuk/aksesuar/sapka', label: 'Şapka' },
                    { path: '/cocuk/aksesuar/corap', label: 'Çorap' },
                    { path: '/cocuk/aksesuar/eldiven', label: 'Eldiven' }
                ]
            }
        }
    };

    // URL'den kategori ve alt kategoriyi al
    const currentMainCategory = category || 'kadin';
    const currentSubCategory = subcategory || 'giyim';

    const categories = allCategories[currentMainCategory];
    if (!categories) return null;

    const categoryData = categories[currentSubCategory];
    if (!categoryData) return null;

    return (
        <div className="border-b border-gray-200">
            <div className="flex items-center px-4">
                <h2 className="text-lg font-medium py-2 mr-8">
                    {categoryData.title}
                </h2>
                <div className="flex items-center overflow-x-auto whitespace-nowrap">
                    {categoryData.items.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`text-xs px-4 py-4 hover:text-black transition-colors ${location.pathname === item.path
                                ? 'text-black font-medium border-b-2 border-black'
                                : 'text-gray-600'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryMenu; 