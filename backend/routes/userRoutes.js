import express from 'express';
import {
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
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:id', protect, toggleFavorite);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Adres yönetimi route'ları
router.route('/addresses')
    .get(protect, getAddresses)
    .post(protect, addAddress);
router.route('/addresses/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

export default router; 