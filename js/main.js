// ===== MAIN APPLICATION LOGIC =====

// Global variables
let currentUser = null;
let currentCategory = 'all';
let currentSort = 'newest';

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
    setupEventListeners();
    await loadProducts();
    await loadBestSellers();
    await loadNewArrivals();
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

async function initializeApp() {
    // Initialize universal navigation
    initializeUniversalNavigation();
    
    // Initialize data from API (fetches from MongoDB)
    await initializeData();
    console.log('✅ App initialized with data from MongoDB');
    
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
    const isSubPage = currentPath.includes('/pages/');
    const isAdminPage = currentPath.includes('/admin/');
    
    // Calculate paths based on current location
    let homeLink, pagesPrefix, adminPrefix, loginLink;
    
    if (isSubPage) {
        // We're in /pages/ folder
        homeLink = '../index.html';
        pagesPrefix = ''; // Stay in pages folder
        adminPrefix = '../admin/';
        loginLink = '../login.html';
    } else if (isAdminPage) {
        // We're in /admin/ folder
        homeLink = '../index.html';
        pagesPrefix = '../pages/';
        adminPrefix = '';
        loginLink = '../login.html';
    } else {
        // We're at root
        homeLink = 'index.html';
        pagesPrefix = 'pages/';
        adminPrefix = 'admin/';
        loginLink = 'login.html';
    }
    
    return `
        <header class="main-header">
            <nav class="navbar">
                <div class="nav-brand">
                    <a href="${homeLink}">
                        <i class="fas fa-sun"></i>
                        SOLARA
                    </a>
                </div>
                
                <ul class="nav-menu">
                    <li><a href="${homeLink}" class="nav-link">Home</a></li>
                    <li><a href="${pagesPrefix}men.html" class="nav-link">Men</a></li>
                    <li><a href="${pagesPrefix}women.html" class="nav-link">Women</a></li>
                    <li><a href="${pagesPrefix}kids.html" class="nav-link">Kids</a></li>
                    <li><a href="${pagesPrefix}contact.html" class="nav-link">Contact</a></li>
                </ul>
                
                <div class="nav-actions">
                    <div class="search-box">
                        <input type="text" placeholder="Search products..." id="search-input">
                        <button type="button" id="search-btn"><i class="fas fa-search"></i></button>
                    </div>
                    
                    <div class="user-actions">
                        <a href="${pagesPrefix}cart.html" class="nav-icon" id="cart-link">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count" id="cart-count">0</span>
                        </a>
                        <a href="${pagesPrefix}wishlist.html" class="nav-icon" id="wishlist-link">
                            <i class="fas fa-heart"></i>
                            <span class="wishlist-count" id="wishlist-count">0</span>
                        </a>
                        <a href="${loginLink}" class="nav-icon" id="login-link">
                            <i class="fas fa-user"></i>
                            Login
                        </a>
                        <a href="${pagesPrefix}profile.html" class="nav-icon hidden" id="profile-link" title="My Profile">
                            <i class="fas fa-user-circle"></i>
                            <span class="nav-label">Profile</span>
                        </a>
                        <a href="${pagesPrefix}orders.html" class="nav-icon hidden" id="orders-link" title="My Orders">
                            <i class="fas fa-box"></i>
                        </a>
                        <button class="nav-icon logout-btn hidden" id="logout-btn" title="Logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span class="nav-label">Logout</span>
                        </button>
                        <a href="${adminPrefix}admin.html" class="nav-icon subtle" id="admin-link" title="Admin">
                            <i class="fas fa-cog"></i>
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
    
    // Get the current page name
    const pathParts = currentPath.split('/');
    const currentPage = pathParts[pathParts.length - 1] || 'index.html';
    
    // Set active state based on current page - use exact matching
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const hrefParts = href.split('/');
        const linkPage = hrefParts[hrefParts.length - 1];
        
        // Exact page match
        if (currentPage === linkPage) {
            link.classList.add('active');
        }
        // Handle root/index
        else if ((currentPage === '' || currentPage === 'index.html') && 
                 (linkPage === 'index.html' || href === '../index.html')) {
            link.classList.add('active');
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
    const ordersLink = document.getElementById('orders-link');
    const logoutBtn = document.getElementById('logout-btn');
    
    const isLoggedIn = currentUser || (typeof AuthAPI !== 'undefined' && AuthAPI.isLoggedIn());
    
    if (isLoggedIn) {
        // User is logged in - show profile, orders, logout; hide login
        if (loginLink) loginLink.classList.add('hidden');
        if (profileLink) profileLink.classList.remove('hidden');
        if (ordersLink) ordersLink.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        // User is logged out - show login; hide profile, orders, logout
        if (loginLink) loginLink.classList.remove('hidden');
        if (profileLink) profileLink.classList.add('hidden');
        if (ordersLink) ordersLink.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
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
    console.log('🚪 Logout initiated');
    
    // Use API logout if available
    try {
        if (typeof AuthAPI !== 'undefined') {
            await AuthAPI.logout();
        }
    } catch (e) {
        console.log('API logout error (ignored):', e);
    }
    
    // Clear all auth data
    currentUser = null;
    
    // Clear all possible storage keys
    const keysToRemove = [
        'loggedInUser', 'currentUser', 'authToken', 
        'solaraAdminAuthed', 'isAdmin', 'guestCart',
        'fashionStoreUser', 'adminUser'
    ];
    keysToRemove.forEach(key => {
        try { localStorage.removeItem(key); } catch(e) {}
    });
    
    // Clear session cookies
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Determine correct redirect path
    const path = window.location.pathname;
    let redirectUrl = '/index.html';
    
    if (path.includes('/admin/')) {
        redirectUrl = '../index.html';
    } else if (path.includes('/pages/')) {
        redirectUrl = '../index.html';
    } else {
        redirectUrl = 'index.html';
    }
    
    console.log('🔄 Redirecting to:', redirectUrl);
    
    // Force redirect
    window.location.replace(redirectUrl);
}

// Make logout globally accessible immediately
window.logout = logout;
window.handleLogout = logout;
window.doLogout = logout;

// Also set up as soon as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLogoutHandlers);
} else {
    setupLogoutHandlers();
}

function setupLogoutHandlers() {
    // Use event delegation for all logout clicks
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('#logout-link, #logout-btn, .logout-btn, [data-logout]');
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Logout button clicked');
            logout();
            return false;
        }
    }, true);
    
    // Also attach directly to logout button for extra reliability
    setTimeout(() => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                console.log('🔘 Direct logout click');
                logout();
                return false;
            };
        }
    }, 100);
}


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

async function loadBestSellers() {
    const bestSellersGrid = document.getElementById('best-sellers-grid');
    if (!bestSellersGrid) return;
    
    try {
        // Use API to get featured products
        if (typeof ProductsAPI !== 'undefined') {
            const response = await ProductsAPI.getFeatured(3);
            if (response.success && response.data.length > 0) {
                bestSellersGrid.innerHTML = response.data.map(product => createProductCard(product)).join('');
                setupProductCardEvents();
                return;
            }
        }
        
        // Fallback to localStorage
        const products = getFeaturedProducts().slice(0, 3);
        bestSellersGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        setupProductCardEvents();
    } catch (error) {
        console.error('Error loading best sellers:', error);
        const products = getFeaturedProducts().slice(0, 3);
        bestSellersGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        setupProductCardEvents();
    }
}

async function loadNewArrivals() {
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (!newArrivalsGrid) return;
    
    try {
        // Use API to get new arrivals
        if (typeof ProductsAPI !== 'undefined') {
            const response = await ProductsAPI.getNewArrivals(3);
            if (response.success && response.data.length > 0) {
                newArrivalsGrid.innerHTML = response.data.map(product => createProductCard(product)).join('');
                setupProductCardEvents();
                return;
            }
        }
        
        // Fallback to localStorage
        const products = getProducts().slice(0, 3);
        newArrivalsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        setupProductCardEvents();
    } catch (error) {
        console.error('Error loading new arrivals:', error);
        const products = getProducts().slice(0, 3);
        newArrivalsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        setupProductCardEvents();
    }
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
    
    // Product card click - go to product detail page
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons
            if (e.target.closest('button') || e.target.closest('.btn')) return;
            
            const productId = card.dataset.productId;
            if (productId) {
                // Navigate to product detail page
                const basePath = window.location.pathname.includes('/pages/') ? '' : 'pages/';
                window.location.href = `${basePath}product.html?id=${productId}`;
            }
        });
        
        // Hover effects
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
window.addToCart = async function(productId, quantity = 1) {
    // Visual feedback - show loading
    const button = document.querySelector(`[data-product-id="${productId}"].btn-add-to-cart`);
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }
    
    try {
        // Use API if user is logged in
        if (typeof CartAPI !== 'undefined' && AuthAPI && AuthAPI.isLoggedIn()) {
            const response = await CartAPI.add(productId, parseInt(quantity));
            if (response.success) {
                updateCartCount();
                showAddedFeedback(button);
                showNotification('Product added to cart!', 'success');
                return;
            }
        }
        
        // Fallback to localStorage for guests
        const product = findProductById(productId);
        if (!product) {
            showNotification('Product not found', 'error');
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            }
            return;
        }
        
        const cart = getCart();
        const existingItem = cart.find(item => 
            item.productId === productId || 
            item.productId === parseInt(productId) ||
            String(item.productId) === String(productId)
        );
        
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.push({
                productId: productId,
                quantity: parseInt(quantity)
            });
        }
        
        saveCart(cart);
        updateCartCount();
        showAddedFeedback(button);
        showNotification('Product added to cart!', 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification(error.message || 'Failed to add to cart', 'error');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }
    }
};

function showAddedFeedback(button) {
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            button.classList.remove('success');
        }, 2000);
    }
}

async function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    let count = 0;
    
    try {
        // Use API if user is logged in
        if (typeof CartAPI !== 'undefined' && AuthAPI && AuthAPI.isLoggedIn()) {
            const response = await CartAPI.get();
            if (response.success) {
                count = response.data.itemCount || 0;
            }
        } else {
            // Use localStorage for guests
            const cart = getCart();
            count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        }
    } catch (error) {
        // Fallback to localStorage
        const cart = getCart();
        count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    }
    
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

async function loadCartItems() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    // Show loading
    cartItems.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading cart...</div>';
    
    try {
        let items = [];
        let cartData = null;
        
        // Use API if user is logged in
        if (typeof CartAPI !== 'undefined' && AuthAPI && AuthAPI.isLoggedIn()) {
            const response = await CartAPI.get();
            if (response.success && response.data.items) {
                cartData = response.data;
                // Transform API response to our expected format
                items = response.data.items.map(item => ({
                    productId: item.product._id || item.product,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    product: item.product // Include full product data from API
                }));
            }
        } else {
            // Use localStorage for guests
            const cart = getCart();
            items = cart;
        }
        
        if (items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <a href="${getAssetPath('index.html')}" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            updateCartSummary(0, 0, 0);
            return;
        }
        
        const products = getProducts();
        
        cartItems.innerHTML = items.map(item => {
            // Use product data from API if available, otherwise lookup
            const product = item.product || products.find(p => 
                p.id === item.productId || 
                p._id === item.productId ||
                String(p.id) === String(item.productId) ||
                String(p._id) === String(item.productId)
            );
            if (!product) return '';
            
            return createCartItemHTML(item, product);
        }).filter(html => html).join('');
        
        setupCartItemEvents();
        
        // Update totals from API data or calculate
        if (cartData) {
            updateCartSummary(cartData.subtotal, cartData.discount || 0, cartData.total);
        } else {
            updateCartTotal();
        }
        
    } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage
        const cart = getCart();
        const products = getProducts();
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <a href="${getAssetPath('index.html')}" class="btn btn-primary">Continue Shopping</a>
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
}

function updateCartSummary(subtotal, discount, total) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (discountEl) {
        discountEl.textContent = discount > 0 ? `-${formatPrice(discount)}` : '$0.00';
    }
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function createCartItemHTML(item, product) {
    // Handle both MongoDB _id and localStorage id formats
    const pid = item.productId || product._id || product.id;
    const imagePath = getAssetPath(product.image || product.primaryImage || 'images/placeholder.jpg');
    const category = product.category || 'fashion';
    const size = item.size || 'M';
    const color = item.color || 'Default';
    
    return `
        <div class="cart-item" data-product-id="${pid}">
            <div class="item-image">
                <img src="${imagePath}" alt="${product.name}" onerror="this.src='${getAssetPath('images/placeholder.jpg')}';">
            </div>
            <div class="item-details">
                <h3>${product.name}</h3>
                <p class="item-category">${category.charAt(0).toUpperCase() + category.slice(1)} Collection</p>
                <div class="item-options">
                    <span class="size">Size: ${size}</span>
                    <span class="color">Color: ${color}</span>
                </div>
                <p class="item-price">${formatPrice(product.price)}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn" data-action="decrease" data-product-id="${pid}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-product-id="${pid}">
                <button class="quantity-btn" data-action="increase" data-product-id="${pid}">+</button>
            </div>
            <div class="item-total">
                <p class="total-price">${formatPrice(product.price * item.quantity)}</p>
            </div>
            <div class="item-actions">
                <button class="remove-btn" data-product-id="${pid}" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="wishlist-btn" data-product-id="${pid}" title="Move to wishlist">
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
    if (!product) {
        console.error('Product not found:', productId);
        showNotification('Product not found', 'error');
        return;
    }
    
    // Handle both MongoDB _id and localStorage id
    const pid = product._id || product.id;
    const imagePath = getAssetPath(product.image || product.primaryImage || 'images/placeholder.jpg');
    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
    const colors = product.colors || ['Black', 'White'];
    const description = product.description || 'No description available';
    const category = product.category || 'fashion';
    
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
                        <img src="${imagePath}" alt="${product.name}" onerror="this.src='${getAssetPath('images/placeholder.jpg')}';">
                    </div>
                    <div class="quick-view-details">
                        <p class="category">${category.charAt(0).toUpperCase() + category.slice(1)} Collection</p>
                        <h2>${product.name}</h2>
                        <p class="price">${formatPrice(product.price)}</p>
                        <p class="description">${description}</p>
                        <div class="product-options">
                            <div class="size-options">
                                <label>Size:</label>
                                <select class="size-select">
                                    ${sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                                </select>
                            </div>
                            <div class="color-options">
                                <label>Color:</label>
                                <select class="color-select">
                                    ${colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="product-info">
                            <p><strong>Brand:</strong> ${product.brand || 'SOLARA'}</p>
                            <p><strong>Material:</strong> ${product.material || 'Premium Quality'}</p>
                            <p><strong>In Stock:</strong> ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
                        </div>
                        <div class="quick-view-actions">
                            <button class="btn btn-primary btn-add-to-cart" data-product-id="${pid}" ${product.stock <= 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i>
                                ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button class="btn btn-outline wishlist-btn" data-product-id="${pid}">
                                <i class="fas fa-heart"></i>
                                Wishlist
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
    const pid = product._id || product.id;
    
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
    if (addToCartBtn && !addToCartBtn.disabled) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(pid);
            hideModal(modal);
        });
    }
    
    // Wishlist button
    const wishlistBtn = modal.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            toggleWishlist(pid);
            hideModal(modal);
        });
    }
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
    
    // Profile link - handle paths correctly
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            const isSubPage = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/');
            if (currentUser || (typeof AuthAPI !== 'undefined' && AuthAPI.isLoggedIn())) {
                if (isSubPage) {
                    window.location.href = 'profile.html';
                } else {
                    window.location.href = 'pages/profile.html';
                }
            } else {
                if (isSubPage) {
                    window.location.href = '../login.html';
                } else {
                    window.location.href = 'login.html';
                }
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

async function loadCategoryProducts(category) {
    const productsGrid = document.getElementById('products-grid');
    const productCount = document.getElementById('product-count');
    
    if (!productsGrid) return;
    
    // Show loading state
    productsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>';
    
    try {
        // Make sure data is loaded from API first
        await initializeData();
        
        // Try API first
        let products = [];
        if (typeof ProductsAPI !== 'undefined') {
            const response = await ProductsAPI.getByCategory(category);
            if (response.success && response.data) {
                products = response.data;
            }
        }
        
        // Fallback to localStorage
        if (products.length === 0) {
            products = getProductsByCategory(category);
        }
        
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
    } catch (error) {
        console.error('Error loading category products:', error);
        productsGrid.innerHTML = '<div class="error-state"><p>Error loading products. Please try again.</p></div>';
    }
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
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize data first
        await initializeData();
        
        // Load cart items from API or localStorage
        await loadCartItems();
        
        // Setup checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = getCart();
                if (cart.length === 0) {
                    showNotification('Your cart is empty', 'error');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }
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
// NOTE: checkout.html has its own complete implementation, so we skip main.js handlers
// if (window.location.pathname.includes('checkout.html')) {
//     document.addEventListener('DOMContentLoaded', () => {
//         loadCheckoutItems();
//         setupCheckoutSteps();
//         setupCheckoutForm();
//     });
// }

async function loadCheckoutItems() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutSummary = document.getElementById('checkout-summary');
    
    if (!checkoutItems) return;
    
    try {
        let items = [];
        let cartData = null;
        
        // Use API if logged in
        if (typeof CartAPI !== 'undefined' && AuthAPI && AuthAPI.isLoggedIn()) {
            const response = await CartAPI.get();
            if (response.success && response.data.items) {
                cartData = response.data;
                items = response.data.items.map(item => ({
                    productId: item.product._id || item.product,
                    quantity: item.quantity,
                    product: item.product
                }));
            }
        } else {
            const cart = getCart();
            items = cart;
        }
        
        if (items.length === 0) {
            checkoutItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products before checkout</p>
                    <a href="${getAssetPath('index.html')}" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }
        
        const products = getProducts();
        let subtotal = 0;
        
        checkoutItems.innerHTML = items.map(item => {
            const product = item.product || products.find(p => 
                p.id === item.productId || p._id === item.productId ||
                String(p.id) === String(item.productId) || String(p._id) === String(item.productId)
            );
            if (!product) return '';
            
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            return `
                <div class="checkout-item">
                    <img src="${getAssetPath(product.image)}" alt="${product.name}">
                    <div class="item-info">
                        <h4>${product.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <span class="item-price">${formatPrice(itemTotal)}</span>
                </div>
            `;
        }).join('');
        
        // Update summary
        const shipping = subtotal > 100 ? 0 : 10;
        const total = cartData ? cartData.total : (subtotal + shipping);
        
        if (checkoutSummary) {
            checkoutSummary.innerHTML = `
                <div class="summary-row"><span>Subtotal:</span><span>${formatPrice(cartData ? cartData.subtotal : subtotal)}</span></div>
                <div class="summary-row"><span>Shipping:</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                ${cartData && cartData.discount > 0 ? `<div class="summary-row discount"><span>Discount:</span><span>-${formatPrice(cartData.discount)}</span></div>` : ''}
                <div class="summary-row total"><span>Total:</span><span>${formatPrice(total)}</span></div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading checkout items:', error);
    }
}

function setupCheckoutSteps() {
    const steps = document.querySelectorAll('.checkout-step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextButtons = document.querySelectorAll('.btn-next-step');
    const prevButtons = document.querySelectorAll('.btn-prev-step');
    
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = document.querySelector('.checkout-step.active');
            const nextStep = currentStep?.nextElementSibling;
            if (nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                updateStepContent();
            }
        });
    });
    
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = document.querySelector('.checkout-step.active');
            const prevStep = currentStep?.previousElementSibling;
            if (prevStep) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                updateStepContent();
            }
        });
    });
}

function updateStepContent() {
    const activeStep = document.querySelector('.checkout-step.active');
    const stepContents = document.querySelectorAll('.step-content');
    
    stepContents.forEach(content => {
        content.style.display = 'none';
    });
    
    if (activeStep) {
        const stepNum = activeStep.dataset.step;
        const activeContent = document.querySelector(`.step-content[data-step="${stepNum}"]`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }
}

function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handlePlaceOrder);
    }
}

async function handlePlaceOrder(e) {
    if (e) e.preventDefault();
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    try {
        // Get form data
        const shippingAddress = {
            firstName: document.getElementById('shipping-first-name')?.value || '',
            lastName: document.getElementById('shipping-last-name')?.value || '',
            address: document.getElementById('shipping-address')?.value || '',
            city: document.getElementById('shipping-city')?.value || '',
            state: document.getElementById('shipping-state')?.value || '',
            zipCode: document.getElementById('shipping-zip')?.value || '',
            country: document.getElementById('shipping-country')?.value || 'USA',
            phone: document.getElementById('shipping-phone')?.value || ''
        };
        
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';
        
        // Get cart items
        let items = [];
        let total = 0;
        
        if (typeof CartAPI !== 'undefined' && AuthAPI && AuthAPI.isLoggedIn()) {
            const cartResponse = await CartAPI.get();
            if (cartResponse.success) {
                items = cartResponse.data.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.price
                }));
                total = cartResponse.data.total;
            }
        } else {
            const cart = getCart();
            const products = getProducts();
            items = cart.map(item => {
                const product = products.find(p => p.id === item.productId || p._id === item.productId);
                return {
                    product: item.productId,
                    quantity: item.quantity,
                    price: product ? product.price : 0
                };
            });
            total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        
        if (items.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }
        
        const orderData = {
            items,
            shippingAddress,
            paymentMethod,
            subtotal: total,
            total
        };
        
        // Create order
        const order = await createOrder(orderData);
        
        if (order) {
            // Clear cart
            saveCart([]);
            updateCartCount();
            
            showNotification('Order placed successfully!', 'success');
            
            // Redirect to order confirmation
            setTimeout(() => {
                window.location.href = getAssetPath('pages/orders.html');
            }, 1500);
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification(error.message || 'Failed to place order', 'error');
    } finally {
        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Place Order';
        }
    }
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

async function loadUserProfile() {
    let user = null;
    
    // Try to get user from API first
    if (typeof AuthAPI !== 'undefined' && AuthAPI.isLoggedIn()) {
        user = AuthAPI.getCurrentUser();
        
        // Try to fetch fresh data from API
        try {
            const response = await AuthAPI.getMe();
            if (response.success) {
                user = response.data;
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }
    
    // Fallback to localStorage
    if (!user) {
        const loggedInUser = localStorage.getItem('loggedInUser') || localStorage.getItem('currentUser');
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
        }
    }
    
    if (!user) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
        window.location.href = basePath + 'login.html';
        return;
    }
    
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
    
    // Update avatar and name display
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    if (profileName) profileName.textContent = `${user.firstName} ${user.lastName}`;
    if (profileEmail) profileEmail.textContent = user.email;
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

