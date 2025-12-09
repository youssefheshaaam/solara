const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    updateUserByAdmin,
    deleteUser,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getUserStats
} = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');
const { 
    updateProfileValidation,
    mongoIdValidation,
    paginationValidation 
} = require('../middleware/validation');

// Admin routes
router.get('/', authenticate, authorizeAdmin, paginationValidation, getUsers);
router.get('/stats', authenticate, authorizeAdmin, getUserStats);
router.put('/:id/admin', authenticate, authorizeAdmin, mongoIdValidation, updateUserByAdmin);
router.delete('/:id', authenticate, authorizeAdmin, mongoIdValidation, deleteUser);

// User routes (owner only)
router.get('/:id', authenticate, mongoIdValidation, getUser);
router.put('/:id', authenticate, mongoIdValidation, uploadAvatar, handleUploadError, updateProfileValidation, updateUser);

// Address routes
router.post('/:id/addresses', authenticate, addAddress);
router.put('/:id/addresses/:addressId', authenticate, updateAddress);
router.delete('/:id/addresses/:addressId', authenticate, deleteAddress);

// Wishlist routes
router.post('/:id/wishlist', authenticate, addToWishlist);
router.delete('/:id/wishlist/:productId', authenticate, removeFromWishlist);

module.exports = router;

