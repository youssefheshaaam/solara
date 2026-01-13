const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0.01, 'Price must be at least 0.01']
    },
    comparePrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['men', 'women'],
        lowercase: true
    },
    subcategory: {
        type: String,
        enum: ['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'jackets', 'tops', 'bottoms', 'other']
    },
    brand: {
        type: String,
        default: 'SOLARA',
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    images: [{
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],
    // Legacy single image field for backward compatibility
    image: {
        type: String
    },
    sizes: [{
        type: String,
        trim: true
    }],
    colors: [{
        type: String,
        trim: true
    }],
    material: {
        type: String,
        trim: true
    },
    care: {
        type: String,
        trim: true
    },
    fit: {
        type: String,
        trim: true,
        default: 'Regular Fit'
    },
    season: {
        type: String,
        trim: true,
        default: 'All Season'
    },
    careInstructions: [{
        type: String,
        trim: true
    }],
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    seo: {
        metaTitle: { type: String },
        metaDescription: { type: String }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'ratings.average': -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.comparePrice && this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
    if (this.images && this.images.length > 0) {
        const primary = this.images.find(img => img.isPrimary);
        return primary ? primary.url : this.images[0].url;
    }
    return this.image || '/images/placeholder.svg';
});

// Generate slug before saving
productSchema.pre('save', function(next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Generate SKU if not provided
    if (!this.sku) {
        const prefix = this.category.substring(0, 2).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase();
        this.sku = `${prefix}-${timestamp}`;
    }
    
    next();
});

// Static method for full-text search
productSchema.statics.search = async function(query, options = {}) {
    const { 
        category, 
        minPrice, 
        maxPrice, 
        page = 1, 
        limit = 12,
        sort = '-createdAt'
    } = options;

    const filter = { status: 'active' };

    // Use regex-based search (works without text index)
    if (query) {
        const searchRegex = { $regex: query, $options: 'i' };
        filter.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { brand: searchRegex },
            { material: searchRegex },
            { tags: searchRegex }
        ];
    }

    if (category && category !== 'all') {
        filter.category = category;
    }

    if (minPrice !== undefined) {
        filter.price = { ...filter.price, $gte: minPrice };
    }

    if (maxPrice !== undefined) {
        filter.price = { ...filter.price, $lte: maxPrice };
    }

    const total = await this.countDocuments(filter);
    const products = await this.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        products,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

module.exports = mongoose.model('Product', productSchema);

