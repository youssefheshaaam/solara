const Product = require('../models/Product');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { deleteFile, getFileUrl } = require('../middleware/upload');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        search,
        sort = '-createdAt',
        featured,
        status = 'active'
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter (admin can see all, public only sees active)
    if (req.user && req.user.role === 'admin') {
        if (status !== 'all') filter.status = status;
    } else {
        filter.status = 'active';
    }

    // Category filter
    if (category && category !== 'all') {
        filter.category = category.toLowerCase();
    }

    // Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
        filter.featured = true;
    }

    // Search filter
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ];
    }

    // Parse sort parameter
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
        case 'newest':
            sortOption = { createdAt: -1 };
            break;
        case 'rating':
            sortOption = { 'ratings.average': -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum),
        Product.countDocuments(filter)
    ]);

    res.json({
        success: true,
        data: products,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            limit: limitNum,
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1
        }
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Only show active products to non-admin users
    if (product.status !== 'active' && (!req.user || req.user.role !== 'admin')) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: product
    });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ 
        slug: req.params.slug,
        status: 'active'
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: product
    });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
    const productData = { ...req.body };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
        productData.images = req.files.map((file, index) => ({
            url: getFileUrl(file.filename, 'products'),
            alt: productData.name,
            isPrimary: index === 0
        }));
        productData.image = productData.images[0].url;
    } else if (req.file) {
        productData.image = getFileUrl(req.file.filename, 'products');
        productData.images = [{
            url: productData.image,
            alt: productData.name,
            isPrimary: true
        }];
    }

    // Parse arrays if they're strings
    if (typeof productData.sizes === 'string') {
        productData.sizes = productData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof productData.colors === 'string') {
        productData.colors = productData.colors.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (typeof productData.tags === 'string') {
        productData.tags = productData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    const product = await Product.create(productData);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    const updateData = { ...req.body };

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
        // Delete old images
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                if (img.url && !img.url.startsWith('http')) {
                    await deleteFile(img.url).catch(() => {});
                }
            }
        }

        updateData.images = req.files.map((file, index) => ({
            url: getFileUrl(file.filename, 'products'),
            alt: updateData.name || product.name,
            isPrimary: index === 0
        }));
        updateData.image = updateData.images[0].url;
    } else if (req.file) {
        // Delete old image
        if (product.image && !product.image.startsWith('http')) {
            await deleteFile(product.image).catch(() => {});
        }
        updateData.image = getFileUrl(req.file.filename, 'products');
    }

    // Parse arrays if they're strings
    if (typeof updateData.sizes === 'string') {
        updateData.sizes = updateData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updateData.colors === 'string') {
        updateData.colors = updateData.colors.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
        for (const img of product.images) {
            if (img.url && !img.url.startsWith('http')) {
                await deleteFile(img.url).catch(() => {});
            }
        }
    }
    if (product.image && !product.image.startsWith('http')) {
        await deleteFile(product.image).catch(() => {});
    }

    await product.deleteOne();

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
        featured: true,
        status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json({
        success: true,
        data: products
    });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(limit);

    res.json({
        success: true,
        data: products
    });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const filter = {
        category: category.toLowerCase(),
        status: 'active'
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Product.countDocuments(filter)
    ]);

    res.json({
        success: true,
        data: products,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            limit: limitNum
        }
    });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res) => {
    const { q, category, page = 1, limit = 12 } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        });
    }

    const result = await Product.search(q, {
        category,
        page: parseInt(page),
        limit: parseInt(limit)
    });

    res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
    });
});

// @desc    Get product statistics (admin)
// @route   GET /api/products/stats
// @access  Private/Admin
exports.getProductStats = asyncHandler(async (req, res) => {
    const stats = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                activeProducts: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                outOfStock: {
                    $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
                },
                avgPrice: { $avg: '$price' },
                totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
            }
        }
    ]);

    const byCategory = await Product.aggregate([
        { $match: { status: 'active' } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgPrice: { $avg: '$price' }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            ...stats[0],
            byCategory
        }
    });
});

