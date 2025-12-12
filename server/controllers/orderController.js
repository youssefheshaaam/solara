const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        status, 
        startDate, 
        endDate,
        search 
    } = req.query;

    const filter = {};

    if (status && status !== 'all') {
        filter.status = status;
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
        filter.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
            { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
        ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Order.countDocuments(filter)
    ]);

    res.json({
        success: true,
        data: orders,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            limit: limitNum
        }
    });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const result = await Order.getUserOrders(req.user._id, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
    });

    res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
    });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'firstName lastName email phone')
        .populate('items.product', 'name image price');

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to view this order'
        });
    }

    res.json({
        success: true,
        data: order
    });
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
exports.getOrderByNumber = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
        .populate('user', 'firstName lastName email phone')
        .populate('items.product', 'name image price');

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to view this order'
        });
    }

    res.json({
        success: true,
        data: order
    });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, payment, couponCode } = req.body;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
            return res.status(400).json({
                success: false,
                error: `Product not found: ${item.product}`
            });
        }

        if (product.status !== 'active') {
            return res.status(400).json({
                success: false,
                error: `Product is not available: ${product.name}`
            });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({
                success: false,
                error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
            });
        }

        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.image || product.primaryImage,
            price: product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color
        });

        subtotal += product.price * item.quantity;

        // Update product stock
        product.stock -= item.quantity;
        await product.save();
    }

    // Calculate totals
    const shippingCost = subtotal >= 100 ? 0 : 25; // Free shipping over 100 EGP
    const tax = 0; // No tax
    let discount = 0;

    // Apply coupon discount (placeholder - implement coupon system)
    if (couponCode) {
        // TODO: Validate and apply coupon
    }

    const total = subtotal + shippingCost + tax - discount;

    // Generate order number
    const year = new Date().getFullYear();
    const orderCount = await Order.countDocuments() + 1;
    const orderNumber = `SOL-${year}-${String(orderCount).padStart(5, '0')}`;

    // Create order
    const order = await Order.create({
        orderNumber,
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        payment: {
            method: payment.method,
            status: payment.method === 'cash-on-delivery' ? 'pending' : 'pending'
        },
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        couponCode
    });

    // Clear user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        await cart.clearCart();
    }

    // Populate order data
    await order.populate('items.product', 'name image');

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order
    });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    // Validate status transition
    const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': ['refunded'],
        'cancelled': [],
        'refunded': []
    };

    if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({
            success: false,
            error: `Cannot transition from ${order.status} to ${status}`
        });
    }

    // Handle stock restoration for cancelled orders
    if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }
    }

    // Update order
    order.status = status;
    
    if (trackingNumber) {
        order.trackingNumber = trackingNumber;
    }
    
    if (estimatedDelivery) {
        order.estimatedDelivery = new Date(estimatedDelivery);
    }

    // Add note to status history
    if (note) {
        order.statusHistory[order.statusHistory.length - 1].note = note;
    }

    await order.save();

    res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order
    });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to cancel this order'
        });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
            success: false,
            error: 'Order cannot be cancelled at this stage'
        });
    }

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
        });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const stats = await Order.getStats(startDate, endDate);

    // Get orders by status
    const byStatus = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
            }
        }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
        success: true,
        data: {
            ...stats,
            byStatus,
            recentOrders
        }
    });
});

