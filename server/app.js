require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const i18n = require('i18n');

// Import configurations
const connectDB = require('./config/db');

// Default configuration values
const config = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://youssef2103390_db_user:vJ2ObfFmHlhwXiiB@cluster0.mxy2kdw.mongodb.net/solara_store?retryWrites=true&w=majority&appName=Cluster0',
    SESSION_SECRET: process.env.SESSION_SECRET || 'solara-super-secret-session-key-2024',
    JWT_SECRET: process.env.JWT_SECRET || 'solara-super-secret-jwt-key-2024'
};

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const frontendRoutes = require('./routes/frontend');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

// Initialize Express app
const app = express();

// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
connectDB();

// Configure i18n for localization
i18n.configure({
    locales: ['en', 'ar'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    cookie: 'lang',
    queryParameter: 'lang',
    autoReload: true,
    syncFiles: true,
    objectNotation: true
});

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: config.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5000', 'null'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Language']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (config.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Session configuration
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: config.MONGODB_URI,
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native'
    }),
    cookie: {
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
}));

// Static files - serve BEFORE other middleware to ensure CSS/JS load correctly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../'), {
    maxAge: config.NODE_ENV === 'production' ? '1d' : '0', // Cache in production
    etag: true,
    lastModified: true
}));

// Initialize i18n middleware
app.use(i18n.init);

// Language middleware - set locale from cookie, query, or header
app.use((req, res, next) => {
    const lang = req.cookies.lang || req.query.lang || req.headers['accept-language']?.split(',')[0]?.split('-')[0];
    if (lang && ['en', 'ar'].includes(lang)) {
        req.setLocale(lang);
        res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    } else {
        req.setLocale('en'); // Default to English
    }
    // Make locale available to all EJS templates
    res.locals.locale = req.getLocale();
    res.locals.__ = req.__; // Make translation function available
    next();
});

// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../favicon.ico'), (err) => {
        if (err) {
            res.status(204).end(); // No content if favicon doesn't exist
        }
    });
});

// API Routes - mount BEFORE frontend routes to avoid catch-all conflicts
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// Frontend routes (EJS pages) - mount after API routes
app.use('/', frontendRoutes);

// Localization endpoint
app.get('/api/locales/:lang', (req, res) => {
    const { lang } = req.params;
    if (!['en', 'ar'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
    }
    try {
        const translations = require(`./locales/${lang}.json`);
        res.json(translations);
    } catch (error) {
        res.status(404).json({ error: 'Language file not found' });
    }
});

// Set language endpoint
app.post('/api/set-language', (req, res) => {
    const { lang } = req.body;
    if (!['en', 'ar'].includes(lang)) {
        return res.status(400).json({ success: false, error: 'Invalid language' });
    }
    try {
        req.setLocale(lang);
        res.cookie('lang', lang, { 
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: false, // Allow client-side access
            sameSite: 'lax'
        });
        res.json({ success: true, message: `Language set to ${lang}`, lang: lang });
    } catch (error) {
        console.error('Error setting language:', error);
        res.status(500).json({ success: false, error: 'Failed to set language' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🌟 SOLARA Fashion Store Server                  ║
║                                                   ║
║   Server running on: http://localhost:${config.PORT}        ║
║   Environment: ${config.NODE_ENV}                      ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Don't exit in development
    if (config.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Export config for use in other modules
module.exports.config = config;

module.exports = app;

