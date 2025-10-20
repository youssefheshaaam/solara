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
                        <a href="#" class="nav-icon" id="wishlist-link">
                            <i class="fas fa-heart"></i>
                            <span class="wishlist-count" id="wishlist-count">0</span>
                        </a>
                        <a href="${basePath}login.html" class="nav-icon" id="login-link">
                            <i class="fas fa-user"></i>
                            Login
                        </a>
                        <a href="#" class="nav-icon hidden" id="profile-link">
                            <i class="fas fa-user-circle"></i>
                            Profile
                        </a>
                        <a href="#" class="nav-icon hidden" id="logout-link">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                        <a href="${basePath}admin/admin.html" class="nav-icon" id="admin-link">
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
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (profileLink) {
            profileLink.style.display = 'flex';
            profileLink.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.firstName}`;
        }
        if (logoutLink) logoutLink.style.display = 'flex';
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.firstName}`;
            welcomeMessage.style.display = 'block';
        }
    } else {
        if (loginLink) loginLink.style.display = 'flex';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';
    }
}

async function login(email, password) {
    if (!window.solaraDB) return { success: false, message: 'Local DB unavailable' };
    const user = await window.solaraDB.verifyUser(email, password);
    if (user) {
        currentUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        updateAuthUI();
        return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
}

async function register(userData) {
    if (!window.solaraDB) return { success: false, message: 'Local DB unavailable' };
    try {
        const user = await window.solaraDB.addUser(userData);
        currentUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        updateAuthUI();
        return { success: true, user };
    } catch (e) {
        return { success: false, message: e && e.message ? e.message : 'Registration failed' };
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('loggedInUser');
    updateAuthUI();
    
    // Redirect to home page
    if (window.location.pathname.includes('admin')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// ===== PRODUCT DISPLAY =====

function loadProducts(category = 'all', sortBy = 'newest') {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    let products = getProductsByCategory(category);
    products = sortProducts(products, sortBy);
    
    
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
}

function loadBestSellers() {
    const bestSellersGrid = document.getElementById('best-sellers-grid');
    if (!bestSellersGrid) return;
    
    // Get first 8 products as best sellers for now
    const allProducts = getProductsByCategory('all');
    const bestSellers = allProducts.slice(0, 8);
    
    if (bestSellers.length === 0) {
        bestSellersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <h3>No best sellers available</h3>
                <p>Check back soon for our top products</p>
            </div>
        `;
        return;
    }
    
    bestSellersGrid.innerHTML = bestSellers.map(product => createProductCard(product)).join('');
    
    // Add event listeners to best seller cards
    setupProductCardEvents();
}

function loadNewArrivals() {
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (!newArrivalsGrid) return;
    
    // Get last 6 products as new arrivals for now
    const allProducts = getProductsByCategory('all');
    const newArrivals = allProducts.slice(-6);
    
    if (newArrivals.length === 0) {
        newArrivalsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plus"></i>
                <h3>No new arrivals available</h3>
                <p>Check back soon for fresh styles</p>
            </div>
        `;
        return;
    }
    
    newArrivalsGrid.innerHTML = newArrivals.map(product => createProductCard(product)).join('');
    
    // Add event listeners to new arrival cards
    setupProductCardEvents();
}

function createProductCard(product) {
    const inWishlist = isInWishlist(product.id);
    const wishlistClass = inWishlist ? 'active' : '';
    
    // Add sale badge for some products (random for demo)
    const isOnSale = Math.random() > 0.7; // 30% chance of being on sale
    const saleBadge = isOnSale ? '<div class="sale-badge">SALE</div>' : '';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                ${saleBadge}
                <img src="${getAssetPath(product.image)}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display:none; width:100%; height:200px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#999;">
                    <i class="fas fa-image"></i>
                </div>
                <div class="product-overlay">
                    <button class="wishlist-btn ${wishlistClass}" data-product-id="${product.id}" title="Add to wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="quick-view-btn" data-product-id="${product.id}" title="Quick view">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-card-content">
                <p class="category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <h3>${product.name}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                <div class="product-actions">
                    <button class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}">
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

function addToCart(productId, quantity = 1) {
    addToCart(productId, quantity);
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
}

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
            if (generalError) generalError.textContent = '';
            
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
            
            // Attempt DB-backed login
            if (!window.solaraDB) {
                if (generalError) generalError.textContent = 'Local DB unavailable';
                return;
            }
            window.solaraDB.getUserByEmail(email).then(found => {
                if (!found) {
                    if (generalError) {
                        generalError.textContent = 'No account found with this email address';
                    } else {
                        emailError.textContent = 'No account found with this email address';
                    }
                    return;
                }
                login(email, password).then(result => {
                    if (result.success) {
                        showNotification('Login successful! Welcome back!', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    } else {
                        if (generalError) {
                            generalError.textContent = result.message || 'Incorrect password';
                        } else {
                            passwordError.textContent = 'Incorrect password';
                        }
                    }
                });
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
            
            // Get error elements
            const firstNameError = document.getElementById('firstName-error');
            const lastNameError = document.getElementById('lastName-error');
            const emailError = document.getElementById('email-error');
            const phoneError = document.getElementById('phone-error');
            const passwordError = document.getElementById('password-error');
            const confirmPasswordError = document.getElementById('confirmPassword-error');
            const generalError = document.getElementById('general-error');
            
            // Clear previous errors
            [firstNameError, lastNameError, emailError, phoneError, passwordError, confirmPasswordError].forEach(el => {
                if (el) el.textContent = '';
            });
            if (generalError) generalError.textContent = '';
            
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
            
            if (hasErrors) return;
            
            // Registration via local DB
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password: password
            };
            if (!window.solaraDB) {
                if (generalError) generalError.textContent = 'Local DB unavailable';
                return;
            }
            window.solaraDB.getUserByEmail(userData.email).then(existing => {
                if (existing) {
                    if (emailError) emailError.textContent = 'An account with this email already exists';
                    return;
                }
                register(userData).then(result => {
                    if (result.success) {
                        showNotification('Registration successful! Welcome to SOLARA!', 'success');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    } else {
                        if (generalError) generalError.textContent = result.message || 'Registration failed. Please try again.';
                    }
                });
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
        const isAnchor = el.tagName === 'A';
        const href = isAnchor ? el.getAttribute('href') : null;
        if ((isAnchor && (href === '#' || href === '' || href === null)) || el.disabled) {
            e.preventDefault();
            showNotification('This action is coming soon.', 'info');
        }
    });
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

function hideModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Logout functionality
    const logoutLinks = document.querySelectorAll('#logout-link, #admin-logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
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
    
    // Cart link
    const cartLinks = document.querySelectorAll('#cart-link, [href*="cart.html"]');
    cartLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'pages/cart.html';
        });
    });
    
    // Wishlist link
    const wishlistLink = document.getElementById('wishlist-link');
    if (wishlistLink) {
        wishlistLink.addEventListener('click', (e) => {
            e.preventDefault();
            showWishlistModal();
        });
    }
}

// ===== WISHLIST MODAL =====

function showWishlistModal() {
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
}

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
            sortProducts(sortBy);
        });
    }
}

function sortProducts(sortBy) {
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
            maxPriceDisplay.textContent = `$${maxPrice}`;
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
        loadCartItems();
    });
}

// Profile page initialization
if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadUserProfile();
        setupProfileNavigation();
    });
}

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
    
    // Setup real-time validation
    setupRealTimeValidation(form);
    
    // Setup form submission
    setupFormSubmission(form, validateRegisterForm, handleRegisterSubmit);
    
    // Setup password strength and requirements
    const passwordField = form.querySelector('input[name="password"]');
    if (passwordField) {
        setupPasswordStrength(passwordField);
        setupPasswordRequirements(passwordField);
    }
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
