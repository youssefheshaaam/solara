const express = require('express');
const router = express.Router();
const {
    register,
    login,
    adminLogin,
    logout,
    getMe,
    checkAuth,
    refreshToken,
    changePassword
} = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { 
    registerValidation, 
    loginValidation,
    changePasswordValidation 
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, adminLogin);
router.get('/check', optionalAuth, checkAuth);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', authenticate, refreshToken);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

module.exports = router;

