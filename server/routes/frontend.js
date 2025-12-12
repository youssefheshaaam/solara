const express = require('express');
const router = express.Router();
const frontendController = require('../controllers/frontendController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Apply optionalAuth to all routes to populate res.locals.user for EJS templates
router.use(optionalAuth);

// Public routes
router.get('/', frontendController.getHome);
router.get('/men', frontendController.getMen);
router.get('/women', frontendController.getWomen);
router.get('/product/:id', frontendController.getProduct);
router.get('/search', frontendController.getSearch);
router.get('/login', frontendController.getLogin);
router.get('/register', frontendController.getRegister);

// Protected routes (require authentication)
router.get('/cart', authenticate, frontendController.getCart);
router.get('/checkout', authenticate, frontendController.getCheckout);
router.get('/orders', authenticate, frontendController.getOrders);
router.get('/profile', authenticate, frontendController.getProfile);
router.get('/wishlist', authenticate, frontendController.getWishlist);

// Admin route (require admin authentication)
router.get('/admin', authenticate, authorizeAdmin, frontendController.getAdmin);

// Contact page (static, can be added later)
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us - SOLARA',
        currentPage: 'contact'
    });
});

// 404 handler for frontend routes
// Exclude static files and API routes
router.get('*', (req, res, next) => {
    // Don't handle API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    // Don't handle static files (images, CSS, JS, etc.)
    const staticExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'];
    if (staticExtensions.some(ext => req.path.toLowerCase().endsWith(ext))) {
        return next();
    }
    // Handle as 404 page
    frontendController.get404(req, res, next);
});

module.exports = router;

