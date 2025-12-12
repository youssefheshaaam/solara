const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phone, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'An account with this email already exists'
        });
    }

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        dateOfBirth,
        gender
    });

    // Generate token
    const token = user.generateAuthToken();

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.user = user.toObject(); // Store user object for EJS templates

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from user object
    user.password = undefined;

    // Check if it's a form submission (EJS) or API call (AJAX)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // Form submission - redirect
        res.redirect('/');
    } else {
        // API call - return JSON
        res.status(201).json({
            success: true,
            message: req.__('auth.registerSuccess') || 'Registration successful',
            data: {
                user,
                token
            }
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Get user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }

    // Check if account is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            error: 'Your account has been deactivated. Please contact support.'
        });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.generateAuthToken();

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.user = user.toObject(); // Store user object for EJS templates

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    user.password = undefined;

    // Check if it's a form submission (EJS) or API call (AJAX)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // Form submission - redirect
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } else {
        // API call - return JSON
        res.json({
            success: true,
            message: req.__('auth.loginSuccess') || 'Login successful',
            data: {
                user,
                token
            }
        });
    }
});

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Get user with password field
    const user = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'admin'
    }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid admin credentials'
        });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid admin credentials'
        });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.generateAuthToken();

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.isAdmin = true;
    req.session.user = user.toObject(); // Store user object for EJS templates

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 60 * 1000 // 2 hours for admin
    });

    // Remove password from response
    user.password = undefined;

    // Check if it's a form submission (EJS) or API call (AJAX)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // Form submission - redirect
        res.redirect('/admin');
    } else {
        // API call - return JSON
        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                user,
                token
            }
        });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
    });

    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('connect.sid');

    // Check if it's a form submission (EJS) or API call (AJAX)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // Form submission - redirect
        res.redirect('/');
    } else {
        // API call - return JSON
        res.json({
            success: true,
            message: req.__('auth.logoutSuccess') || 'Logged out successfully'
        });
    }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price image');

    res.json({
        success: true,
        data: user
    });
});

// @desc    Check authentication status
// @route   GET /api/auth/check
// @access  Public
exports.checkAuth = asyncHandler(async (req, res) => {
    if (req.user) {
        res.json({
            success: true,
            isAuthenticated: true,
            user: req.user
        });
    } else {
        res.json({
            success: true,
            isAuthenticated: false,
            user: null
        });
    }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
exports.refreshToken = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            error: 'Unable to refresh token'
        });
    }

    const token = user.generateAuthToken();

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        success: true,
        data: { token }
    });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Current password is incorrect'
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.generateAuthToken();

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        success: true,
        message: 'Password changed successfully',
        data: { token }
    });
});

