import Product from '../models/productModel.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Tüm ürünleri getir
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});

    // Kullanıcı giriş yapmışsa, favori durumlarını kontrol et
    if (req.user) {
        const user = await User.findById(req.user._id);
        const productsWithFavorites = products.map(product => {
            const productObj = product.toObject();
            productObj.isFavorited = user.favorites.includes(product._id);
            return productObj;
        });
        res.json({ products: productsWithFavorites });
    } else {
        res.json({ products });
    }
});

// @desc    Tekil ürün getir
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Kullanıcı giriş yapmışsa, favori durumunu kontrol et
        if (req.user) {
            const user = await User.findById(req.user._id);
            const productObj = product.toObject();
            productObj.isFavorited = user.favorites.includes(product._id);
            res.json(productObj);
        } else {
            res.json(product);
        }
    } else {
        res.status(404);
        throw new Error('Ürün bulunamadı');
    }
});

// @desc    Yeni ürün oluştur
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        images,
        brand,
        category,
        sizes,
        sizeStock,
        color,
        fabric,
        productDetails,
        modelMeasurements,
        careInstructions,
    } = req.body;

    const product = new Product({
        user: req.user._id,
        name,
        price,
        description,
        images,
        brand,
        category,
        sizes,
        sizeStock,
        color,
        fabric,
        productDetails,
        modelMeasurements,
        careInstructions,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Ürün güncelle
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        images,
        brand,
        category,
        sizes,
        sizeStock,
        color,
        fabric,
        productDetails,
        modelMeasurements,
        careInstructions,
        discount
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.images = images;
        product.brand = brand;
        product.category = category;
        product.sizes = sizes;
        product.sizeStock = sizeStock;
        product.color = color;
        product.fabric = fabric;
        product.productDetails = productDetails;
        product.modelMeasurements = modelMeasurements;
        product.careInstructions = careInstructions;

        // İndirim bilgilerini güncelle
        if (discount) {
            product.discount = {
                type: discount.type || 'percentage',
                amount: discount.amount || 0,
                startDate: discount.startDate || null,
                endDate: discount.endDate || null,
                isActive: discount.isActive || false
            };

            // İndirimli fiyatı hesapla
            if (product.discount.isActive) {
                if (product.discount.type === 'percentage') {
                    product.discountedPrice = product.price * (1 - product.discount.amount / 100);
                } else {
                    product.discountedPrice = Math.max(product.price - product.discount.amount, 0);
                }
            } else {
                product.discountedPrice = product.price;
            }
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Ürün bulunamadı');
    }
});

// @desc    Ürün sil
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Ürün silindi' });
        } else {
            res.status(404).json({ message: 'Ürün bulunamadı' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}; 