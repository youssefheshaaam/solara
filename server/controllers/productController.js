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
        status
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter (admin can see all, public only sees active)
    if (req.user && req.user.role === 'admin') {
        // Admin can see all products - only filter by status if explicitly requested
        if (status && status !== 'all') {
            filter.status = status;
        }
        // If status is 'all' or not provided, don't filter by status (show ALL products)
    } else {
        // Non-admin users only see active products
        filter.status = status || 'active';
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

    // Handle FormData arrays - express.urlencoded with extended:true handles arrays
    // But we need to ensure they're arrays
    if (req.body.sizes) {
        productData.sizes = Array.isArray(req.body.sizes) 
            ? req.body.sizes.filter(Boolean)
            : [req.body.sizes].filter(Boolean);
    }
    
    if (req.body.colors) {
        productData.colors = Array.isArray(req.body.colors)
            ? req.body.colors.filter(Boolean)
            : [req.body.colors].filter(Boolean);
    }
    
    // Parse tags if it's a string
    if (productData.tags) {
        if (typeof productData.tags === 'string') {
            productData.tags = productData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        } else if (Array.isArray(productData.tags)) {
            productData.tags = productData.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
        }
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

    // Handle new uploaded images - merge with existing instead of replacing
    if (req.files && req.files.length > 0) {
        // Get current images array (convert to plain objects to preserve _id)
        const currentImages = (product.images || []).map(img => {
            const imgObj = img.toObject ? img.toObject() : img;
            return {
                _id: imgObj._id,
                url: imgObj.url,
                alt: imgObj.alt || product.name,
                isPrimary: imgObj.isPrimary || false
            };
        });

        // Check if we should remove some images first
        let imagesToKeep = currentImages;
        if (req.body.removeImageIds) {
            const removeIds = Array.isArray(req.body.removeImageIds) 
                ? req.body.removeImageIds 
                : [req.body.removeImageIds];
            
            // Delete files for removed images
            for (const img of currentImages) {
                if (img._id && removeIds.includes(img._id.toString())) {
                    if (img.url && !img.url.startsWith('http')) {
                        await deleteFile(img.url).catch(() => {});
                    }
                }
            }
            
            // Keep only images not in removeImageIds
            imagesToKeep = currentImages.filter(img => 
                !img._id || !removeIds.includes(img._id.toString())
            );
        }

        // Add new images
        const newImages = req.files.map((file, index) => ({
            url: getFileUrl(file.filename, 'products'),
            alt: updateData.name || product.name,
            isPrimary: imagesToKeep.length === 0 && index === 0 // Only set primary if no existing images
        }));

        // Merge existing and new images
        const allImages = [...imagesToKeep, ...newImages];
        
        // Ensure at least one image is primary
        if (allImages.length > 0 && !allImages.some(img => img.isPrimary)) {
            allImages[0].isPrimary = true;
        }
        
        // Set the images array directly
        product.images = allImages;
        
        // Set primary image URL for legacy support
        const primaryImage = allImages.find(img => img.isPrimary) || allImages[0];
        product.image = primaryImage.url;
        
        // Mark images array as modified
        product.markModified('images');
    } else if (req.file) {
        // Single file upload - add to existing images
        const currentImages = (product.images || []).map(img => {
            const imgObj = img.toObject ? img.toObject() : img;
            return {
                _id: imgObj._id,
                url: imgObj.url,
                alt: imgObj.alt || product.name,
                isPrimary: imgObj.isPrimary || false
            };
        });

        const newImageUrl = getFileUrl(req.file.filename, 'products');
        const newImage = {
            url: newImageUrl,
            alt: updateData.name || product.name,
            isPrimary: currentImages.length === 0 // Primary only if no existing images
        };

        // Merge with existing
        const allImages = [...currentImages, newImage];
        
        // Ensure at least one image is primary
        if (allImages.length > 0 && !allImages.some(img => img.isPrimary)) {
            allImages[0].isPrimary = true;
        }
        
        product.images = allImages;
        product.markModified('images');
        
        const primaryImage = allImages.find(img => img.isPrimary) || allImages[0];
        product.image = primaryImage.url;
    } else if (req.body.removeImageIds) {
        // Only removing images, no new uploads
        const removeIds = Array.isArray(req.body.removeImageIds) 
            ? req.body.removeImageIds 
            : [req.body.removeImageIds];
        
        const currentImages = (product.images || []).map(img => {
            const imgObj = img.toObject ? img.toObject() : img;
            return {
                _id: imgObj._id,
                url: imgObj.url,
                alt: imgObj.alt || product.name,
                isPrimary: imgObj.isPrimary || false
            };
        });

        // Delete files for removed images
        for (const img of currentImages) {
            if (img._id && removeIds.includes(img._id.toString())) {
                if (img.url && !img.url.startsWith('http')) {
                    await deleteFile(img.url).catch(() => {});
                }
            }
        }

        // Keep only images not in removeImageIds
        const remainingImages = currentImages.filter(img => 
            !img._id || !removeIds.includes(img._id.toString())
        );

        product.images = remainingImages;
        product.markModified('images');

        // Ensure at least one image is primary if images remain
        if (remainingImages.length > 0) {
            if (!remainingImages.some(img => img.isPrimary)) {
                remainingImages[0].isPrimary = true;
                product.images[0].isPrimary = true;
            }
            const primaryImage = remainingImages.find(img => img.isPrimary) || remainingImages[0];
            product.image = primaryImage.url;
        } else {
            product.image = null;
        }
    }

    // Handle FormData arrays - express.urlencoded with extended:true handles arrays
    if (req.body.sizes !== undefined) {
        updateData.sizes = Array.isArray(req.body.sizes)
            ? req.body.sizes.filter(Boolean)
            : [req.body.sizes].filter(Boolean);
    }
    
    if (req.body.colors !== undefined) {
        updateData.colors = Array.isArray(req.body.colors)
            ? req.body.colors.filter(Boolean)
            : [req.body.colors].filter(Boolean);
    }
    
    // Parse tags if it's a string
    if (updateData.tags) {
        if (typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        } else if (Array.isArray(updateData.tags)) {
            updateData.tags = updateData.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
        }
    }

    // Update other fields (images are already handled above)
    Object.keys(updateData).forEach(key => {
        if (key !== 'images' && key !== 'image') {
            product[key] = updateData[key];
        }
    });

    // Save the product (images were already modified directly on the product document)
    product = await product.save();

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

// @desc    Remove individual product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
exports.removeProductImage = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    const imageId = req.params.imageId;

    // Find the image to remove - try multiple methods
    let imageToRemove = null;
    
    // Try Mongoose id() method first
    try {
        imageToRemove = product.images.id(imageId);
    } catch (e) {
        // id() might fail, try find() instead
    }
    
    // If id() doesn't work, try finding by string comparison
    if (!imageToRemove) {
        imageToRemove = product.images.find(img => {
            if (!img._id) return false;
            return img._id.toString() === imageId;
        });
    }

    if (!imageToRemove) {
        return res.status(404).json({
            success: false,
            error: 'Image not found',
            debug: {
                imageId,
                availableIds: product.images.map(img => img._id?.toString()).filter(Boolean),
                totalImages: product.images.length
            }
        });
    }

    // Delete the file from filesystem
    const imageUrl = imageToRemove.url || (imageToRemove.toObject ? imageToRemove.toObject().url : null);
    if (imageUrl && !imageUrl.startsWith('http')) {
        await deleteFile(imageUrl).catch(() => {});
    }

    // Remove image from array - use filter to create new array
    const imageToRemoveId = imageToRemove._id ? imageToRemove._id.toString() : null;
    product.images = product.images.filter(img => {
        if (!img._id) return false;
        return img._id.toString() !== imageToRemoveId;
    });
    
    // Mark array as modified
    product.markModified('images');

    // If removed image was primary, set first remaining image as primary
    if (imageToRemove.isPrimary && product.images.length > 0) {
        product.images[0].isPrimary = true;
        product.image = product.images[0].url;
    } else if (product.images.length > 0) {
        // Ensure at least one image is primary
        if (!product.images.some(img => img.isPrimary)) {
            product.images[0].isPrimary = true;
        }
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
        product.image = primaryImage.url;
    } else {
        // No images left
        product.image = null;
    }

    await product.save();

    res.json({
        success: true,
        message: 'Image removed successfully',
        data: product
    });
});

// @desc    Set product image as primary
// @route   PUT /api/products/:id/images/:imageId/primary
// @access  Private/Admin
exports.setPrimaryImage = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    const imageId = req.params.imageId;

    // Find the image to set as primary using Mongoose id() method
    const imageToSet = product.images.id(imageId);

    if (!imageToSet) {
        return res.status(404).json({
            success: false,
            error: 'Image not found'
        });
    }

    // Set all images to non-primary first
    product.images.forEach(img => {
        img.isPrimary = false;
    });

    // Set selected image as primary
    imageToSet.isPrimary = true;
    product.image = imageToSet.url;

    await product.save();

    res.json({
        success: true,
        message: 'Primary image updated successfully',
        data: product
    });
});

