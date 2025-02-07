import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

// Cloudinary yapılandırması
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

// Yapılandırmayı kontrol et
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    console.error('Cloudinary yapılandırması eksik:', {
        cloud_name: !!cloudinaryConfig.cloud_name,
        api_key: !!cloudinaryConfig.api_key,
        api_secret: !!cloudinaryConfig.api_secret
    });
    throw new Error('Cloudinary yapılandırması eksik');
}

cloudinary.config(cloudinaryConfig);

export const uploadToCloudinary = async (base64Image) => {
    try {
        if (!base64Image) {
            throw new Error('Görsel verisi bulunamadı');
        }

        // Base64 formatını kontrol et
        if (!base64Image.startsWith('data:image')) {
            throw new Error('Geçersiz görsel formatı');
        }

        // Base64'ten dosya formatını çıkar
        const format = base64Image.split(';')[0].split('/')[1];

        console.log('Cloudinary yükleme başlıyor...');
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'mern-ecommerce',
            resource_type: 'image',
            format: format,
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });
        console.log('Cloudinary yükleme başarılı:', result.secure_url);

        if (!result || !result.secure_url) {
            throw new Error('Cloudinary yanıtı geçersiz');
        }

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary yükleme hatası:', error);

        if (error.message.includes('File size too large')) {
            throw new Error('Görsel boyutu çok büyük');
        }

        if (error.message.includes('Invalid image file')) {
            throw new Error('Geçersiz görsel dosyası');
        }

        throw new Error(`Görsel yüklenirken bir hata oluştu: ${error.message}`);
    }
};

export default cloudinary; 