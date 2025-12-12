const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper function to get image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
        return imagePath;
    }
    return `/${imagePath}`;
};

// @desc    Render home page
// @route   GET /
// @access  Public
exports.getHome = asyncHandler(async (req, res) => {
    // Fetch featured products
    const featuredProducts = await Product.find({ 
        status: 'active', 
        featured: true 
    }).limit(8).sort({ createdAt: -1 });

    // Fetch new arrivals
    const newArrivals = await Product.find({ 
        status: 'active' 
    }).limit(8).sort({ createdAt: -1 });

    // Fetch best sellers (products with highest ratings or most orders)
    const bestSellers = await Product.find({ 
        status: 'active' 
    }).limit(8).sort({ 'ratings.average': -1 });

    res.render('pages/index', {
        title: 'SOLARA - Modern Minimal Luxury',
        currentPage: 'home',
        featuredProducts: featuredProducts.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        })),
        newArrivals: newArrivals.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        })),
        bestSellers: bestSellers.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        }))
    });
});

// @desc    Render men's products page
// @route   GET /men
// @access  Public
exports.getMen = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortOption = {};
    switch (sort) {
        case 'price-low':
            sortOption = { price: 1 };
            break;
        case 'price-high':
            sortOption = { price: -1 };
            break;
        case 'name-asc':
            sortOption = { name: 1 };
            break;
        case 'name-desc':
            sortOption = { name: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
        Product.find({ 
            status: 'active', 
            category: 'men' 
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
        Product.countDocuments({ status: 'active', category: 'men' })
    ]);

    res.render('pages/men', {
        title: 'Men\'s Collection - SOLARA',
        currentPage: 'men',
        products: products.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        })),
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalProducts: total,
            hasMore: skip + products.length < total
        }
    });
});

// @desc    Render women's products page
// @route   GET /women
// @access  Public
exports.getWomen = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortOption = {};
    switch (sort) {
        case 'price-low':
            sortOption = { price: 1 };
            break;
        case 'price-high':
            sortOption = { price: -1 };
            break;
        case 'name-asc':
            sortOption = { name: 1 };
            break;
        case 'name-desc':
            sortOption = { name: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
        Product.find({ 
            status: 'active', 
            category: 'women' 
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
        Product.countDocuments({ status: 'active', category: 'women' })
    ]);

    res.render('pages/women', {
        title: 'Women\'s Collection - SOLARA',
        currentPage: 'women',
        products: products.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        })),
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalProducts: total,
            hasMore: skip + products.length < total
        }
    });
});

// @desc    Render single product page
// @route   GET /product/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || product.status !== 'active') {
        return res.status(404).render('404', {
            title: 'Product Not Found - SOLARA',
            message: 'Product not found'
        });
    }

    // Get related products (same category)
    const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        status: 'active'
    }).limit(4);

    res.render('pages/product', {
        title: `${product.name} - SOLARA`,
        currentPage: 'product',
        product: {
            ...product.toObject(),
            imageUrl: getImageUrl(product.image || (product.images && product.images[0]?.url)),
            images: product.images && product.images.length > 0 
                ? product.images.map(img => ({
                    ...img.toObject(),
                    url: getImageUrl(img.url)
                }))
                : [{ url: getImageUrl(product.image), alt: product.name, isPrimary: true }]
        },
        relatedProducts: relatedProducts.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        }))
    });
});

// @desc    Render cart page
// @route   GET /cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.getOrCreateCart(req.user._id);
    await cart.populate('items.product', 'name price image images stock status');

    // Filter out unavailable products
    const validItems = cart.items.filter(item => 
        item.product && item.product.status === 'active'
    );

    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }

    res.render('pages/cart', {
        title: 'Shopping Cart - SOLARA',
        currentPage: 'cart',
        cart: {
            items: validItems.map(item => ({
                ...item.toObject(),
                product: {
                    ...item.product.toObject(),
                    imageUrl: getImageUrl(item.product.image || (item.product.images && item.product.images[0]?.url))
                }
            })),
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            discount: cart.discount,
            total: cart.total
        }
    });
});

// @desc    Render checkout page
// @route   GET /checkout
// @access  Private
exports.getCheckout = asyncHandler(async (req, res) => {
    const cart = await Cart.getOrCreateCart(req.user._id);
    await cart.populate('items.product', 'name price image images stock status');

    const validItems = cart.items.filter(item => 
        item.product && item.product.status === 'active'
    );

    if (validItems.length === 0) {
        return res.redirect('/cart');
    }

    res.render('pages/checkout', {
        title: 'Checkout - SOLARA',
        currentPage: 'checkout',
        cart: {
            items: validItems.map(item => ({
                ...item.toObject(),
                product: {
                    ...item.product.toObject(),
                    imageUrl: getImageUrl(item.product.image || (item.product.images && item.product.images[0]?.url))
                }
            })),
            subtotal: cart.subtotal,
            discount: cart.discount,
            total: cart.total
        },
        user: req.user
    });
});

// @desc    Render orders page
// @route   GET /orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('items.product', 'name image images');

    res.render('pages/orders', {
        title: 'My Orders - SOLARA',
        currentPage: 'orders',
        orders: orders.map(order => ({
            ...order.toObject(),
            items: order.items.map(item => ({
                ...item.toObject(),
                product: item.product ? {
                    ...item.product.toObject(),
                    imageUrl: getImageUrl(item.product.image || (item.product.images && item.product.images[0]?.url))
                } : null
            }))
        }))
    });
});

// @desc    Render profile page
// @route   GET /profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    
    res.render('pages/profile', {
        title: 'My Profile - SOLARA',
        currentPage: 'profile',
        user: user.toObject()
    });
});

// @desc    Render wishlist page
// @route   GET /wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: 'wishlist',
        select: 'name price image images status category comparePrice',
        match: { status: 'active' } // Only get active products
    });
    
    // Filter out null products (in case some were deleted)
    const wishlistItems = (user.wishlist || []).filter(item => item && item.status === 'active');

    res.render('pages/wishlist', {
        title: 'My Wishlist - SOLARA',
        currentPage: 'wishlist',
        wishlist: wishlistItems.map(item => ({
            ...item.toObject(),
            imageUrl: getImageUrl(item.image || (item.images && item.images[0]?.url)),
            category: item.category || 'fashion'
        })),
        user: req.user
    });
});

// @desc    Render search results page
// @route   GET /search
// @access  Public
exports.getSearch = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 12 } = req.query;
    
    if (!q) {
        return res.render('pages/search', {
            title: 'Search - SOLARA',
            currentPage: 'search',
            query: '',
            products: [],
            pagination: { currentPage: 1, totalPages: 0, totalProducts: 0 }
        });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const searchFilter = {
        status: 'active',
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } }
        ]
    };

    const [products, total] = await Promise.all([
        Product.find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Product.countDocuments(searchFilter)
    ]);

    res.render('pages/search', {
        title: `Search: ${q} - SOLARA`,
        currentPage: 'search',
        query: q,
        products: products.map(p => ({
            ...p.toObject(),
            imageUrl: getImageUrl(p.image || (p.images && p.images[0]?.url))
        })),
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalProducts: total,
            hasMore: skip + products.length < total
        }
    });
});

// @desc    Render login page
// @route   GET /login
// @access  Public
exports.getLogin = asyncHandler(async (req, res) => {
    res.render('auth/login', {
        title: 'Login - SOLARA',
        currentPage: 'login',
        error: req.query.error || null
    });
});

// @desc    Render register page
// @route   GET /register
// @access  Public
exports.getRegister = asyncHandler(async (req, res) => {
    res.render('auth/register', {
        title: 'Register - SOLARA',
        currentPage: 'register',
        error: req.query.error || null
    });
});

// @desc    Render admin dashboard
// @route   GET /admin
// @access  Private (Admin)
exports.getAdmin = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        return res.redirect('/login?error=Admin access required');
    }

    // Serve the old admin.html file directly (not as EJS template)
    const path = require('path');
    const adminHtmlPath = path.resolve(__dirname, '../../admin/admin.html');
    res.sendFile(adminHtmlPath, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    });
});

// @desc    Render 404 page
// @route   GET *
// @access  Public
exports.get404 = asyncHandler(async (req, res) => {
    // Don't handle API routes - they have their own 404 handler
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    }
    
    res.status(404).render('404', {
        title: 'Page Not Found - SOLARA',
        message: 'The page you are looking for does not exist.'
    });
});

