const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/products', 'uploads/avatars'];
uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Determine upload path based on route or field name
        if (file.fieldname === 'avatar') {
            uploadPath = 'uploads/avatars/';
        } else if (file.fieldname === 'images' || file.fieldname === 'image') {
            uploadPath = 'uploads/products/';
        }
        
        const fullPath = path.join(__dirname, '..', uploadPath);
        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = file.fieldname;
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

// File filter - only allow images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
    }
};

// File size limits (in bytes)
const FILE_SIZE_LIMIT = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

// Multer configuration for product images
const uploadProductImages = multer({
    storage: storage,
    limits: {
        fileSize: FILE_SIZE_LIMIT,
        files: 5 // Maximum 5 files
    },
    fileFilter: imageFileFilter
});

// Multer configuration for single product image
const uploadProductImage = multer({
    storage: storage,
    limits: {
        fileSize: FILE_SIZE_LIMIT,
        files: 1
    },
    fileFilter: imageFileFilter
});

// Multer configuration for avatar
const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB for avatars
        files: 1
    },
    fileFilter: imageFileFilter
});

// Memory storage for processing images before saving
const memoryStorage = multer.memoryStorage();

const uploadToMemory = multer({
    storage: memoryStorage,
    limits: {
        fileSize: FILE_SIZE_LIMIT,
        files: 5
    },
    fileFilter: imageFileFilter
});

// Error handling middleware for multer errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        let message = 'File upload error';
        
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = `File too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`;
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files. Maximum is 5 files';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = `Unexpected field: ${err.field}`;
                break;
            default:
                message = err.message;
        }
        
        return res.status(400).json({
            success: false,
            error: message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message || 'File upload failed'
        });
    }
    
    next();
};

// Helper function to delete uploaded file
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(__dirname, '..', filePath);
        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Helper function to get file URL
const getFileUrl = (filename, type = 'products') => {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    return `/uploads/${type}/${filename}`;
};

module.exports = {
    uploadProductImages: uploadProductImages.array('images', 5),
    uploadProductImage: uploadProductImage.single('image'),
    uploadAvatar: uploadAvatar.single('avatar'),
    uploadToMemory: uploadToMemory.array('images', 5),
    handleUploadError,
    deleteFile,
    getFileUrl
};

