const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Egypt' },
    phone: { type: String, required: true }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['credit-card', 'debit-card', 'paypal', 'cash-on-delivery'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: { type: String },
    paidAt: { type: Date }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: false // Auto-generated in pre-save hook
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    payment: paymentSchema,
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    statusHistory: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String },
    couponCode: { type: String }
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments() + 1;
        this.orderNumber = `SOL-${year}-${String(count).padStart(5, '0')}`;
    }
    next();
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
        
        if (this.status === 'delivered') {
            this.deliveredAt = new Date();
        }
    }
    next();
});

// Virtual to get item count
orderSchema.virtual('itemCount').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Static method to get orders by user with pagination
orderSchema.statics.getUserOrders = async function(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    
    const filter = { user: userId };
    if (status && status !== 'all') {
        filter.status = status;
    }

    const total = await this.countDocuments(filter);
    const orders = await this.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.product', 'name image');

    return {
        orders,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

// Static method to get order statistics
orderSchema.statics.getStats = async function(startDate, endDate) {
    const match = {};
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                averageOrderValue: { $avg: '$total' },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                completedOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0
    };
};

module.exports = mongoose.model('Order', orderSchema);

