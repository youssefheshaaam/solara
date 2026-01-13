const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errorMessages
        });
    }
    
    next();
};

// ===== USER VALIDATION RULES =====

const registerValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters'),
    
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number and special character (@$!%*?&)'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{9,14}$/).withMessage('Please enter a valid phone number'),
    
    body('dateOfBirth')
        .optional()
        .isISO8601().withMessage('Please enter a valid date')
        .custom((value) => {
            const birthDate = new Date(value);
            const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 13) {
                throw new Error('You must be at least 13 years old');
            }
            return true;
        }),
    
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
    
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidationErrors
];

const updateProfileValidation = [
    body('firstName')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters'),
    
    body('lastName')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters'),
    
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[\+]?[1-9][\d]{9,14}$/).withMessage('Please enter a valid phone number'),
    
    body('dateOfBirth')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Please enter a valid date'),
    
    body('gender')
        .optional({ checkFalsy: true })
        .isIn(['male', 'female', 'other', '']).withMessage('Invalid gender value'),
    
    handleValidationErrors
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number and special character'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your new password')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    handleValidationErrors
];

// ===== PRODUCT VALIDATION RULES =====

const productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Product name must be 3-100 characters'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .toFloat()
        .isFloat({ min: 0.01 }).withMessage('Price must be at least 0.01'),
    
    body('comparePrice')
        .optional()
        .toFloat()
        .isFloat({ min: 0 }).withMessage('Compare price must be a positive number'),
    
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['men', 'women']).withMessage('Invalid category'),
    
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Brand cannot exceed 50 characters'),
    
    body('stock')
        .optional()
        .toInt()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    
    body('sizes')
        .optional()
        .isArray().withMessage('Sizes must be an array'),
    
    body('colors')
        .optional()
        .isArray().withMessage('Colors must be an array'),
    
    body('featured')
        .optional()
        .custom((value) => {
            // Handle string 'true'/'false' from FormData
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            return false;
        }).withMessage('Featured must be true or false'),
    
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
    
    handleValidationErrors
];

const productUpdateValidation = [
    body('name')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Product name must be 3-100 characters'),
    
    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
    body('price')
        .optional({ checkFalsy: true })
        .toFloat()
        .isFloat({ min: 0.01 }).withMessage('Price must be at least 0.01'),
    
    body('category')
        .optional({ checkFalsy: true })
        .isIn(['men', 'women']).withMessage('Invalid category'),
    
    body('stock')
        .optional({ checkFalsy: true })
        .toInt()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    
    body('status')
        .optional({ checkFalsy: true })
        .isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
    
    body('featured')
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            return false;
        }).withMessage('Featured must be true or false'),
    
    handleValidationErrors
];

// ===== ORDER VALIDATION RULES =====

const orderValidation = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    
    body('items.*.product')
        .notEmpty().withMessage('Product ID is required'),
    
    body('items.*.quantity')
        .isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
    
    body('shippingAddress.firstName')
        .trim()
        .notEmpty().withMessage('First name is required'),
    
    body('shippingAddress.lastName')
        .trim()
        .notEmpty().withMessage('Last name is required'),
    
    body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Street address is required'),
    
    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('City is required'),
    
    body('shippingAddress.state')
        .trim()
        .notEmpty().withMessage('State is required'),
    
    body('shippingAddress.zipCode')
        .trim()
        .notEmpty().withMessage('Zip code is required'),
    
    body('shippingAddress.phone')
        .trim()
        .notEmpty().withMessage('Phone number is required'),
    
    body('payment.method')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['credit-card', 'debit-card', 'paypal', 'cash-on-delivery'])
        .withMessage('Invalid payment method'),
    
    handleValidationErrors
];

// ===== CART VALIDATION RULES =====

const addToCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
    
    body('size')
        .optional()
        .trim(),
    
    body('color')
        .optional()
        .trim(),
    
    handleValidationErrors
];

const updateCartItemValidation = [
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 0, max: 10 }).withMessage('Quantity must be between 0 and 10'),
    
    handleValidationErrors
];

// ===== COMMON VALIDATION RULES =====

const mongoIdValidation = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),
    
    handleValidationErrors
];

const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 10000'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    updateProfileValidation,
    changePasswordValidation,
    productValidation,
    productUpdateValidation,
    orderValidation,
    addToCartValidation,
    updateCartItemValidation,
    mongoIdValidation,
    paginationValidation
};

