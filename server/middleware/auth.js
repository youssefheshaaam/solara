const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - verifies JWT token or session
const authenticate = async (req, res, next) => {
    try {
        // Check for session user first (primary for EJS pages)
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user && user.isActive) {
                req.user = user;
                res.locals.user = user.toObject(); // Make available to EJS templates
                return next();
            }
        }

        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            // Check if it's an API request or page request
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    error: 'Access denied. Please login to continue.'
                });
            } else {
                // For EJS pages, redirect to login
                return res.redirect('/login?error=Please login to continue');
            }
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'solara-jwt-secret');

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found. Please login again.'
                });
            } else {
                return res.redirect('/login?error=User not found');
            }
        }

        if (!user.isActive) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    error: 'Account is deactivated. Please contact support.'
                });
            } else {
                return res.redirect('/login?error=Account is deactivated');
            }
        }

        // Attach user to request
        req.user = user;
        res.locals.user = user.toObject(); // Make available to EJS templates
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token. Please login again.'
                });
            } else {
                return res.redirect('/login?error=Invalid session');
            }
        }
        if (error.name === 'TokenExpiredError') {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired. Please login again.'
                });
            } else {
                return res.redirect('/login?error=Session expired');
            }
        }
        console.error('Auth middleware error:', error);
        if (req.path.startsWith('/api/')) {
            res.status(500).json({
                success: false,
                error: 'Authentication failed'
            });
        } else {
            res.redirect('/login?error=Authentication failed');
        }
    }
};

// Optional authentication - doesn't require auth but attaches user if available
const optionalAuth = async (req, res, next) => {
    try {
        // Initialize res.locals.user to null by default
        res.locals.user = null;
        
        // Check for session user first (primary for EJS pages)
        if (req.session && req.session.userId) {
            try {
                const user = await User.findById(req.session.userId).select('-password');
                if (user && user.isActive) {
                    req.user = user;
                    // Convert Mongoose document to plain object for EJS templates
                    res.locals.user = user.toObject ? user.toObject() : user;
                }
            } catch (dbError) {
                // Database error - continue without user
                console.error('OptionalAuth DB error:', dbError);
                res.locals.user = null;
            }
            return next();
        }

        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'solara-jwt-secret');
                const user = await User.findById(decoded.id).select('-password');
                if (user && user.isActive) {
                    req.user = user;
                    res.locals.user = user.toObject ? user.toObject() : user;
                }
            } catch (err) {
                // Token invalid or DB error - continue without user
                res.locals.user = null;
            }
        }

        next();
    } catch (error) {
        // On any error, continue without user and log the error
        console.error('OptionalAuth error:', error);
        res.locals.user = null;
        next();
    }
};

// Admin authorization middleware - must be used after authenticate
const authorizeAdmin = (req, res, next) => {
    // authenticate middleware should have already set req.user
    if (!req.user) {
        // If no user, redirect to login (authenticate should have caught this, but just in case)
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        } else {
            return res.redirect('/login?error=Please login to access admin panel');
        }
    }
    
    if (req.user.role !== 'admin') {
        // User is logged in but not admin
        if (req.path.startsWith('/api/')) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        } else {
            return res.redirect('/login?error=Admin privileges required');
        }
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

