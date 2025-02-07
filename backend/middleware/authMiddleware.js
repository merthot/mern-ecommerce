import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Kullanıcı kimlik doğrulama
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // İmzalı cookie'den token'ı al
    token = req.signedCookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('Token doğrulama hatası:', error);
            res.status(401);
            throw new Error('Yetkisiz erişim, token geçersiz');
        }
    } else {
        console.error('Token bulunamadı. Cookies:', req.cookies, 'Signed Cookies:', req.signedCookies);
        res.status(401);
        throw new Error('Yetkisiz erişim, token bulunamadı');
    }
});

// Admin kontrolü
export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Yetkisiz erişim, admin değilsiniz');
    }
}; 