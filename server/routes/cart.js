const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    syncCart
} = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { 
    addToCartValidation,
    updateCartItemValidation,
    mongoIdValidation 
} = require('../middleware/validation');

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCartValidation, addToCart);
router.post('/sync', syncCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.put('/:productId', updateCartItemValidation, updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;

