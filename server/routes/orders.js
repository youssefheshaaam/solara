const express = require('express');
const router = express.Router();
const {
    getOrders,
    getMyOrders,
    getOrder,
    getOrderByNumber,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
} = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { 
    orderValidation,
    mongoIdValidation,
    paginationValidation 
} = require('../middleware/validation');

// User routes
router.get('/my-orders', authenticate, paginationValidation, getMyOrders);
router.post('/', authenticate, orderValidation, createOrder);
router.get('/number/:orderNumber', authenticate, getOrderByNumber);
router.put('/:id/cancel', authenticate, mongoIdValidation, cancelOrder);
router.get('/:id', authenticate, mongoIdValidation, getOrder);

// Admin routes
router.get('/', authenticate, authorizeAdmin, paginationValidation, getOrders);
router.get('/admin/stats', authenticate, authorizeAdmin, getOrderStats);
router.put('/:id/status', authenticate, authorizeAdmin, mongoIdValidation, updateOrderStatus);

module.exports = router;

