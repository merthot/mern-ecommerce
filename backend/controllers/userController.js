import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    Kullanıcı girişi & token alma
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        // Token'ı cookie olarak gönder
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
            path: '/',
            signed: true
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } else {
        res.status(401);
        throw new Error('Geçersiz e-posta veya şifre');
    }
});

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Bu e-posta adresi zaten kullanımda');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        const token = generateToken(user._id);

        // Token'ı cookie olarak gönder
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
            path: '/',
            signed: true // İmzalı cookie kullanımı
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } else {
        res.status(400);
        throw new Error('Geçersiz kullanıcı bilgileri');
    }
});

// @desc    Kullanıcı profilini getir
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            phone: user.phone,
            address: user.address,
        });
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Kullanıcı profilini güncelle
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        const token = generateToken(updatedUser._id);

        // Token'ı cookie olarak güncelle
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
            path: '/',
            signed: true
        });

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            phone: updatedUser.phone,
            address: updatedUser.address
        });
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Kullanıcı çıkışı
// @route   POST /api/users/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Başarıyla çıkış yapıldı' });
});

// @desc    Favori ürün ekle/çıkar
// @route   POST /api/users/favorites/:id
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    if (user) {
        const isProductFavorited = user.favorites.includes(productId);

        if (isProductFavorited) {
            // Favorilerden çıkar
            user.favorites = user.favorites.filter(id => id.toString() !== productId);
        } else {
            // Favorilere ekle
            user.favorites.push(productId);
        }

        await user.save();
        res.json({ favorites: user.favorites });
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Favori ürünleri getir
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');

    if (user) {
        res.json(user.favorites);
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Şifre sıfırlama e-postası gönder
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı');
    }

    // Sıfırlama token'ı oluştur
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Sıfırlama URL'i oluştur
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // E-posta içeriği
    const html = `
        <h1>Şifre Sıfırlama İsteği</h1>
        <p>Merhaba ${user.name},</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Şifremi Sıfırla</a>
        <p>Bu bağlantı 30 dakika süreyle geçerlidir.</p>
        <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Şifre Sıfırlama İsteği',
            html,
        });

        res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500);
        throw new Error('E-posta gönderilemedi');
    }
});

// @desc    Şifreyi sıfırla
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Token'ı hash'le
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Geçersiz veya süresi dolmuş token');
    }

    // Yeni şifreyi ayarla
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Şifre başarıyla güncellendi' });
});

// @desc    Kullanıcının adreslerini getir
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json(user.addresses);
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Yeni adres ekle
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const newAddress = {
            id: crypto.randomUUID(),
            ...req.body
        };

        // Eğer yeni adres varsayılan olarak işaretlendiyse, diğer adreslerin varsayılan durumunu kaldır
        if (newAddress.isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // Eğer bu ilk adres ise, varsayılan olarak işaretle
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json(newAddress);
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Adres güncelle
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const addressIndex = user.addresses.findIndex(a => a.id === req.params.id);
        if (addressIndex > -1) {
            // Eğer güncellenen adres varsayılan olarak işaretlendiyse, diğer adreslerin varsayılan durumunu kaldır
            if (req.body.isDefault) {
                user.addresses.forEach(addr => {
                    addr.isDefault = false;
                });
            }

            user.addresses[addressIndex] = {
                ...user.addresses[addressIndex],
                ...req.body,
                id: req.params.id
            };

            await user.save();
            res.json(user.addresses[addressIndex]);
        } else {
            res.status(404);
            throw new Error('Adres bulunamadı');
        }
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

// @desc    Adres sil
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const addressIndex = user.addresses.findIndex(a => a.id === req.params.id);
        if (addressIndex > -1) {
            const deletedAddress = user.addresses[addressIndex];
            user.addresses.splice(addressIndex, 1);

            // Eğer silinen adres varsayılan adres ise ve başka adres varsa, ilk adresi varsayılan yap
            if (deletedAddress.isDefault && user.addresses.length > 0) {
                user.addresses[0].isDefault = true;
            }

            await user.save();
            res.json({ message: 'Adres başarıyla silindi' });
        } else {
            res.status(404);
            throw new Error('Adres bulunamadı');
        }
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
});

export {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    logout,
    toggleFavorite,
    getFavorites,
    forgotPassword,
    resetPassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
}; 