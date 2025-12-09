const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.getOrCreateCart(req.user._id);
    
    await cart.populate('items.product', 'name price image stock status');

    // Filter out unavailable products and update prices
    const validItems = [];
    for (const item of cart.items) {
        if (item.product && item.product.status === 'active') {
            // Update price if it has changed
            if (item.price !== item.product.price) {
                item.price = item.product.price;
            }
            validItems.push(item);
        }
    }

    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }

    res.json({
        success: true,
        data: {
            items: cart.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            discount: cart.discount,
            total: cart.total,
            couponCode: cart.couponCode
        }
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1, size, color } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    
    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    if (product.status !== 'active') {
        return res.status(400).json({
            success: false,
            error: 'Product is not available'
        });
    }

    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            error: `Only ${product.stock} items available in stock`
        });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId &&
                item.size === size &&
                item.color === color
    );

    if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (newQuantity > 10) {
            return res.status(400).json({
                success: false,
                error: 'Maximum quantity per item is 10'
            });
        }
        
        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                error: `Only ${product.stock} items available in stock`
            });
        }

        cart.items[existingItemIndex].quantity = newQuantity;
    } else {
        cart.items.push({
            product: productId,
            quantity,
            size,
            color,
            price: product.price
        });
    }

    await cart.save();
    await cart.populate('items.product', 'name price image stock');

    res.json({
        success: true,
        message: 'Item added to cart',
        data: {
            items: cart.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            total: cart.total
        }
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            error: 'Cart not found'
        });
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Item not found in cart'
        });
    }

    if (quantity <= 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
    } else {
        // Check stock
        const product = await Product.findById(productId);
        if (product && quantity > product.stock) {
            return res.status(400).json({
                success: false,
                error: `Only ${product.stock} items available in stock`
            });
        }

        cart.items[itemIndex].quantity = Math.min(10, quantity);
        
        // Update price if changed
        if (product) {
            cart.items[itemIndex].price = product.price;
        }
    }

    await cart.save();
    await cart.populate('items.product', 'name price image stock');

    res.json({
        success: true,
        message: quantity <= 0 ? 'Item removed from cart' : 'Cart updated',
        data: {
            items: cart.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            total: cart.total
        }
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            error: 'Cart not found'
        });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
        item => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
        return res.status(404).json({
            success: false,
            error: 'Item not found in cart'
        });
    }

    await cart.save();
    await cart.populate('items.product', 'name price image stock');

    res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
            items: cart.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            total: cart.total
        }
    });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        await cart.clearCart();
    }

    res.json({
        success: true,
        message: 'Cart cleared',
        data: {
            items: [],
            itemCount: 0,
            subtotal: 0,
            total: 0
        }
    });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = asyncHandler(async (req, res) => {
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Cart is empty'
        });
    }

    // TODO: Implement coupon validation and discount calculation
    // For now, just store the coupon code
    
    // Example: 10% discount for demo
    const validCoupons = {
        'SAVE10': 0.10,
        'WELCOME20': 0.20,
        'SOLARA30': 0.30
    };

    const discountRate = validCoupons[couponCode.toUpperCase()];
    
    if (!discountRate) {
        return res.status(400).json({
            success: false,
            error: 'Invalid coupon code'
        });
    }

    cart.couponCode = couponCode.toUpperCase();
    cart.discount = cart.subtotal * discountRate;
    await cart.save();

    await cart.populate('items.product', 'name price image stock');

    res.json({
        success: true,
        message: `Coupon applied! ${discountRate * 100}% discount`,
        data: {
            items: cart.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            discount: cart.discount,
            total: cart.total,
            couponCode: cart.couponCode
        }
    });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.couponCode = undefined;
        cart.discount = 0;
        await cart.save();
        await cart.populate('items.product', 'name price image stock');
    }

    res.json({
        success: true,
        message: 'Coupon removed',
        data: {
            items: cart ? cart.items : [],
            itemCount: cart ? cart.itemCount : 0,
            subtotal: cart ? cart.subtotal : 0,
            discount: 0,
            total: cart ? cart.subtotal : 0,
            couponCode: null
        }
    });
});

// @desc    Sync guest cart with user cart
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = asyncHandler(async (req, res) => {
    const { items } = req.body; // Items from guest cart (localStorage)

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid cart data'
        });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
    }

    // Merge guest cart items with existing cart
    for (const guestItem of items) {
        const product = await Product.findById(guestItem.productId);
        
        if (!product || product.status !== 'active') continue;

        const existingIndex = cart.items.findIndex(
            item => item.product.toString() === guestItem.productId
        );

        if (existingIndex > -1) {
            // Add quantities
            const newQuantity = Math.min(10, cart.items[existingIndex].quantity + guestItem.quantity);
            cart.items[existingIndex].quantity = Math.min(newQuantity, product.stock);
        } else {
            // Add new item
            const quantity = Math.min(guestItem.quantity, product.stock, 10);
            if (quantity > 0) {
                cart.items.push({
                    product: guestItem.productId,
                    quantity,
                    size: guestItem.size,
                    color: guestItem.color,
                    price: product.price
                });
            }
        }
    }

    await cart.save();
    await cart.populate('items.product', 'name price image stock');

    res.json({
        success: true,
        message: 'Cart synced successfully',
        data: {
            items: cart.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            total: cart.total
        }
    });
});

