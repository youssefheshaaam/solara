const User = require('../models/User');

// Optional authentication middleware for EJS pages
// Populates res.locals.user if session exists, but doesn't require authentication
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

        // Check for JWT token as fallback
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
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

module.exports = optionalAuth;

