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
    getProductStats,
    removeProductImage,
    setPrimaryImage
} = require('../controllers/productController');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { uploadProductImages, uploadProductImage, handleUploadError } = require('../middleware/upload');
const { 
    productValidation, 
    productUpdateValidation,
    mongoIdValidation,
    paginationValidation 
} = require('../middleware/validation');

// Debug route to verify image routes are loaded
router.get('/debug/routes', (req, res) => {
    res.json({ message: 'Products routes loaded with image management', timestamp: new Date().toISOString() });
});

// Public routes
router.get('/', optionalAuth, paginationValidation, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', paginationValidation, searchProducts);
router.get('/category/:category', paginationValidation, getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);

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

// Image management routes (MUST come before /:id route to avoid route conflicts)
router.delete('/:id/images/:imageId', authenticate, authorizeAdmin, mongoIdValidation, removeProductImage);
router.put('/:id/images/:imageId/primary', authenticate, authorizeAdmin, mongoIdValidation, setPrimaryImage);

// Product CRUD routes (these come after more specific routes)
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
router.get('/:id', optionalAuth, mongoIdValidation, getProduct);

module.exports = router;

