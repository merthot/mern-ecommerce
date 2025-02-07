import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation } from '../../store/api/productApiSlice';
import { toast } from 'react-toastify';

const NewProduct = () => {
    const navigate = useNavigate();
    const [createProduct] = useCreateProductMutation();
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        images: [],
        brand: '',
        category: '',
        sizes: [],
        sizeStock: {},
        color: '',
        showColorDropdown: false,
        fabric: '',
        productDetails: '',
        modelMeasurements: '',
        careInstructions: ''
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formData.showColorDropdown && !event.target.closest('.color-dropdown')) {
                setFormData(prev => ({ ...prev, showColorDropdown: false }));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [formData.showColorDropdown]);

    const categories = [
        // Kadın Kategorileri
        'Kadın/Giyim/Elbise',
        'Kadın/Giyim/Bluz & Üst',
        'Kadın/Giyim/Tişört',
        'Kadın/Giyim/Sweatshirt',
        'Kadın/Giyim/Triko',
        'Kadın/Giyim/Ceket',
        'Kadın/Giyim/Mont & Kaban',
        'Kadın/Giyim/Pantolon',
        'Kadın/Giyim/Etek',
        'Kadın/Giyim/Plaj Giyim',
        'Kadın/Çanta/Omuz Çantası',
        'Kadın/Çanta/El Çantası',
        'Kadın/Çanta/Alışveriş Çantası',
        'Kadın/Çanta/Mini Çanta',
        'Kadın/Ayakkabı/Sneakers',
        'Kadın/Ayakkabı/Bot & Çizme',
        'Kadın/Ayakkabı/Topuklu',
        'Kadın/Ayakkabı/Sandalet',
        'Kadın/Ayakkabı/Terlik',
        'Kadın/Aksesuar/Kemer',
        'Kadın/Aksesuar/Takı',
        'Kadın/Aksesuar/Saat',
        'Kadın/Aksesuar/Gözlük',
        'Kadın/Aksesuar/Parfüm',

        // Erkek Kategorileri
        'Erkek/Giyim/Tişört',
        'Erkek/Giyim/Sweatshirt',
        'Erkek/Giyim/Triko',
        'Erkek/Giyim/Ceket',
        'Erkek/Giyim/Mont & Kaban',
        'Erkek/Giyim/Pantolon',
        'Erkek/Giyim/Gömlek',
        'Erkek/Çanta/Sırt Çantası',
        'Erkek/Çanta/El Çantası',
        'Erkek/Çanta/Laptop Çantası',
        'Erkek/Ayakkabı/Sneakers',
        'Erkek/Ayakkabı/Bot',
        'Erkek/Ayakkabı/Klasik',
        'Erkek/Ayakkabı/Loafer',
        'Erkek/Aksesuar/Kemer',
        'Erkek/Aksesuar/Saat',
        'Erkek/Aksesuar/Gözlük',
        'Erkek/Aksesuar/Parfüm',

        // Çocuk Kategorileri
        'Çocuk/Giyim/Tişört',
        'Çocuk/Giyim/Sweatshirt',
        'Çocuk/Giyim/Pantolon',
        'Çocuk/Giyim/Elbise',
        'Çocuk/Giyim/Mont & Kaban',
        'Çocuk/Ayakkabı/Sneakers',
        'Çocuk/Ayakkabı/Bot',
        'Çocuk/Ayakkabı/Sandalet',
        'Çocuk/Aksesuar/Çanta',
        'Çocuk/Aksesuar/Şapka'
    ].sort();

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSizeToggle = (size) => {
        setSelectedSizes(prev => {
            const newSizes = prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size];

            const newSizeStock = { ...formData.sizeStock };
            if (!prev.includes(size)) {
                newSizeStock[size] = 0;
            } else {
                delete newSizeStock[size];
            }

            setFormData(prevForm => ({
                ...prevForm,
                sizes: newSizes,
                sizeStock: newSizeStock
            }));
            return newSizes;
        });
    };

    const handleSizeStockChange = (size, value) => {
        setFormData(prev => ({
            ...prev,
            sizeStock: {
                ...prev.sizeStock,
                [size]: parseInt(value) || 0
            }
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxFileSize = 5 * 1024 * 1024; // 5MB

        // Dosya boyutu kontrolü
        const oversizedFiles = files.filter(file => file.size > maxFileSize);
        if (oversizedFiles.length > 0) {
            toast.error('Bazı görseller çok büyük! Maksimum dosya boyutu 5MB olmalıdır.');
            return;
        }

        // Dosya tipi kontrolü
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            toast.error('Sadece JPEG, PNG, ve WebP formatları desteklenmektedir.');
            return;
        }

        const imagePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();

                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Maksimum boyutlar
                        const maxWidth = 3000;
                        const maxHeight = 3000;

                        // Boyut oranını koru
                        if (width > height) {
                            if (width > maxWidth) {
                                height *= maxWidth / width;
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width *= maxHeight / height;
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        try {
                            // JPEG formatında ve %85 kalitede kaydet
                            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                            resolve(optimizedDataUrl);
                        } catch (error) {
                            console.error('Görsel optimizasyon hatası:', error);
                            reject(new Error('Görsel optimize edilirken bir hata oluştu'));
                        }
                    };

                    img.onerror = () => {
                        reject(new Error('Görsel yüklenirken bir hata oluştu'));
                    };

                    img.src = e.target.result;
                };

                reader.onerror = () => {
                    reject(new Error('Dosya okunamadı'));
                };

                reader.readAsDataURL(file);
            });
        });

        toast.promise(
            Promise.all(imagePromises)
                .then(optimizedImages => {
                    setImages(prev => [...prev, ...optimizedImages]);
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...optimizedImages]
                    }));
                }),
            {
                loading: 'Görseller yükleniyor...',
                success: 'Görseller başarıyla yüklendi',
                error: (err) => `Hata: ${err.message}`
            }
        );
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProduct(formData).unwrap();
            toast.success('Ürün başarıyla eklendi');
            navigate('/admin/products');
        } catch (err) {
            toast.error(err?.data?.message || 'Bir hata oluştu');
        }
    };

    return (
        <div className="container mx-auto px-8 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-medium mb-6">Yeni Ürün Ekle</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Fiyat</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white pl-8 pr-4 py-2"
                                    required
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Marka</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                                required
                            >
                                <option value="">Kategori Seçin</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Renk</label>
                            <div className="mt-1 relative color-dropdown">
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, showColorDropdown: !prev.showColorDropdown }))}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 hover:bg-white px-3 py-2 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{formData.color || 'Renk Seçin'}</span>
                                        {formData.color && (
                                            <div
                                                className={`w-6 h-6 rounded-full ${colors.find(c => c.name === formData.color)?.displayClass}`}
                                            />
                                        )}
                                    </div>
                                </div>
                                {formData.showColorDropdown && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                                        {colors.map((color) => (
                                            <div
                                                key={color.value}
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        color: color.name,
                                                        showColorDropdown: false
                                                    }));
                                                }}
                                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                                            >
                                                <span>{color.name}</span>
                                                <div
                                                    className={`w-6 h-6 rounded-full ${color.displayClass}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Bedenler ve Stok Miktarları</label>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => handleSizeToggle(size)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSizes.includes(size)
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {selectedSizes.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                    {selectedSizes.map((size) => (
                                        <div key={size} className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {size} Beden Stok
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.sizeStock[size] || 0}
                                                onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 bg-white shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Görseller</label>
                        <div className="mt-1">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image}
                                        alt={`Ürün ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ürün Açıklaması</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Kumaş Bilgisi</label>
                        <input
                            type="text"
                            name="fabric"
                            value={formData.fabric}
                            onChange={handleInputChange}
                            rows="2"
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                            placeholder="Örn: %100 Pamuk, 30/1 süprem"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ürün Detayları</label>
                        <textarea
                            name="productDetails"
                            value={formData.productDetails}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                            placeholder="Örn: Regular fit, Bisiklet yaka, Kısa kollu"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Model Ölçüleri</label>
                        <textarea
                            name="modelMeasurements"
                            value={formData.modelMeasurements}
                            onChange={handleInputChange}
                            rows="2"
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                            placeholder="Örn: Model 1.80 boyunda ve S beden giymektedir"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Yıkama Talimatları</label>
                        <textarea
                            name="careInstructions"
                            value={formData.careInstructions}
                            onChange={handleInputChange}
                            rows="2"
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 focus:bg-white hover:bg-white px-4 py-2"
                            placeholder="Örn: 30 derecede yıkayınız, Ütü kullanmayınız"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ekle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProduct; 