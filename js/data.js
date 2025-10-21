// ===== DATA MANAGEMENT =====

// Sample Products Data
const products = [
    {
        id: 1,
        name: "Classic Cotton T-Shirt",
        price: 25.00,
        image: "images/products/1.gif",
        category: "men",
        description: "Comfortable cotton t-shirt perfect for everyday wear",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Blue", "White", "Black", "Red"],
        material: "100% Cotton",
        stock: 50,
        featured: true,
        status: "active"
    },
    {
        id: 2,
        name: "Elegant Summer Dress",
        price: 50.00,
        image: "images/products/1R5A0057_1_2.jpg",
        category: "women",
        description: "Beautiful summer dress with floral pattern",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Floral", "Blue", "Pink"],
        material: "Polyester Blend",
        stock: 30,
        featured: true,
        status: "active"
    },
    {
        id: 3,
        name: "Kids Winter Jacket",
        price: 45.00,
        image: "images/products/1R5A0160.jpg",
        category: "kids",
        description: "Warm and cozy winter jacket for kids",
        brand: "SOLARA",
        sizes: ["4", "6", "8", "10", "12"],
        colors: ["Red", "Blue", "Green"],
        material: "Polyester with Fleece Lining",
        stock: 25,
        featured: true,
        status: "active"
    },
    {
        id: 4,
        name: "Classic Oxford Shirt",
        price: 40.00,
        image: "images/products/1W2A0097.jpg",
        category: "men",
        description: "Professional oxford shirt for business casual",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Blue", "Pink"],
        material: "100% Cotton Oxford",
        stock: 40,
        featured: false,
        status: "active"
    },
    {
        id: 5,
        name: "Slim Fit Jeans",
        price: 60.00,
        image: "images/products/1W2A0099-Edit_5.jpg",
        category: "men",
        description: "Modern slim fit jeans with stretch comfort",
        brand: "SOLARA",
        sizes: ["28", "30", "32", "34", "36", "38"],
        colors: ["Dark Blue", "Light Blue", "Black"],
        material: "98% Cotton, 2% Elastane",
        stock: 35,
        featured: false,
        status: "active"
    },
    {
        id: 6,
        name: "Leather Derby Shoes",
        price: 80.00,
        image: "images/products/1W2A3842HQ_996391aa-7b22-4f88-a959-d83f639ffbbf_2.jpg",
        category: "men",
        description: "Premium leather derby shoes for formal occasions",
        brand: "SOLARA",
        sizes: ["7", "8", "9", "10", "11", "12"],
        colors: ["Brown", "Black"],
        material: "Genuine Leather",
        stock: 20,
        featured: false,
        status: "active"
    },
    {
        id: 7,
        name: "Silk Ruffle Blouse",
        price: 55.00,
        image: "images/products/1W2A3908HQ_4.jpg",
        category: "women",
        description: "Elegant silk blouse with ruffle details",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L"],
        colors: ["White", "Black", "Navy"],
        material: "100% Silk",
        stock: 28,
        featured: false,
        status: "active"
    },
    {
        id: 8,
        name: "A-Line Midi Skirt",
        price: 48.00,
        image: "images/products/1W2A4118_2.jpg",
        category: "women",
        description: "Classic A-line midi skirt for versatile styling",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Navy", "Gray"],
        material: "Polyester Blend",
        stock: 32,
        featured: false,
        status: "active"
    },
    {
        id: 9,
        name: "Crossbody Leather Bag",
        price: 75.00,
        image: "images/products/1W2A4345_copy_5.jpg",
        category: "women",
        description: "Stylish crossbody bag made from premium leather",
        brand: "SOLARA",
        colors: ["Brown", "Black", "Tan"],
        material: "Genuine Leather",
        stock: 15,
        featured: false,
        status: "active"
    },
    {
        id: 10,
        name: "Graphic Print T-Shirt",
        price: 15.00,
        image: "images/products/2_4.gif",
        category: "kids",
        description: "Fun graphic print t-shirt for kids",
        brand: "SOLARA",
        sizes: ["2", "4", "6", "8", "10", "12"],
        colors: ["Blue", "Red", "Green", "Yellow"],
        material: "100% Cotton",
        stock: 45,
        featured: false,
        status: "active"
    },
    {
        id: 11,
        name: "Comfortable Jogger Pants",
        price: 20.00,
        image: "images/products/1W2A6581_0f869f30-1398-4694-9c5e-6413bded0bc8_1.jpg",
        category: "kids",
        description: "Comfortable jogger pants for active kids",
        brand: "SOLARA",
        sizes: ["2", "4", "6", "8", "10", "12"],
        colors: ["Gray", "Navy", "Black"],
        material: "Cotton Blend",
        stock: 38,
        featured: false,
        status: "active"
    },
    {
        id: 12,
        name: "Light-Up Sneakers",
        price: 35.00,
        image: "images/products/1W2A6997_1fc82186-029c-4dca-8b2b-bcb246902a85_3.jpg",
        category: "kids",
        description: "Fun light-up sneakers that kids will love",
        brand: "SOLARA",
        sizes: ["10", "11", "12", "13", "1", "2", "3"],
        colors: ["Blue", "Pink", "Green", "Red"],
        material: "Synthetic Materials",
        stock: 22,
        featured: false,
        status: "active"
    },
    {
        id: 13,
        name: "Casual Polo Shirt",
        price: 35.00,
        image: "images/products/1W2A7021.jpg",
        category: "men",
        description: "Classic polo shirt for casual occasions",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Navy", "Red"],
        material: "100% Cotton Pique",
        stock: 42,
        featured: false,
        status: "active"
    },
    {
        id: 14,
        name: "Designer Blazer",
        price: 120.00,
        image: "images/products/215576B3-B23A-443F-AE54-5F7179347F5C_1.jpg",
        category: "women",
        description: "Professional blazer for business attire",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Gray"],
        material: "Wool Blend",
        stock: 18,
        featured: false,
        status: "active"
    },
    {
        id: 15,
        name: "Active Sports Shorts",
        price: 25.00,
        image: "images/products/6_d81aa1cd-fb9c-42f8-9ee6-88c004f8c4fd_5.jpg",
        category: "kids",
        description: "Comfortable sports shorts for active kids",
        brand: "SOLARA",
        sizes: ["4", "6", "8", "10", "12", "14"],
        colors: ["Blue", "Red", "Green", "Black"],
        material: "Polyester Blend",
        stock: 35,
        featured: false,
        status: "active"
    },
    {
        id: 16,
        name: "Streetwear Hoodie",
        price: 65.00,
        image: "images/products/9.gif",
        category: "men",
        description: "Trendy streetwear hoodie with modern design",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Gray", "White"],
        material: "Cotton Blend",
        stock: 28,
        featured: false,
        status: "active"
    },
    {
        id: 17,
        name: "Elegant Evening Gown",
        price: 150.00,
        image: "images/products/IMG_6838.gif",
        category: "women",
        description: "Stunning evening gown for special occasions",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Navy", "Red"],
        material: "Silk Chiffon",
        stock: 12,
        featured: false,
        status: "active"
    },
    {
        id: 18,
        name: "Urban Street Jacket",
        price: 85.00,
        image: "images/products/omar7barakat_StreetWear_-27_1.jpg",
        category: "men",
        description: "Modern urban jacket with streetwear style",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Olive", "Navy"],
        material: "Cotton Canvas",
        stock: 22,
        featured: false,
        status: "active"
    }
];

// Sample Users Data
const users = [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "+1-555-0123",
        dateOfBirth: "1990-05-15",
        gender: "male",
        addresses: [
            {
                id: 1,
                type: "home",
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                country: "US",
                isDefault: true
            }
        ],
        preferences: {
            emailNotifications: true,
            smsNotifications: false,
            newsletter: true,
            sizePreference: "M",
            stylePreference: "casual"
        },
        createdAt: "2024-01-01"
    },
    {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "password123",
        phone: "+1-555-0124",
        dateOfBirth: "1992-08-22",
        gender: "female",
        addresses: [
            {
                id: 2,
                type: "home",
                street: "456 Oak Ave",
                city: "Los Angeles",
                state: "CA",
                zipCode: "90210",
                country: "US",
                isDefault: true
            }
        ],
        preferences: {
            emailNotifications: true,
            smsNotifications: true,
            newsletter: true,
            sizePreference: "S",
            stylePreference: "formal"
        },
        createdAt: "2024-01-05"
    }
];

// Sample Orders Data
const orders = [
    {
        id: "FS-2024-001",
        userId: 1,
        items: [
            { productId: 1, quantity: 2, price: 25.00 },
            { productId: 5, quantity: 1, price: 60.00 }
        ],
        total: 110.00,
        status: "delivered",
        shippingAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "US"
        },
        paymentMethod: "credit-card",
        createdAt: "2024-01-15T10:30:00Z",
        deliveredAt: "2024-01-18T14:20:00Z"
    },
    {
        id: "FS-2024-002",
        userId: 2,
        items: [
            { productId: 2, quantity: 1, price: 50.00 }
        ],
        total: 50.00,
        status: "shipped",
        shippingAddress: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "US"
        },
        paymentMethod: "paypal",
        createdAt: "2024-01-20T15:45:00Z",
        shippedAt: "2024-01-22T09:15:00Z"
    },
    {
        id: "FS-2024-003",
        userId: 1,
        items: [
            { productId: 6, quantity: 1, price: 80.00 }
        ],
        total: 80.00,
        status: "processing",
        shippingAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "US"
        },
        paymentMethod: "credit-card",
        createdAt: "2024-01-25T11:20:00Z"
    }
];

// ===== LOCAL STORAGE FUNCTIONS =====

// Initialize data in localStorage if not exists
function initializeData() {
    if (!localStorage.getItem('fashionStoreProducts')) {
        localStorage.setItem('fashionStoreProducts', JSON.stringify(products));
    }
    
    if (!localStorage.getItem('fashionStoreUsers')) {
        localStorage.setItem('fashionStoreUsers', JSON.stringify(users));
    }
    
    if (!localStorage.getItem('fashionStoreOrders')) {
        localStorage.setItem('fashionStoreOrders', JSON.stringify(orders));
    }
    
    if (!localStorage.getItem('fashionStoreCart')) {
        localStorage.setItem('fashionStoreCart', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('fashionStoreWishlist')) {
        localStorage.setItem('fashionStoreWishlist', JSON.stringify([]));
    }

    // Run data migrations to keep stored data consistent with latest app expectations
    runDataMigrations();
}

// Keep previously stored data compatible with latest paths/structures
function runDataMigrations() {
    try {
        // Ensure product.image paths include the images/ prefix
        const storedProducts = getProducts();
        let changed = false;
        const normalized = storedProducts.map(p => {
            if (!p || !p.image) return p;
            // Already absolute or prefixed
            const img = String(p.image);
            if (
                img.startsWith('http://') ||
                img.startsWith('https://') ||
                img.startsWith('images/') ||
                img.startsWith('../images/')
            ) {
                return p;
            }
            // Prefix missing images/
            changed = true;
            return { ...p, image: `images/${img.replace(/^\/?/, '')}` };
        });
        if (changed) {
            saveProducts(normalized);
        }
    } catch (_) {
        // no-op
    }
}

// Get data from localStorage
function getProducts() {
    return JSON.parse(localStorage.getItem('fashionStoreProducts')) || [];
}

function getUsers() {
    return JSON.parse(localStorage.getItem('fashionStoreUsers')) || [];
}

function getOrders() {
    return JSON.parse(localStorage.getItem('fashionStoreOrders')) || [];
}

function getCart() {
    return JSON.parse(localStorage.getItem('fashionStoreCart')) || [];
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('fashionStoreWishlist')) || [];
}

// Save data to localStorage
function saveProducts(products) {
    localStorage.setItem('fashionStoreProducts', JSON.stringify(products));
}

function saveUsers(users) {
    localStorage.setItem('fashionStoreUsers', JSON.stringify(users));
}

function saveOrders(orders) {
    localStorage.setItem('fashionStoreOrders', JSON.stringify(orders));
}

function saveCart(cart) {
    localStorage.setItem('fashionStoreCart', JSON.stringify(cart));
}

function saveWishlist(wishlist) {
    localStorage.setItem('fashionStoreWishlist', JSON.stringify(wishlist));
}

// ===== PRODUCT FUNCTIONS =====

function findProductById(id) {
    const products = getProducts();
    return products.find(product => product.id === parseInt(id));
}

function getProductsByCategory(category) {
    const products = getProducts();
    if (category === 'all') {
        return products;
    }
    return products.filter(product => product.category === category);
}

function getFeaturedProducts() {
    const products = getProducts();
    return products.filter(product => product.featured);
}

function addProduct(product) {
    const products = getProducts();
    const newId = Math.max(...products.map(p => p.id)) + 1;
    const newProduct = {
        ...product,
        id: newId,
        stock: product.stock || 0,
        status: product.status || 'active',
        featured: product.featured || false
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

function updateProduct(id, updatedProduct) {
    const products = getProducts();
    const index = products.findIndex(product => product.id === parseInt(id));
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts(products);
        return products[index];
    }
    return null;
}

function deleteProduct(id) {
    const products = getProducts();
    const filteredProducts = products.filter(product => product.id !== parseInt(id));
    saveProducts(filteredProducts);
    return true;
}

// ===== USER FUNCTIONS =====

function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email === email);
}

function findUserById(id) {
    const users = getUsers();
    return users.find(user => user.id === parseInt(id));
}

function addUser(user) {
    const users = getUsers();
    const newId = Math.max(...users.map(u => u.id)) + 1;
    const newUser = {
        ...user,
        id: newId,
        addresses: user.addresses || [],
        preferences: user.preferences || {
            emailNotifications: true,
            smsNotifications: false,
            newsletter: false,
            sizePreference: "",
            stylePreference: ""
        },
        createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

function updateUser(id, updatedUser) {
    const users = getUsers();
    const index = users.findIndex(user => user.id === parseInt(id));
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        saveUsers(users);
        return users[index];
    }
    return null;
}

// ===== CART FUNCTIONS =====

function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === parseInt(productId));
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: parseInt(productId),
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    updateCartCount();
    return cart;
}

function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.productId !== parseInt(productId));
    saveCart(filteredCart);
    updateCartCount();
    return filteredCart;
}

function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.productId === parseInt(productId));
    
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
            updateCartCount();
            return cart;
        }
    }
    
    return cart;
}

function clearCart() {
    saveCart([]);
    updateCartCount();
    return [];
}

function getCartTotal() {
    const cart = getCart();
    const products = getProducts();
    
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? product.price * item.quantity : 0);
    }, 0);
}

// ===== WISHLIST FUNCTIONS =====

function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(parseInt(productId))) {
        wishlist.push(parseInt(productId));
        saveWishlist(wishlist);
        if (typeof updateWishlistCount === 'function') {
            updateWishlistCount();
        }
    }
    return wishlist;
}

function removeFromWishlist(productId) {
    const wishlist = getWishlist();
    const filteredWishlist = wishlist.filter(id => id !== parseInt(productId));
    saveWishlist(filteredWishlist);
    if (typeof updateWishlistCount === 'function') {
        updateWishlistCount();
    }
    return filteredWishlist;
}

function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(parseInt(productId));
}

// Make wishlist functions global for onclick handlers
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.isInWishlist = isInWishlist;

// ===== ORDER FUNCTIONS =====

function createOrder(orderData) {
    const orders = getOrders();
    const newOrderId = `FS-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    
    const newOrder = {
        id: newOrderId,
        userId: orderData.userId,
        items: orderData.items,
        total: orderData.total,
        status: 'processing',
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    saveOrders(orders);
    return newOrder;
}

function getOrdersByUserId(userId) {
    const orders = getOrders();
    return orders.filter(order => order.userId === parseInt(userId));
}

function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if (status === 'shipped') {
            order.shippedAt = new Date().toISOString();
        } else if (status === 'delivered') {
            order.deliveredAt = new Date().toISOString();
        }
        saveOrders(orders);
        return order;
    }
    return null;
}

// ===== UTILITY FUNCTIONS =====

function formatPrice(price) {
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== SEARCH AND FILTER FUNCTIONS =====

function searchProducts(query, category = 'all') {
    const products = getProductsByCategory(category);
    if (!query) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.material.toLowerCase().includes(lowercaseQuery)
    );
}

function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        case 'newest':
            return sortedProducts.sort((a, b) => b.id - a.id);
        default:
            return sortedProducts;
    }
}

// Initialize data when the script loads
document.addEventListener('DOMContentLoaded', initializeData);
