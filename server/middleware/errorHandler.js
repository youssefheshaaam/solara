// Custom Error Class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error types
const ErrorTypes = {
    VALIDATION_ERROR: 'ValidationError',
    CAST_ERROR: 'CastError',
    DUPLICATE_KEY: 'DuplicateKeyError',
    JWT_ERROR: 'JsonWebTokenError',
    JWT_EXPIRED: 'TokenExpiredError',
    MULTER_ERROR: 'MulterError'
};

// Handle specific MongoDB errors
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists. Please use another value.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid token. Please login again.', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired. Please login again.', 401);
};

const handleMulterError = (err) => {
    let message = 'File upload error';
    
    switch (err.code) {
        case 'LIMIT_FILE_SIZE':
            message = 'File too large. Maximum size is 5MB';
            break;
        case 'LIMIT_FILE_COUNT':
            message = 'Too many files. Maximum is 5 files';
            break;
        case 'LIMIT_UNEXPECTED_FILE':
            message = 'Unexpected field name in file upload';
            break;
        default:
            message = err.message;
    }
    
    return new AppError(message, 400);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
    // API error
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            stack: err.stack,
            details: err
        });
    }
    
    // Rendered website error
    console.error('ERROR:', err);
    return res.status(err.statusCode).json({
        success: false,
        error: err.message
    });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
    // API error
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                success: false,
                error: err.message
            });
        }
        
        // Programming or other unknown error: don't leak error details
        console.error('ERROR:', err);
        return res.status(500).json({
            success: false,
            error: 'Something went wrong. Please try again later.'
        });
    }

    // Rendered website error
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }

    console.error('ERROR:', err);
    return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
    });
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (err.name === ErrorTypes.CAST_ERROR) {
            error = handleCastErrorDB(error);
        }
        
        if (err.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        
        if (err.name === ErrorTypes.VALIDATION_ERROR) {
            error = handleValidationErrorDB(error);
        }
        
        if (err.name === ErrorTypes.JWT_ERROR) {
            error = handleJWTError();
        }
        
        if (err.name === ErrorTypes.JWT_EXPIRED) {
            error = handleJWTExpiredError();
        }
        
        if (err.name === ErrorTypes.MULTER_ERROR) {
            error = handleMulterError(error);
        }

        sendErrorProd(error, req, res);
    }
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};

module.exports = errorHandler;
module.exports.AppError = AppError;
module.exports.asyncHandler = asyncHandler;
module.exports.notFound = notFound;

