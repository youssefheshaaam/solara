# SOLARA - Full-Stack E-Commerce Platform
Admin:
admin@solara.com
Admin@123
## 🌟 Project Overview

SOLARA is a modern, full-stack e-commerce web application built with Node.js, Express, and MongoDB. It features a sleek, minimal luxury aesthetic inspired by contemporary fashion brands. The platform delivers a complete shopping experience with user authentication, product management, shopping cart, and comprehensive administrative features.

**Live Features:**
- Real-time data synchronization with MongoDB
- Secure JWT-based authentication
- Session management with server-side storage
- RESTful API architecture
- Responsive, mobile-first design

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Cloud) |
| **ODM** | Mongoose |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **Sessions** | express-session with MongoDB store |
| **File Upload** | Multer |
| **Validation** | Joi |
| **Localization** | i18n |

### MVC Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│  (HTML/CSS/JS - Browser)                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/AJAX (Fetch API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │→ │ Controllers │→ │   Models    │         │
│  │  /api/...   │  │  (Logic)    │  │ (Mongoose)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                                   │                │
│         ▼                                   ▼                │
│  ┌─────────────┐                   ┌─────────────┐          │
│  │ Middleware  │                   │  MongoDB    │          │
│  │ Auth/Valid  │                   │   Atlas     │          │
│  └─────────────┘                   └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
/SOLARA
│
├── index.html                    # Home page
├── login.html                    # User login
├── register.html                 # User registration
├── start-server.bat              # Quick server start (Windows)
├── README.md                     # This file
├── requirements.txt              # Project requirements documentation
├── .gitignore                    # Git ignore rules
│
├── /pages                        # Customer pages
│   ├── men.html                  # Men's products
│   ├── women.html                # Women's products
│   ├── kids.html                 # Kids' products
│   ├── cart.html                 # Shopping cart
│   ├── checkout.html             # Checkout process
│   ├── wishlist.html             # User wishlist
│   ├── profile.html              # User profile
│   ├── orders.html               # Order history
│   └── contact.html              # Contact & FAQ
│
├── /admin                        # Admin pages
│   ├── admin.html                # Admin dashboard
│   ├── add-product.html          # Add new product
│   └── edit-product.html         # Edit product
│
├── /css                          # Stylesheets
│   ├── style.css                 # Main styles
│   ├── forms.css                 # Form styles
│   └── admin.css                 # Admin panel styles
│
├── /js                           # Frontend JavaScript
│   ├── api.js                    # API service (AJAX/Fetch)
│   ├── data.js                   # Data management & caching
│   ├── main.js                   # Main application logic
│   ├── admin.js                  # Admin functionality
│   ├── validation.js             # Form validation
│   └── db.js                     # Legacy IndexedDB (fallback)
│
├── /images                       # Static assets
│   └── /products                 # Product images
│
└── /server                       # Backend (Node.js)
    ├── app.js                    # Express application entry
    ├── package.json              # Node dependencies
    │
    ├── /config
    │   ├── config.js             # Environment configuration
    │   └── db.js                 # MongoDB connection
    │
    ├── /models                   # Mongoose schemas
    │   ├── User.js               # User model
    │   ├── Product.js            # Product model
    │   ├── Order.js              # Order model
    │   └── Cart.js               # Cart model
    │
    ├── /controllers              # Business logic
    │   ├── authController.js     # Authentication
    │   ├── userController.js     # User management
    │   ├── productController.js  # Product CRUD
    │   ├── orderController.js    # Order management
    │   └── cartController.js     # Cart operations
    │
    ├── /routes                   # API routes
    │   ├── auth.js               # /api/auth/*
    │   ├── users.js              # /api/users/*
    │   ├── products.js           # /api/products/*
    │   ├── orders.js             # /api/orders/*
    │   └── cart.js               # /api/cart/*
    │
    ├── /middleware               # Express middleware
    │   ├── auth.js               # JWT authentication
    │   ├── errorHandler.js       # Error handling
    │   ├── upload.js             # File upload (Multer)
    │   └── validation.js         # Request validation (Joi)
    │
    ├── /locales                  # Translation files
    │   ├── en.json               # English
    │   └── ar.json               # Arabic
    │
    ├── /seeds                    # Database seeding
    │   └── seed.js               # Populate initial data
    │
    └── /uploads                  # Uploaded files
        └── /products             # Product images
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas** account (free tier) - [Sign up](https://www.mongodb.com/atlas)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Web Project"
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment**
   
   Create `server/.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/solara_store
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   SESSION_SECRET=your-session-secret-key
   ```

4. **Seed the database** (optional - adds sample products)
   ```bash
   cd server
   node seeds/seed.js
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   
   Or double-click `start-server.bat` (Windows)

6. **Open in browser**
   ```
   http://localhost:5000
   ```

### Default Admin Credentials
- **Email:** admin@solara.com
- **Password:** Admin@123

---

## 🔐 Authentication System

### How It Works

1. **Registration**
   - User submits registration form
   - Password is hashed with bcrypt (10 salt rounds)
   - User document created in MongoDB
   - JWT token generated and returned

2. **Login**
   - User submits credentials
   - Server validates email/password against database
   - bcrypt compares hashed passwords
   - JWT token generated (24-hour expiry)
   - Token stored in localStorage on client

3. **Protected Routes**
   - Client sends JWT in Authorization header
   - Server middleware validates token
   - User data attached to request object
   - Route handler processes request

### Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with salt rounds |
| Token Authentication | JWT with expiration |
| Session Storage | MongoDB-backed sessions |
| CORS Protection | Configured allowed origins |
| Helmet.js | Security headers |
| Input Validation | Joi schemas |

### API Authentication Flow

```javascript
// Client-side login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

const { token, user } = await response.json();
localStorage.setItem('authToken', token);

// Authenticated requests
const products = await fetch('/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📊 Sessions

### What Are Sessions?

Sessions maintain user state across multiple HTTP requests. Since HTTP is stateless, sessions provide a way to remember who the user is.

### Implementation

We use `express-session` with MongoDB storage:

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

### Session vs JWT

| Aspect | Sessions | JWT |
|--------|----------|-----|
| Storage | Server-side (MongoDB) | Client-side (localStorage) |
| Scalability | Requires shared store | Stateless, easy to scale |
| Security | Server controls expiry | Token can't be invalidated |
| Use Case | Traditional web apps | APIs, mobile apps |

**SOLARA uses both:** Sessions for server-side state, JWT for API authentication.

---

## 🌍 Localization (i18n)

### What Is Localization?

Localization (i18n - "internationalization") adapts the application for different languages and regions. Users can switch between languages, and all text content updates accordingly.

### Supported Languages

- 🇺🇸 English (en) - Default
- 🇸🇦 Arabic (ar) - RTL support

### Implementation

**Server-side (i18n library):**
```javascript
i18n.configure({
    locales: ['en', 'ar'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    cookie: 'lang'
});
```

**Translation files (`server/locales/en.json`):**
```json
{
    "nav": {
        "home": "Home",
        "shop": "Shop",
        "cart": "Cart"
    },
    "product": {
        "addToCart": "Add to Cart",
        "outOfStock": "Out of Stock"
    }
}
```

**API Endpoints:**
- `GET /api/locales/:lang` - Get translations for a language
- `POST /api/set-language` - Set user's preferred language

### How to Add a New Language

1. Create `server/locales/fr.json` (French example)
2. Add all translation keys
3. Update `i18n.configure()` to include 'fr'
4. Add language option in UI

---

## 📄 Pagination

### What Is Pagination?

Pagination divides large datasets into smaller chunks (pages) to improve performance and user experience. Instead of loading 1000 products at once, we load 12 at a time.

### Implementation

**Backend (productController.js):**
```javascript
const { page = 1, limit = 12 } = req.query;

const skip = (page - 1) * limit;

const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit),
    Product.countDocuments(filter)
]);

res.json({
    success: true,
    data: products,
    pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
    }
});
```

**Frontend Usage:**
```javascript
// Fetch page 2 with 12 products per page
const response = await fetch('/api/products?page=2&limit=12');
const { data, pagination } = await response.json();

// pagination = { total: 50, page: 2, pages: 5, hasNext: true, hasPrev: true }
```

### Pagination Response Format

```json
{
    "success": true,
    "data": [...products],
    "pagination": {
        "total": 50,
        "page": 2,
        "pages": 5,
        "limit": 12,
        "hasNext": true,
        "hasPrev": true
    }
}
```

---

## 📤 File Upload

### What Is File Upload?

File upload allows users (especially admins) to upload product images to the server. We use Multer middleware to handle multipart/form-data.

### Implementation

**Multer Configuration (middleware/upload.js):**
```javascript
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        cb(null, `${uniqueName}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const valid = allowed.test(file.mimetype);
        cb(valid ? null : new Error('Invalid file type'), valid);
    }
});
```

**Route Usage:**
```javascript
router.post('/products', 
    authenticate, 
    authorizeAdmin, 
    upload.array('images', 5), // Max 5 images
    createProduct
);
```

### File Upload Security

- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Unique filename generation
- ✅ Admin-only access

---

## ⚠️ Error Handling

### Centralized Error Handler

All errors pass through a single middleware that formats consistent responses:

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
```

### Error Types

| Error | Status | Example |
|-------|--------|---------|
| ValidationError | 400 | Invalid email format |
| AuthenticationError | 401 | Invalid credentials |
| ForbiddenError | 403 | Admin access required |
| NotFoundError | 404 | Product not found |
| ServerError | 500 | Database connection failed |

### Frontend Error Handling

```javascript
try {
    const response = await ProductsAPI.create(productData);
    if (response.success) {
        showNotification('Product created!', 'success');
    }
} catch (error) {
    showNotification(error.message || 'Something went wrong', 'error');
}
```

---

## ✅ Data Validation

### Backend Validation (Joi)

All incoming data is validated using Joi schemas before processing:

```javascript
// middleware/validation.js
const productSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('men', 'women', 'kids').required(),
    description: Joi.string().max(1000),
    stock: Joi.number().integer().min(0).default(0),
    sizes: Joi.array().items(Joi.string()),
    colors: Joi.array().items(Joi.string())
});

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false, 
            error: error.details[0].message 
        });
    }
    next();
};
```

### Frontend Validation (validation.js)

Real-time validation as users type:

```javascript
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| Email | Valid format, unique |
| Password | Min 8 chars, mixed case, number |
| Product Name | 2-100 characters |
| Price | Positive number |
| Phone | Valid format (optional) |

---

## 🔄 CRUD Operations

### What Is CRUD?

CRUD = **C**reate, **R**ead, **U**pdate, **D**elete - the four basic operations for data management.

### Products CRUD

| Operation | Method | Endpoint | Access |
|-----------|--------|----------|--------|
| Create | POST | /api/products | Admin |
| Read All | GET | /api/products | Public |
| Read One | GET | /api/products/:id | Public |
| Update | PUT | /api/products/:id | Admin |
| Delete | DELETE | /api/products/:id | Admin |

### Example: Create Product

```javascript
// Frontend (admin.js)
const response = await ProductsAPI.create({
    name: "Summer Dress",
    price: 49.99,
    category: "women",
    description: "Beautiful floral dress",
    stock: 25,
    sizes: ["S", "M", "L"],
    colors: ["Blue", "Pink"]
});

// Backend (productController.js)
exports.createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
};
```

### Users CRUD

| Operation | Method | Endpoint | Access |
|-----------|--------|----------|--------|
| Register | POST | /api/auth/register | Public |
| Login | POST | /api/auth/login | Public |
| Get Profile | GET | /api/users/:id | Owner |
| Update Profile | PUT | /api/users/:id | Owner |
| Delete Account | DELETE | /api/users/:id | Owner/Admin |

---

## 🔗 AJAX/Fetch API

### What Is AJAX?

AJAX (Asynchronous JavaScript and XML) allows web pages to communicate with servers without reloading. We use the modern Fetch API.

### API Service (js/api.js)

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return response.json();
}

// Usage
const ProductsAPI = {
    getAll: (params) => apiRequest(`/products?${new URLSearchParams(params)}`),
    getById: (id) => apiRequest(`/products/${id}`),
    create: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' })
};
```

### Data Caching Strategy

To reduce API calls, we cache products in localStorage:

```javascript
async function fetchProductsFromAPI() {
    const response = await fetch(`${API_BASE_URL}/products?limit=100`);
    const data = await response.json();
    
    if (data.success) {
        localStorage.setItem('fashionStoreProducts', JSON.stringify(data.data));
        localStorage.setItem('productsLastSync', Date.now());
    }
    return data.data;
}

// Cache expires after 1 minute
function isCacheStale() {
    const lastSync = localStorage.getItem('productsLastSync');
    return !lastSync || (Date.now() - parseInt(lastSync)) > 60000;
}
```

---

## 🎨 UI/UX Features

### Responsive Design

- Mobile-first CSS approach
- CSS Grid and Flexbox layouts
- Breakpoints: 480px, 768px, 1024px, 1200px

### Interactive Elements

- Smooth hover animations
- Modal dialogs for quick view
- Toast notifications
- Loading spinners
- Form validation feedback

### Accessibility

- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators

---

## 📡 API Endpoints Reference

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - User login
POST   /api/auth/logout       - User logout
GET    /api/auth/me           - Get current user
PUT    /api/auth/change-password - Change password
```

### Products
```
GET    /api/products          - Get all products (paginated)
GET    /api/products/:id      - Get single product
GET    /api/products/featured - Get featured products
GET    /api/products/new-arrivals - Get new arrivals
GET    /api/products/category/:category - Get by category
GET    /api/products/search   - Search products
POST   /api/products          - Create product (admin)
PUT    /api/products/:id      - Update product (admin)
DELETE /api/products/:id      - Delete product (admin)
```

### Cart
```
GET    /api/cart              - Get user's cart
POST   /api/cart              - Add item to cart
PUT    /api/cart/:productId   - Update cart item
DELETE /api/cart/:productId   - Remove from cart
DELETE /api/cart              - Clear cart
```

### Orders
```
GET    /api/orders            - Get all orders (admin)
GET    /api/orders/my-orders  - Get user's orders
GET    /api/orders/:id        - Get single order
POST   /api/orders            - Create order
PUT    /api/orders/:id/status - Update order status (admin)
```

### Users
```
GET    /api/users             - Get all users (admin)
GET    /api/users/:id         - Get user profile
PUT    /api/users/:id         - Update profile
DELETE /api/users/:id         - Delete user
```

### Localization
```
GET    /api/locales/:lang     - Get translations
POST   /api/set-language      - Set language preference
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with validation
- [ ] User login/logout
- [ ] Browse products by category
- [ ] Add/remove cart items
- [ ] Complete checkout
- [ ] Admin product CRUD
- [ ] Search functionality
- [ ] Responsive on mobile

### API Testing with PowerShell

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:5000/api/health" | Select-Object -ExpandProperty Content

# Test products endpoint
Invoke-WebRequest -Uri "http://localhost:5000/api/products?limit=5" | Select-Object -ExpandProperty Content
```

---

## 🔧 Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 5000 is in use
- Verify MongoDB connection string
- Ensure all dependencies installed (`npm install`)

**Products not loading:**
- Clear browser localStorage
- Check browser console for errors
- Verify API is running (`/api/health`)

**Login not working:**
- Check credentials
- Verify JWT_SECRET is set
- Check network tab for errors

### Clear Cache

In browser console:
```javascript
clearCacheAndReload()
```

Or manually:
- DevTools → Application → Storage → Clear site data

---

## 👥 Team

Created for Web Development course project.

---

## 📄 License

Educational use only. Part of university coursework.

---

**Happy Shopping! 🛍️**
