// ===== MAIN APPLICATION LOGIC =====

// Global variables
let currentUser = null;
let currentCategory = 'all';
let currentSort = 'newest';

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    loadBestSellers();
    loadNewArrivals();
    updateCartCount();
    updateWishlistCount();
    checkUserAuth();
    setupFloatingButton();
    setupScrollEffects();
});

// Resolve asset paths from root and subpages
function getAssetPath(relativePath) {
    // If we're already at root (index.html), use as-is
    // If we're in a subpage under /pages, prefix with '../'
    try {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return `../${relativePath}`;
        }
        return relativePath;
    } catch (_) {
        return relativePath;
    }
}

function initializeApp() {
    // Initialize universal navigation
    initializeUniversalNavigation();
    
    // Initialize data
    initializeData();
    
    // Setup user authentication state
    checkUserAuth();
    
    // Setup password toggles
    setupPasswordToggle();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup search functionality
    setupSearch();
    
    // Setup category filters
    setupCategoryFilters();
    
    // Setup newsletter form
    setupNewsletterForm();
    
    // Setup FAQ accordion
    setupFAQAccordion();
    
    // Setup login form
    setupLoginForm();
    
    // Setup registration form
    setupRegistrationForm();
    
    // Setup navigation active states
    setupNavigationActiveStates();

    // Setup global image placeholders and button guards
    setupGlobalPlaceholders();
    setupDisabledButtonsGuard();
    
    // Setup password toggles
    setupPasswordToggle();
}

function initializeUniversalNavigation() {
    // Check if navigation already exists
    const existingNav = document.querySelector('.main-header');
    const navHTML = createUniversalNavigation();
    if (existingNav) {
        // Replace existing navigation with universal one
        existingNav.outerHTML = navHTML;
    } else {
        // Insert at top if missing (e.g., some pages like Contact)
        const body = document.body;
        if (body) {
            body.insertAdjacentHTML('afterbegin', navHTML);
        }
    }
    
    // Setup dropdown after DOM is updated
    setTimeout(() => {
        setupMyAccountDropdown();
    }, 0);
}

// ===== NAVIGATION =====

function createUniversalNavigation() {
    const currentPath = window.location.pathname;
    const isSubPage = currentPath.includes('/pages/') || currentPath.includes('/admin/');
    const basePath = isSubPage ? '../' : '';
    
    return `
        <header class="main-header">
            <nav class="navbar">
                <div class="nav-brand">
                    <a href="${basePath}index.html">
                        <i class="fas fa-sun"></i>
                        SOLARA
                    </a>
                </div>
                
                <ul class="nav-menu">
                    <li><a href="${basePath}index.html" class="nav-link">Home</a></li>
                    <li><a href="${basePath}pages/men.html" class="nav-link">Men</a></li>
                    <li><a href="${basePath}pages/women.html" class="nav-link">Women</a></li>
                    <li><a href="${basePath}pages/kids.html" class="nav-link">Kids</a></li>
                    <li><a href="${basePath}pages/contact.html" class="nav-link">Contact</a></li>
                </ul>
                
                <div class="nav-actions">
                    <div class="search-box">
                        <input type="text" placeholder="Search products..." id="search-input">
                        <button type="button" id="search-btn"><i class="fas fa-search"></i></button>
                    </div>
                    
                    <div class="user-actions">
                        <a href="${basePath}pages/cart.html" class="nav-icon" id="cart-link">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count" id="cart-count">0</span>
                        </a>
                        <a href="${basePath}pages/wishlist.html" class="nav-icon" id="wishlist-link">
                            <i class="fas fa-heart"></i>
                            <span class="wishlist-count" id="wishlist-count">0</span>
                        </a>
                        <a href="${basePath}login.html" class="nav-icon" id="login-link">
                            <i class="fas fa-user"></i>
                            Login
                        </a>
                        <div class="dropdown my-account hidden" id="my-account">
                            <button class="dropdown-toggle" id="my-account-toggle">
                                <i class="fas fa-user-circle"></i>
                                My Account
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu" id="my-account-menu">
                                <a href="${basePath}pages/profile.html" id="profile-link"><i class="fas fa-id-card"></i> My Profile</a>
                                <a href="${basePath}pages/orders.html" id="orders-link"><i class="fas fa-box"></i> My Orders</a>
                                <a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
                            </div>
                        </div>
                        <a href="${basePath}admin/admin.html" class="nav-icon subtle" id="admin-link" title="Admin">
                            <i class="fas fa-cog"></i>
                            Admin
                        </a>
                    </div>
                </div>
                
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </header>
    `;
}

function setupNavigationActiveStates() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove all active classes first
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active state based on current page
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Handle different page types
        if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
            if (href === 'index.html' || href === '../index.html') {
                link.classList.add('active');
            }
        } else if (currentPath.includes('men.html')) {
            if (href === 'men.html' || href.includes('men.html')) {
                link.classList.add('active');
            }
        } else if (currentPath.includes('women.html')) {
            if (href === 'women.html' || href.includes('women.html')) {
                link.classList.add('active');
            }
        } else if (currentPath.includes('kids.html')) {
            if (href === 'kids.html' || href.includes('kids.html')) {
                link.classList.add('active');
            }
        } else if (currentPath.includes('contact.html')) {
            if (href === 'contact.html' || href.includes('contact.html')) {
                link.classList.add('active');
            }
        } else if (currentPath.includes('cart.html')) {
            // Cart page doesn't have a nav link, but we can highlight cart icon
            const cartIcon = document.querySelector('.nav-icon[href*="cart"]');
            if (cartIcon) {
                cartIcon.classList.add('active');
            }
        } else if (currentPath.includes('profile.html')) {
            // Profile page doesn't have a nav link, but we can highlight profile icon
            const profileIcon = document.querySelector('.nav-icon[href*="profile"]');
            if (profileIcon) {
                profileIcon.classList.add('active');
            }
        } else if (currentPath.includes('orders.html')) {
            // Orders page doesn't have a nav link, but we can highlight orders icon
            const ordersIcon = document.querySelector('.nav-icon[href*="orders"]');
            if (ordersIcon) {
                ordersIcon.classList.add('active');
            }
        }
    });
}

// ===== AUTHENTICATION =====

function checkUserAuth() {
    // Check for API auth first
    if (typeof AuthAPI !== 'undefined') {
        const user = AuthAPI.getCurrentUser();
        if (user) {
            currentUser = user;
            updateAuthUI();
            return;
        }
    }
    
    // Fallback to localStorage
    const loggedInUser = localStorage.getItem('loggedInUser') || localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const myAccount = document.getElementById('my-account');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (myAccount) myAccount.classList.remove('hidden');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.firstName}`;
            welcomeMessage.style.display = 'block';
        }
    } else {
        if (loginLink) loginLink.style.display = 'flex';
        if (myAccount) myAccount.classList.add('hidden');
        if (welcomeMessage) welcomeMessage.style.display = 'none';
    }
}

async function login(email, password) {
    try {
        // Use the API for login
        if (typeof AuthAPI !== 'undefined') {
            const response = await AuthAPI.login(email, password);
            if (response.success) {
                currentUser = response.data.user;
                updateAuthUI();
                return { success: true, user: response.data.user };
            }
            return { success: false, message: response.error || 'Login failed' };
        }
        
        // Fallback to localStorage if API not available
        const users = JSON.parse(localStorage.getItem('solaraUsers') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'No account found with this email address' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'Invalid email or password' };
        }
        
        currentUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        updateAuthUI();
        return { success: true, user };
    } catch (error) {
        return { success: false, message: error.message || 'Login failed' };
    }
}

async function register(userData) {
    try {
        // Use the API for registration
        if (typeof AuthAPI !== 'undefined') {
            const response = await AuthAPI.register({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.password,
                phone: userData.phone,
                dateOfBirth: userData.dateOfBirth,
                gender: userData.gender
            });
            
            if (response.success) {
                currentUser = response.data.user;
                updateAuthUI();
                return { success: true, user: response.data.user };
            }
            return { success: false, message: response.error || 'Registration failed' };
        }
        
        // Fallback to localStorage if API not available
        const users = JSON.parse(localStorage.getItem('solaraUsers') || '[]');
        
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }
        
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('solaraUsers', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('loggedInUser', JSON.stringify(newUser));
        updateAuthUI();
        
        return { success: true, user: newUser };
    } catch (error) {
        return { success: false, message: error.message || 'Registration failed' };
    }
}

async function logout() {
    // Use API logout if available
    if (typeof AuthAPI !== 'undefined') {
        await AuthAPI.logout();
    }
    
    currentUser = null;
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('solaraAdminAuthed');
    localStorage.removeItem('isAdmin');
    updateAuthUI();
    
    // Redirect to home page
    if (window.location.pathname.includes('admin')) {
        window.location.href = '../index.html';
    } else if (window.location.pathname.includes('pages')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Make logout globally accessible
window.logout = logout;


// Add onclick fallbacks for logout buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add onclick fallbacks for user logout
    const logoutLinks = document.querySelectorAll('#logout-link');
    logoutLinks.forEach(link => {
        if (!link.onclick) {
            link.onclick = function(e) {
                e.preventDefault();
                logout();
                return false;
            };
        }
    });
    
    // Add onclick fallbacks for admin logout
    const adminLogoutLinks = document.querySelectorAll('#admin-logout');
    adminLogoutLinks.forEach(link => {
        if (!link.onclick) {
            link.onclick = function(e) {
                e.preventDefault();
                if (typeof handleAdminLogout === 'function') {
                    handleAdminLogout(e);
                } else {
                    logout();
                }
                return false;
            };
        }
    });
});

// ===== PASSWORD TOGGLE FUNCTIONALITY =====

function setupPasswordToggle() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.password-toggle')) {
            e.preventDefault();
            e.stopPropagation();
            const toggle = e.target.closest('.password-toggle');
            const input = toggle.parentElement.querySelector('input');
            const icon = toggle.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    });
}

// ===== PRODUCT DISPLAY =====

async function loadProducts(category = 'all', sortBy = 'newest') {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Show loading state
    productsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>';
    
    try {
        let products = [];
        
        // Use API if available
        if (typeof ProductsAPI !== 'undefined') {
            const params = { sort: sortBy };
            if (category && category !== 'all') {
                params.category = category;
            }
            const response = await ProductsAPI.getAll(params);
            if (response.success) {
                products = response.data;
            }
        } else {
            // Fallback to localStorage
            products = getProductsByCategory(category);
            products = sortProducts(products, sortBy);
        }
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }
        
        productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        
        // Add event listeners to product cards
        setupProductCardEvents();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to localStorage data
        let products = getProductsByCategory(category);
        products = sortProducts(products, sortBy);
        productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        setupProductCardEvents();
    }
}

function loadBestSellers() {
    const bestSellersGrid = document.getElementById('best-sellers-grid');
    if (!bestSellersGrid) return;
    
    // Temporary products for best sellers - MAX 3
    const tempProducts = [
        { id: 1, name: "Classic Cotton T-Shirt", price: 25.00, image: "images/products/1.gif", category: "men", description: "Comfortable cotton t-shirt", brand: "SOLARA", sizes: ["S", "M", "L", "XL"], colors: ["Blue", "White", "Black"], material: "100% Cotton", stock: 50, featured: true, status: "active" },
        { id: 2, name: "Elegant Summer Dress", price: 50.00, image: "images/products/1R5A0057_1_2.jpg", category: "women", description: "Beautiful summer dress", brand: "SOLARA", sizes: ["XS", "S", "M", "L"], colors: ["Floral", "Blue"], material: "Polyester Blend", stock: 30, featured: true, status: "active" },
        { id: 3, name: "Kids Winter Jacket", price: 45.00, image: "images/products/1R5A0160.jpg", category: "kids", description: "Warm winter jacket", brand: "SOLARA", sizes: ["4", "6", "8", "10"], colors: ["Red", "Blue"], material: "Polyester", stock: 25, featured: true, status: "active" }
    ];
    
    bestSellersGrid.innerHTML = tempProducts.map(product => createProductCard(product)).join('');
    
    // Add event listeners to best seller cards
    setupProductCardEvents();
}

function loadNewArrivals() {
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (!newArrivalsGrid) return;
    
    // Temporary products for new arrivals - MAX 3
    const tempProducts = [
        { id: 9, name: "Trendy Sneakers", price: 80.00, image: "images/products/1W2A4345_copy_5.jpg", category: "men", description: "Comfortable sneakers", brand: "SOLARA", sizes: ["8", "9", "10", "11"], colors: ["White", "Black"], material: "Canvas", stock: 20, featured: true, status: "active" },
        { id: 10, name: "Elegant Blazer", price: 120.00, image: "images/products/2_4.gif", category: "women", description: "Professional blazer", brand: "SOLARA", sizes: ["XS", "S", "M", "L"], colors: ["Black", "Navy"], material: "Wool Blend", stock: 15, featured: true, status: "active" },
        { id: 11, name: "Kids Sneakers", price: 45.00, image: "images/products/1W2A6581_0f869f30-1398-4694-9c5e-6413bded0bc8_1.jpg", category: "kids", description: "Comfortable kids shoes", brand: "SOLARA", sizes: ["3", "4", "5", "6"], colors: ["Red", "Blue"], material: "Synthetic", stock: 30, featured: true, status: "active" }
    ];
    
    newArrivalsGrid.innerHTML = tempProducts.map(product => createProductCard(product)).join('');
    
    // Add event listeners to new arrival cards
    setupProductCardEvents();
}

function createProductCard(product) {
    // Handle both MongoDB (_id) and localStorage (id) product formats
    const productId = product._id || product.id;
    const inWishlist = isInWishlist(productId);
    const wishlistClass = inWishlist ? 'active' : '';
    
    // Add sale badge for products with comparePrice or randomly for demo
    const isOnSale = product.comparePrice ? true : Math.random() > 0.7;
    const saleBadge = isOnSale ? '<div class="sale-badge">SALE</div>' : '';
    
    // Handle image path - API returns relative path
    const imagePath = product.image || product.primaryImage || 'images/placeholder.jpg';
    
    return `
        <div class="product-card" data-product-id="${productId}">
            <div class="product-image">
                ${saleBadge}
                <img src="${getAssetPath(imagePath)}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display:none;">
                    <i class="fas fa-image"></i>
                </div>
                <div class="product-overlay">
                    <button class="wishlist-btn ${wishlistClass}" data-product-id="${productId}" title="Add to wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="quick-view-btn" data-product-id="${productId}" title="Quick view">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-card-content">
                <p class="category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <h3>${product.name}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                <div class="product-actions">
                    <button class="btn btn-primary btn-add-to-cart" data-product-id="${productId}">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupProductCardEvents() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            addToCart(productId);
            showNotification('Product added to cart!', 'success');
        });
    });
    
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            toggleWishlist(productId);
        });
    });
    
    // Quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            showQuickView(productId);
        });
    });
    
    // Product card hover effects
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hovered');
        });
    });
}

// ===== CART FUNCTIONALITY =====

// Make addToCart global for onclick handlers
window.addToCart = function(productId, quantity = 1) {
    const product = getProducts().find(p => p.id === parseInt(productId));
    if (!product) return;
    
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === parseInt(productId));
    
    if (existingItem) {
        existingItem.quantity += parseInt(quantity);
    } else {
        cart.push({
            productId: parseInt(productId),
            quantity: parseInt(quantity)
        });
    }
    
    saveCart(cart);
    updateCartCount();
    
    // Add visual feedback
    const button = document.querySelector(`[data-product-id="${productId}"].btn-add-to-cart`);
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
        }, 2000);
    }
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Product added to cart!', 'success');
    }
};

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

function loadCartItems() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    const cart = getCart();
    const products = getProducts();
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        
        return createCartItemHTML(item, product);
    }).join('');
    
    setupCartItemEvents();
    updateCartTotal();
}

function createCartItemHTML(item, product) {
    return `
        <div class="cart-item" data-product-id="${item.productId}">
            <div class="item-image">
                <img src="${getAssetPath(product.image)}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display:none; width:100%; height:200px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#999;">
                    <i class="fas fa-image"></i>
                </div>
            </div>
            <div class="item-details">
                <h3>${product.name}</h3>
                <p class="item-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)} Collection</p>
                <div class="item-options">
                    <span class="size">Size: M</span>
                    <span class="color">Color: Blue</span>
                </div>
                <p class="item-price">${formatPrice(product.price)}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-product-id="${item.productId}">
                <button class="quantity-btn" data-action="increase" data-product-id="${item.productId}">+</button>
            </div>
            <div class="item-total">
                <p class="total-price">${formatPrice(product.price * item.quantity)}</p>
            </div>
            <div class="item-actions">
                <button class="remove-btn" data-product-id="${item.productId}" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="wishlist-btn" data-product-id="${item.productId}" title="Move to wishlist">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
}

function setupCartItemEvents() {
    // Quantity controls
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = button.dataset.productId;
            const action = button.dataset.action;
            const input = document.querySelector(`input[data-product-id="${productId}"]`);
            let quantity = parseInt(input.value);
            
            if (action === 'increase') {
                quantity++;
            } else if (action === 'decrease') {
                quantity = Math.max(1, quantity - 1);
            }
            
            updateCartItemQuantity(productId, quantity);
            loadCartItems(); // Reload to update totals
        });
    });
    
    // Quantity input changes
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = input.dataset.productId;
            const quantity = Math.max(1, parseInt(input.value) || 1);
            updateCartItemQuantity(productId, quantity);
            loadCartItems(); // Reload to update totals
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = button.dataset.productId;
            removeFromCart(productId);
            loadCartItems();
            showNotification('Item removed from cart', 'info');
        });
    });
    
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = button.dataset.productId;
            addToWishlist(productId);
            removeFromCart(productId);
            loadCartItems();
            showNotification('Item moved to wishlist', 'success');
        });
    });
}

function updateCartTotal() {
    const total = getCartTotal();
    const subtotalElements = document.querySelectorAll('.subtotal');
    const totalElements = document.querySelectorAll('.total');
    
    subtotalElements.forEach(element => {
        element.textContent = formatPrice(total);
    });
    
    totalElements.forEach(element => {
        element.textContent = formatPrice(total);
    });
}

// ===== WISHLIST FUNCTIONALITY =====

function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        showNotification('Removed from wishlist', 'info');
    } else {
        addToWishlist(productId);
        showNotification('Added to wishlist', 'success');
    }
    
    updateWishlistCount();
    updateWishlistButtons();
}

function updateWishlistCount() {
    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    const wishlist = getWishlist();
    const count = wishlist.length;
    
    wishlistCountElements.forEach(element => {
        element.textContent = count;
    });
}

function updateWishlistButtons() {
    const wishlist = getWishlist();
    
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        const productId = parseInt(button.dataset.productId);
        if (wishlist.includes(productId)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// ===== SEARCH AND FILTERS =====

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            performSearch(query);
        }, 300));
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value;
            performSearch(query);
        });
    }
}

function performSearch(query) {
    const products = searchProducts(query, currentCategory);
    const sortedProducts = sortProducts(products, currentSort);
    displaySearchResults(sortedProducts);
}

function displaySearchResults(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    setupProductCardEvents();
}

function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update current category
            currentCategory = button.dataset.category;
            
            // Load products for new category
            loadProducts(currentCategory, currentSort);
        });
    });
}

// ===== MOBILE MENU =====

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

function setupMyAccountDropdown() {
    const myAccount = document.getElementById('my-account');
    const myAccountToggle = document.getElementById('my-account-toggle');
    const myAccountMenu = document.getElementById('my-account-menu');
    
    if (!myAccount || !myAccountToggle || !myAccountMenu) {
        return;
    }
    
    // Toggle on click
    myAccountToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        myAccount.classList.toggle('open');
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#my-account')) {
            myAccount.classList.remove('open');
        }
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') myAccount.classList.remove('open');
    });
    
    // Navigate within menu
    myAccountMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            myAccount.classList.remove('open');
        });
    });
}

// ===== NEWSLETTER FORM =====

function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Simulate newsletter subscription
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset();
        });
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const emailError = document.getElementById('email-error');
            const passwordError = document.getElementById('password-error');
            const generalError = document.getElementById('general-error');
            
            // Clear previous errors
            emailError.textContent = '';
            passwordError.textContent = '';
            if (generalError) { generalError.textContent = ''; generalError.style.display = 'none'; }
            
            // Validate email format
            if (!email || !email.includes('@')) {
                emailError.textContent = 'Please enter a valid email address';
                return;
            }
            
            // Validate password
            if (!password || password.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            // Attempt database login
            login(email, password).then(result => {
                if (result.success) {
                    showNotification('Login successful! Welcome back!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    if (generalError) { 
                        generalError.textContent = result.message || 'Incorrect password'; 
                        generalError.style.display = 'block'; 
                    } else { 
                        passwordError.textContent = 'Incorrect password'; 
                    }
                }
            });
        });
    }
}

function setupRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            
            // Get error elements
            const firstNameError = document.getElementById('firstName-error');
            const lastNameError = document.getElementById('lastName-error');
            const emailError = document.getElementById('email-error');
            const phoneError = document.getElementById('phone-error');
            const passwordError = document.getElementById('password-error');
            const confirmPasswordError = document.getElementById('confirmPassword-error');
            const dateOfBirthError = document.getElementById('dateOfBirth-error');
            const generalError = document.getElementById('general-error');
            
            // Clear previous errors
            [firstNameError, lastNameError, emailError, phoneError, passwordError, confirmPasswordError, dateOfBirthError].forEach(el => {
                if (el) el.textContent = '';
            });
            if (generalError) { generalError.textContent = ''; generalError.style.display = 'none'; }
            
            let hasErrors = false;
            
            // Validate first name
            if (!firstName || firstName.trim().length < 2) {
                if (firstNameError) firstNameError.textContent = 'First name must be at least 2 characters';
                hasErrors = true;
            }
            
            // Validate last name
            if (!lastName || lastName.trim().length < 2) {
                if (lastNameError) lastNameError.textContent = 'Last name must be at least 2 characters';
                hasErrors = true;
            }
            
            // Validate email
            if (!email || !email.includes('@') || !email.includes('.')) {
                if (emailError) emailError.textContent = 'Please enter a valid email address';
                hasErrors = true;
            }
            
            // Validate phone
            if (!phone || phone.length < 10) {
                if (phoneError) phoneError.textContent = 'Please enter a valid phone number';
                hasErrors = true;
            }
            
            // Validate password
            if (!password || password.length < 8) {
                if (passwordError) passwordError.textContent = 'Password must be at least 8 characters';
                hasErrors = true;
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
                if (passwordError) passwordError.textContent = 'Password must contain uppercase, lowercase, and number';
                hasErrors = true;
            }
            
            // Validate confirm password
            if (password !== confirmPassword) {
                if (confirmPasswordError) confirmPasswordError.textContent = 'Passwords do not match';
                hasErrors = true;
            }
            
            // Validate date of birth
            if (!dateOfBirth) {
                if (dateOfBirthError) dateOfBirthError.textContent = 'Date of birth is required';
                hasErrors = true;
            } else {
                const dob = new Date(dateOfBirth);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (dob >= today) {
                    if (dateOfBirthError) dateOfBirthError.textContent = 'Date of birth cannot be today or in the future';
                    hasErrors = true;
                } else {
                    // Check minimum age (e.g., 13 years old)
                    const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
                    if (age < 13) {
                        if (dateOfBirthError) dateOfBirthError.textContent = 'You must be at least 13 years old to register';
                        hasErrors = true;
                    }
                }
            }
            
            if (hasErrors) return;
            
            // Registration via database API
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password: password,
                dateOfBirth: dateOfBirth,
                gender: document.querySelector('input[name="gender"]:checked')?.value || ''
            };
            
            register(userData).then(result => {
                if (result.success) {
                    showNotification('Registration successful! Welcome to SOLARA!', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    if (generalError) { 
                        generalError.textContent = result.message || 'Registration failed. Please try again.'; 
                        generalError.style.display = 'block'; 
                    }
                }
            });
        });
    }
}

// ===== FAQ ACCORDION =====

function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

// ===== GLOBAL PLACEHOLDERS =====

function setupGlobalPlaceholders() {
    // Fallback for any images that error
    document.addEventListener('error', (e) => {
        const target = e.target;
        if (target && target.tagName === 'IMG') {
            target.style.display = 'none';
            const placeholder = target.nextElementSibling;
            if (placeholder && placeholder.classList && placeholder.classList.contains('image-placeholder')) {
                placeholder.style.display = 'flex';
            } else {
                // Create a lightweight placeholder if one isn't present
                const ph = document.createElement('div');
                ph.className = 'image-placeholder';
                ph.style.display = 'flex';
                ph.style.width = target.width ? `${target.width}px` : '100%';
                ph.style.height = target.height ? `${target.height}px` : '200px';
                ph.style.alignItems = 'center';
                ph.style.justifyContent = 'center';
                ph.style.background = '#f5f5f5';
                ph.style.color = '#999';
                ph.innerHTML = '<i class="fas fa-image"></i>';
                target.parentNode && target.parentNode.insertBefore(ph, target.nextSibling);
            }
        }
    }, true);
}

// Guard for buttons/links that point to '#'
function setupDisabledButtonsGuard() {
    document.addEventListener('click', (e) => {
        const el = e.target.closest('a, button');
        if (!el) return;
        
        // Skip if element already has event listener or is being handled
        if (el.hasAttribute('data-handled')) return;
        
        const isAnchor = el.tagName === 'A';
        const href = isAnchor ? el.getAttribute('href') : null;
        
        // Check for dead links or disabled buttons
        if ((isAnchor && (href === '#' || href === '' || href === null)) || el.disabled) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get button/link text for better message
            const text = el.textContent.trim();
            const message = text ? `"${text}" feature coming soon!` : 'This feature is coming soon.';
            
            showNotification(message, 'info');
        }
    }, true); // Use capture phase to catch early
}

// ===== NOTIFICATIONS =====

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== QUICK VIEW MODAL =====

function showQuickView(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content quick-view-content">
            <div class="modal-header">
                <h3>${product.name}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="quick-view-grid">
                    <div class="quick-view-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display:none; width:100%; height:200px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#999;">
                    <i class="fas fa-image"></i>
                </div>
                    </div>
                    <div class="quick-view-details">
                        <p class="category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)} Collection</p>
                        <h2>${product.name}</h2>
                        <p class="price">${formatPrice(product.price)}</p>
                        <p class="description">${product.description}</p>
                        <div class="product-options">
                            <div class="size-options">
                                <label>Size:</label>
                                <select class="size-select">
                                    ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                                </select>
                            </div>
                            <div class="color-options">
                                <label>Color:</label>
                                <select class="color-select">
                                    ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="quick-view-actions">
                            <button class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i>
                                Add to Cart
                            </button>
                            <button class="btn btn-outline wishlist-btn" data-product-id="${product.id}">
                                <i class="fas fa-heart"></i>
                                Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
    
    // Setup modal events
    setupQuickViewEvents(modal, product);
}

function setupQuickViewEvents(modal, product) {
    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        hideModal(modal);
    });
    
    // Overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
    
    // Add to cart button
    const addToCartBtn = modal.querySelector('.btn-add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        addToCart(product.id);
        hideModal(modal);
        showNotification('Product added to cart!', 'success');
    });
    
    // Wishlist button
    const wishlistBtn = modal.querySelector('.wishlist-btn');
    wishlistBtn.addEventListener('click', () => {
        toggleWishlist(product.id);
        hideModal(modal);
    });
}

// hideModal is now defined globally as window.hideModal above

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Logout functionality - use event delegation to catch dynamically added elements
    document.addEventListener('click', (e) => {
        if (e.target.closest('#logout-link')) {
            e.preventDefault();
            e.stopPropagation();
            logout();
        } else if (e.target.closest('#admin-logout')) {
            e.preventDefault();
            e.stopPropagation();
            // Use admin logout if available, otherwise use regular logout
            if (typeof handleAdminLogout === 'function') {
                handleAdminLogout(e);
            } else {
                logout();
            }
        }
    });
    
    // Also add direct event listeners for logout buttons
    const logoutLinks = document.querySelectorAll('#logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    });
    
    const adminLogoutLinks = document.querySelectorAll('#admin-logout');
    adminLogoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof handleAdminLogout === 'function') {
                handleAdminLogout(e);
            } else {
                logout();
            }
        });
    });
    
    // Profile link
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                window.location.href = 'pages/profile.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }
    
    // Cart link - make sure it works properly
    const cartLinks = document.querySelectorAll('#cart-link, [href*="cart.html"]');
    cartLinks.forEach(link => {
        // Remove the preventDefault if it's a proper link
        const href = link.getAttribute('href');
        if (!href || href === '#') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const basePath = window.location.pathname.includes('/pages/') ? '' : 'pages/';
                window.location.href = basePath + 'cart.html';
            });
        }
    });
    
    // Wishlist link
    const wishlistLink = document.getElementById('wishlist-link');
    if (wishlistLink) {
        wishlistLink.addEventListener('click', (e) => {
            e.preventDefault();
            showWishlistModal();
        });
    }
    
    // Quick view buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.quick-view-btn')) {
            e.preventDefault();
            const productId = e.target.closest('.quick-view-btn').dataset.productId;
            if (productId) {
                showQuickView(productId);
            }
        }
    });
    
    // Wishlist buttons on product cards
    document.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn') && !e.target.closest('.wishlist-modal')) {
            e.preventDefault();
            const productId = e.target.closest('.wishlist-btn').dataset.productId;
            if (productId) {
                toggleWishlist(parseInt(productId));
            }
        }
    });
}

// ===== WISHLIST MODAL =====

// Make it global so onclick can access it
window.showWishlistModal = function() {
    console.log('showWishlistModal called');
    const wishlist = getWishlist();
    const products = getProducts();
    const wishlistProducts = products.filter(product => wishlist.includes(product.id));
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay wishlist-modal';
    modal.innerHTML = `
        <div class="modal-content wishlist-content">
            <div class="modal-header">
                <h3>My Wishlist</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${wishlistProducts.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>Your wishlist is empty</h3>
                        <p>Add some products to your wishlist</p>
                    </div>
                ` : `
                    <div class="wishlist-items">
                        ${wishlistProducts.map(product => `
                            <div class="wishlist-item">
                                <img src="${getAssetPath(product.image)}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display:none; width:100%; height:200px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#999;">
                    <i class="fas fa-image"></i>
                </div>
                                <div class="item-details">
                                    <h4>${product.name}</h4>
                                    <p class="price">${formatPrice(product.price)}</p>
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id}); hideModal(this.closest('.modal-overlay'));">
                                        <i class="fas fa-shopping-cart"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" onclick="removeFromWishlist(${product.id}); this.closest('.wishlist-item').remove();">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
    
    // Setup modal events
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        hideModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
};

// Also make hideModal global
window.hideModal = function(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.remove();
    }, 300);
};

// ===== UTILITY FUNCTIONS =====

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

// ===== CATEGORY-SPECIFIC FUNCTIONS =====

function loadCategoryProducts(category) {
    const products = getProductsByCategory(category);
    const productsGrid = document.getElementById('products-grid');
    const productCount = document.getElementById('product-count');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>We're working on adding more ${category} products. Check back soon!</p>
            </div>
        `;
        if (productCount) productCount.textContent = '0';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    if (productCount) productCount.textContent = products.length;
    
    setupProductCardEvents();
}

function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products based on category
            const category = button.dataset.category;
            filterProductsByCategory(category);
        });
    });
}

function filterProductsByCategory(category) {
    const products = getProducts();
    let filteredProducts = products;
    
    // Get current page category from URL
    const currentPageCategory = getCurrentPageCategory();
    
    // Filter by page category first
    if (currentPageCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === currentPageCategory);
    }
    
    // Then filter by selected category
    if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
            // Map category buttons to product properties
            switch (category) {
                case 'shirts':
                    return product.name.toLowerCase().includes('shirt') || product.name.toLowerCase().includes('top');
                case 'pants':
                    return product.name.toLowerCase().includes('pant') || product.name.toLowerCase().includes('jean');
                case 'shoes':
                    return product.name.toLowerCase().includes('shoe') || product.name.toLowerCase().includes('sneaker');
                case 'dresses':
                    return product.name.toLowerCase().includes('dress');
                case 'bottoms':
                    return product.name.toLowerCase().includes('skirt') || product.name.toLowerCase().includes('pant');
                case 'tops':
                    return product.name.toLowerCase().includes('blouse') || product.name.toLowerCase().includes('top');
                case 'accessories':
                    return product.name.toLowerCase().includes('bag') || product.name.toLowerCase().includes('accessory');
                default:
                    return true;
            }
        });
    }
    
    displayFilteredProducts(filteredProducts);
}

function getCurrentPageCategory() {
    const path = window.location.pathname;
    if (path.includes('men.html')) return 'men';
    if (path.includes('women.html')) return 'women';
    if (path.includes('kids.html')) return 'kids';
    return null;
}

function displayFilteredProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    const productCount = document.getElementById('product-count');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters to see more products</p>
            </div>
        `;
        if (productCount) productCount.textContent = '0';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    if (productCount) productCount.textContent = products.length;
    
    setupProductCardEvents();
}

function setupSorting() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            sortProductsDisplay(sortBy);
        });
    }
}

function sortProductsDisplay(sortBy) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const productCards = Array.from(productsGrid.children);
    const products = productCards.map(card => {
        const productId = parseInt(card.dataset.productId);
        return findProductById(productId);
    }).filter(Boolean);
    
    const sortedProducts = sortProducts(products, sortBy);
    
    productsGrid.innerHTML = sortedProducts.map(product => createProductCard(product)).join('');
    setupProductCardEvents();
}

function setupPriceFilter() {
    const priceRange = document.getElementById('price-range');
    const maxPriceDisplay = document.getElementById('max-price');
    
    if (priceRange && maxPriceDisplay) {
        priceRange.addEventListener('input', (e) => {
            const maxPrice = parseFloat(e.target.value);
            maxPriceDisplay.textContent = `${maxPrice} EGP`;
            filterByPrice(maxPrice);
        });
    }
}

function filterByPrice(maxPrice) {
    const products = getProducts();
    const currentPageCategory = getCurrentPageCategory();
    
    let filteredProducts = products;
    
    // Filter by page category first
    if (currentPageCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === currentPageCategory);
    }
    
    // Filter by price
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    
    displayFilteredProducts(filteredProducts);
}

function setupSizeFilter() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active state
            button.classList.toggle('active');
            
            // Get all active sizes
            const activeSizes = Array.from(document.querySelectorAll('.size-btn.active'))
                .map(btn => btn.dataset.size);
            
            filterBySize(activeSizes);
        });
    });
}

function filterBySize(sizes) {
    if (sizes.length === 0) {
        // If no sizes selected, show all products
        const currentPageCategory = getCurrentPageCategory();
        if (currentPageCategory) {
            loadCategoryProducts(currentPageCategory);
        }
        return;
    }
    
    const products = getProducts();
    const currentPageCategory = getCurrentPageCategory();
    
    let filteredProducts = products;
    
    // Filter by page category first
    if (currentPageCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === currentPageCategory);
    }
    
    // Filter by size (check if product has any of the selected sizes)
    filteredProducts = filteredProducts.filter(product => {
        if (!product.sizes) return false;
        return product.sizes.some(size => sizes.includes(size));
    });
    
    displayFilteredProducts(filteredProducts);
}

function setupAgeFilter() {
    const ageButtons = document.querySelectorAll('.age-btn');
    
    ageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            ageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const ageGroup = button.dataset.age;
            filterByAge(ageGroup);
        });
    });
}

function filterByAge(ageGroup) {
    const products = getProducts();
    let filteredProducts = products.filter(product => product.category === 'kids');
    
    if (ageGroup && ageGroup !== 'all') {
        // Filter by age group based on product name or description
        filteredProducts = filteredProducts.filter(product => {
            const name = product.name.toLowerCase();
            const description = (product.description || '').toLowerCase();
            
            switch (ageGroup) {
                case 'toddler':
                    return name.includes('toddler') || name.includes('baby') || 
                           description.includes('toddler') || description.includes('baby');
                case 'kids':
                    return name.includes('kids') || name.includes('child') || 
                           description.includes('kids') || description.includes('child');
                case 'teen':
                    return name.includes('teen') || name.includes('youth') || 
                           description.includes('teen') || description.includes('youth');
                default:
                    return true;
            }
        });
    }
    
    displayFilteredProducts(filteredProducts);
}

// ===== PAGE-SPECIFIC INITIALIZATION =====

// Category pages initialization
if (window.location.pathname.includes('men.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCategoryProducts('men');
        setupCategoryFilters();
        setupSorting();
        setupPriceFilter();
    });
}

if (window.location.pathname.includes('women.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCategoryProducts('women');
        setupCategoryFilters();
        setupSorting();
        setupPriceFilter();
        setupSizeFilter();
    });
}

if (window.location.pathname.includes('kids.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCategoryProducts('kids');
        setupCategoryFilters();
        setupSorting();
        setupPriceFilter();
        setupAgeFilter();
    });
}

// Cart page initialization
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Add some sample cart items for testing if cart is empty
        const existingCart = getCart();
        if (existingCart.length === 0) {
            const sampleCart = [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 }
            ];
            localStorage.setItem('fashionStoreCart', JSON.stringify(sampleCart));
        }
        
        loadCartItems();
    });
}

// Profile page initialization - run on ALL pages if profile container exists
document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        loadUserProfile();
        setupProfileNavigation();
        setupProfileButtons();
    }
});

// Orders page initialization
if (window.location.pathname.includes('orders.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadUserOrders();
        setupOrderFilters();
    });
}

// Checkout page initialization
if (window.location.pathname.includes('checkout.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCheckoutItems();
        setupCheckoutSteps();
    });
}

// Contact page initialization
if (window.location.pathname.includes('contact.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupContactForm();
    });
}

// Login page initialization
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupLoginForm();
    });
}

// Register page initialization
if (window.location.pathname.includes('register.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupRegisterForm();
    });
}

function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    // Simple registration with localStorage
    setupRealTimeValidation(form);
    const passwordField = form.querySelector('input[name="password"]');
    if (passwordField) {
        setupPasswordStrength(passwordField);
        setupPasswordRequirements(passwordField);
    }
}

// ===== PROFILE PAGE FUNCTIONALITY =====

function setupProfileNavigation() {
    // Profile sidebar navigation
    const navLinks = document.querySelectorAll('.profile-nav-link');
    const sections = document.querySelectorAll('.profile-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = link.getAttribute('data-section');
            
            // Skip if it's a regular link (not a section link)
            if (!sectionId) return;
            
            e.preventDefault();
            
            // Remove active class from all nav links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked nav link
            link.classList.add('active');
            
            // Show corresponding section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function loadUserProfile() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = '../login.html';
        return;
    }
    
    const user = JSON.parse(loggedInUser);
    
    // Fill in personal information
    const firstNameInput = document.getElementById('profile-firstName');
    const lastNameInput = document.getElementById('profile-lastName');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const dobInput = document.getElementById('profile-dob');
    const genderInput = document.getElementById('profile-gender');
    
    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (dobInput) dobInput.value = user.dateOfBirth || '';
    if (genderInput) genderInput.value = user.gender || '';
}

function setupProfileButtons() {
    // Avatar upload button
    const avatarUploadBtn = document.getElementById('avatar-upload');
    if (avatarUploadBtn) {
        avatarUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Avatar upload feature coming soon!', 'info');
        });
    }
    
    // Edit personal info button
    const editPersonalBtn = document.getElementById('edit-personal-btn');
    if (editPersonalBtn) {
        editPersonalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Edit profile feature coming soon!', 'info');
        });
    }
    
    // Add address button
    const addAddressBtn = document.getElementById('add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAddressPlaceholder();
        });
    }
    
    // Load addresses placeholder
    loadAddressesPlaceholder();
    
    // Preferences form
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Preferences saved successfully!', 'success');
        });
    }
}

function showAddressPlaceholder() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-map-marker-alt"></i> Add New Address</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="address-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group">
                        <label>Address Label</label>
                        <input type="text" placeholder="e.g., Home, Work" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Street Address</label>
                        <input type="text" placeholder="123 Main St" class="form-control" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>City</label>
                            <input type="text" placeholder="City" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>State</label>
                            <input type="text" placeholder="State" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Zip Code</label>
                            <input type="text" placeholder="12345" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Country</label>
                            <input type="text" placeholder="Country" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Address</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#address-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Address saved successfully!', 'success');
        modal.remove();
        loadAddressesPlaceholder();
    });
}

function loadAddressesPlaceholder() {
    const addressesList = document.getElementById('addresses-list');
    if (!addressesList) return;
    
    // Show empty state with nice design
    addressesList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem; background: var(--bg-light); border-radius: var(--radius-lg);">
            <i class="fas fa-map-marker-alt" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">No Addresses Yet</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Add your shipping addresses to make checkout faster</p>
            <button class="btn btn-primary" onclick="document.getElementById('add-address-btn').click()">
                <i class="fas fa-plus"></i> Add Your First Address
            </button>
        </div>
    `;
}

function handleRegisterSubmit(form) {
    const formData = new FormData(form);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender')
    };
    
    // Check if user already exists
    if (findUserByEmail(userData.email)) {
        showFormMessage(form, 'An account with this email already exists', 'error');
        return;
    }
    
    // Add user
    const newUser = addUser(userData);
    
    if (newUser) {
        showFormMessage(form, 'Account created successfully! You can now login.', 'success');
        form.reset();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        showFormMessage(form, 'Failed to create account. Please try again.', 'error');
    }
}

// ===== INNOVATIVE DESIGN FEATURES =====

// Setup floating action button
function setupFloatingButton() {
    const floatingBtn = document.getElementById('floating-cart-btn');
    if (!floatingBtn) return;
    
    // Add click event to go to cart
    floatingBtn.addEventListener('click', function() {
        window.location.href = getAssetPath('pages/cart.html');
    });
    
    // Show/hide based on scroll position
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            floatingBtn.style.transform = 'translateY(100px)';
            floatingBtn.style.opacity = '0';
        } else {
            // Scrolling up
            floatingBtn.style.transform = 'translateY(0)';
            floatingBtn.style.opacity = '1';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Setup scroll effects for enhanced UX
function setupScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = heroSection.querySelector('.hero-content');
            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }
        });
    }
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections for fade-in effect
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Enhanced product card interactions
function enhanceProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Add ripple effect on click
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add ripple effect CSS
function addRippleEffectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .product-card {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize enhanced interactions
document.addEventListener('DOMContentLoaded', function() {
    addRippleEffectCSS();
    setTimeout(enhanceProductCards, 1000); // Wait for products to load
});

