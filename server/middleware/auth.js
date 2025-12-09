const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - verifies JWT token or session
const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Check for session user
        else if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user && user.isActive) {
                req.user = user;
                return next();
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Please login to continue.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'solara-jwt-secret');

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found. Please login again.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated. Please contact support.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. Please login again.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Optional authentication - doesn't require auth but attaches user if available
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user && user.isActive) {
                req.user = user;
            }
            return next();
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'solara-jwt-secret');
                const user = await User.findById(decoded.id);
                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (err) {
                // Token invalid, continue without user
            }
        }

        next();
    } catch (error) {
        next();
    }
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

// Verify ownership or admin
const verifyOwnerOrAdmin = (resourceUserIdField = 'user') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        
        if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
            return next();
        }

        res.status(403).json({
            success: false,
            error: 'Access denied. You can only access your own resources.'
        });
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    authorizeAdmin,
    authorize,
    verifyOwnerOrAdmin
};

