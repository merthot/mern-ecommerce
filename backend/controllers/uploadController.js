import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Tekli dosya yükleme
// @route   POST /api/upload
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Lütfen bir resim dosyası yükleyin');
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'mern-ecommerce',
            width: 800,
            crop: 'scale',
        });

        // Geçici dosyayı sil
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Resim başarıyla yüklendi',
            url: result.secure_url,
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500);
        throw new Error('Resim yükleme başarısız: ' + error.message);
    }
});

// @desc    Çoklu dosya yükleme
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleImages = asyncHandler(async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            res.status(400);
            throw new Error('Lütfen resim dosyaları yükleyin');
        }

        const uploadPromises = req.files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'mern-ecommerce',
                width: 800,
                crop: 'scale',
            });
            fs.unlinkSync(file.path);
            return result.secure_url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        res.json({
            message: 'Resimler başarıyla yüklendi',
            urls: uploadedUrls,
        });
    } catch (error) {
        if (req.files) {
            req.files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(500);
        throw new Error('Resim yükleme başarısız: ' + error.message);
    }
}); 