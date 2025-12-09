const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFile, getFileUrl } = require('../middleware/upload');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, status } = req.query;

    const filter = {};

    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role && role !== 'all') {
        filter.role = role;
    }

    if (status === 'active') {
        filter.isActive = true;
    } else if (status === 'inactive') {
        filter.isActive = false;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [users, total] = await Promise.all([
        User.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        User.countDocuments(filter)
    ]);

    res.json({
        success: true,
        data: users,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            limit: limitNum
        }
    });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Owner
exports.getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('wishlist', 'name price image');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private/Owner
exports.updateUser = asyncHandler(async (req, res) => {
    const allowedUpdates = [
        'firstName', 'lastName', 'phone', 'dateOfBirth', 
        'gender', 'preferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    // Handle avatar upload
    if (req.file) {
        const user = await User.findById(req.params.id);
        // Delete old avatar if exists
        if (user.avatar && !user.avatar.startsWith('http')) {
            await deleteFile(user.avatar).catch(() => {});
        }
        updates.avatar = getFileUrl(req.file.filename, 'avatars');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
    });
});

// @desc    Update user by admin
// @route   PUT /api/users/:id/admin
// @access  Private/Admin
exports.updateUserByAdmin = asyncHandler(async (req, res) => {
    const { role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role, isActive },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        message: 'User updated successfully',
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Cannot delete admin users'
        });
    }

    // Delete avatar if exists
    if (user.avatar && !user.avatar.startsWith('http')) {
        await deleteFile(user.avatar).catch(() => {});
    }

    await user.deleteOne();

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

// @desc    Add address
// @route   POST /api/users/:id/addresses
// @access  Private/Owner
exports.addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    const newAddress = {
        type: req.body.type || 'home',
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country || 'Egypt',
        isDefault: req.body.isDefault || false
    };

    // If this is the default address, unset other defaults
    if (newAddress.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    // If this is the first address, make it default
    if (user.addresses.length === 0) {
        newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: user.addresses
    });
});

// @desc    Update address
// @route   PUT /api/users/:id/addresses/:addressId
// @access  Private/Owner
exports.updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        return res.status(404).json({
            success: false,
            error: 'Address not found'
        });
    }

    // Update address fields
    Object.assign(address, req.body);

    // Handle default address
    if (req.body.isDefault) {
        user.addresses.forEach(addr => {
            if (addr._id.toString() !== req.params.addressId) {
                addr.isDefault = false;
            }
        });
    }

    await user.save();

    res.json({
        success: true,
        message: 'Address updated successfully',
        data: user.addresses
    });
});

// @desc    Delete address
// @route   DELETE /api/users/:id/addresses/:addressId
// @access  Private/Owner
exports.deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        return res.status(404).json({
            success: false,
            error: 'Address not found'
        });
    }

    address.deleteOne();
    await user.save();

    res.json({
        success: true,
        message: 'Address deleted successfully',
        data: user.addresses
    });
});

// @desc    Add to wishlist
// @route   POST /api/users/:id/wishlist
// @access  Private/Owner
exports.addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        await user.save();
    }

    await user.populate('wishlist', 'name price image');

    res.json({
        success: true,
        message: 'Added to wishlist',
        data: user.wishlist
    });
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/:id/wishlist/:productId
// @access  Private/Owner
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    user.wishlist = user.wishlist.filter(
        id => id.toString() !== req.params.productId
    );
    await user.save();

    await user.populate('wishlist', 'name price image');

    res.json({
        success: true,
        message: 'Removed from wishlist',
        data: user.wishlist
    });
});

// @desc    Get user statistics (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                },
                adminUsers: {
                    $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                }
            }
        }
    ]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth }
    });

    res.json({
        success: true,
        data: {
            ...stats[0],
            newUsersThisMonth
        }
    });
});

