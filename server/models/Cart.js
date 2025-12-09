const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        max: [10, 'Quantity cannot exceed 10']
    },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    couponCode: { type: String },
    discount: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index
cartSchema.index({ user: 1 });

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
    return this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
});

// Virtual for total items count
cartSchema.virtual('itemCount').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total (after discount)
cartSchema.virtual('total').get(function() {
    return Math.max(0, this.subtotal - this.discount);
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, options = {}) {
    const existingItemIndex = this.items.findIndex(
        item => item.product.toString() === productId.toString() &&
                item.size === options.size &&
                item.color === options.color
    );

    if (existingItemIndex > -1) {
        // Update existing item quantity
        this.items[existingItemIndex].quantity = Math.min(
            10,
            this.items[existingItemIndex].quantity + quantity
        );
    } else {
        // Add new item
        const Product = mongoose.model('Product');
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }

        this.items.push({
            product: productId,
            quantity,
            size: options.size,
            color: options.color,
            price: product.price
        });
    }

    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const item = this.items.find(
        item => item.product.toString() === productId.toString()
    );

    if (item) {
        if (quantity <= 0) {
            this.items = this.items.filter(
                item => item.product.toString() !== productId.toString()
            );
        } else {
            item.quantity = Math.min(10, quantity);
        }
    }

    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
    return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    this.couponCode = undefined;
    this.discount = 0;
    return this.save();
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
    let cart = await this.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
        cart = new this({ user: userId, items: [] });
        await cart.save();
    }
    
    return cart;
};

module.exports = mongoose.model('Cart', cartSchema);

