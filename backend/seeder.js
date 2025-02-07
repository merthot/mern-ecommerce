import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const createAdminUser = async () => {
    try {
        // Önce mevcut admin kullanıcısını sil
        await User.deleteMany({ isAdmin: true });

        const adminUser = new User({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            isAdmin: true,
            phone: '',
            address: ''
        });

        await adminUser.save();

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

createAdminUser(); 