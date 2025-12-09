const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getNewArrivals,
    getProductsByCategory,
    searchProducts,
    getProductStats
} = require('../controllers/productController');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { uploadProductImages, uploadProductImage, handleUploadError } = require('../middleware/upload');
const { 
    productValidation, 
    productUpdateValidation,
    mongoIdValidation,
    paginationValidation 
} = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, paginationValidation, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', paginationValidation, searchProducts);
router.get('/category/:category', paginationValidation, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', optionalAuth, mongoIdValidation, getProduct);

// Admin routes
router.get('/admin/stats', authenticate, authorizeAdmin, getProductStats);
router.post('/', 
    authenticate, 
    authorizeAdmin, 
    uploadProductImages, 
    handleUploadError, 
    productValidation, 
    createProduct
);
router.put('/:id', 
    authenticate, 
    authorizeAdmin, 
    mongoIdValidation,
    uploadProductImages, 
    handleUploadError, 
    productUpdateValidation, 
    updateProduct
);
router.delete('/:id', authenticate, authorizeAdmin, mongoIdValidation, deleteProduct);

module.exports = router;

