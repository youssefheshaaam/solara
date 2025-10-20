// FAKE PRODUCT DATA
const products = [
    { id: 1, name: "Men's Cotton T-Shirt", price: 25.00, img: "man.jpg", category: 'featured' },
    { id: 2, name: "Elegant Summer Dress", price: 50.00, img: "dress.jpeg", category: 'featured' },
    { id: 3, name: "Kids Winter Jacket", price: 45.00, img: "jacket.jpeg", category: 'featured' },
    { id: 4, name: "Classic Oxford Shirt", price: 40.00, img: "classic.jpeg", category: 'men' },
    { id: 5, name: "Slim Fit Jeans", price: 60.00, img: "jeans.jpeg", category: 'men' },
    { id: 6, name: "Leather Derby Shoes", price: 80.00, img: "shoes.jpeg", category: 'men' },
    { id: 7, name: "Silk Ruffle Blouse", price: 55.00, img: "blouse.jpeg", category: 'women' },
    { id: 8, name: "A-Line Midi Skirt", price: 48.00, img: "skirt.jpeg", category: 'women' },
    { id: 9, name: "Crossbody Leather Bag", price: 75.00, img: "bag.jpeg", category: 'women' },
    { id: 10, name: "Graphic Print T-Shirt", price: 15.00, img: "1_1gif", category: 'kids' },
    { id: 11, name: "Comfortable Jogger Pants", price: 20.00, img: "pants.jpeg", category: 'kids' },
    { id: 12, name: "Light-Up Sneakers", price: 35.00, img: "sneakers.jpeg", category: 'kids' }
];

// Helper function to find a product by its ID
function findProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

// ---- PAGE & PRODUCT RENDERING ----
function createProductCard(product) {
    return `<div class="product-card">
                <img src="${product.img}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>`;
}
function renderProducts(category, targetElementId) {
    const container = document.getElementById(targetElementId);
    const grid = document.createElement('div');
    grid.className = 'products-grid';
    
    if (category === 'home') {
         container.innerHTML = `<section class="hero-section"><div class="hero-content"><h1>New Season Arrivals</h1><p>Discover your style</p></div></section><section class="product-section"><h2 class="section-title">Featured Products</h2><div id="featured-grid" class="products-grid"></div></section>`;
         const featuredGrid = document.getElementById('featured-grid');
         products.filter(p => p.category === 'featured').forEach(p => featuredGrid.innerHTML += createProductCard(p));
         return;
    }
    products.filter(p => p.category === category).forEach(p => grid.innerHTML += createProductCard(p));
    container.appendChild(grid);
}
renderProducts('home', 'home');
renderProducts('men', 'men');
renderProducts('women', 'women');
renderProducts('kids', 'kids');

// ---- PAGE NAVIGATION ----
const pageSections = document.querySelectorAll('.page-section');
function showSection(sectionId) {
    pageSections.forEach(section => section.classList.toggle('active', section.id === sectionId));
}

// ---- CART PAGE LOGIC ----
const cartContentWrapper = document.getElementById('cart-content-wrapper');

function renderCartItems() {
    let cart = JSON.parse(localStorage.getItem('fashionStoreCart')) || [];
    
    if (cart.length === 0) {
        cartContentWrapper.innerHTML = `
            <div class="empty-cart-message">
                <h3>Your cart is currently empty.</h3>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <button onclick="showSection('home')" class="btn-primary" style="margin-top: 1.5rem;">Continue Shopping</button>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    let itemsHTML = cart.map(item => {
        const product = findProductById(item.id);
        subtotal += product.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${product.img}" alt="${product.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p>$${product.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <input type="text" class="item-quantity" value="${item.quantity}" readonly>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <p class="price" style="width: 80px; text-align: right;">$${(product.price * item.quantity).toFixed(2)}</p>
                <button class="remove-item-btn" data-id="${item.id}">&times;</button>
            </div>
        `;
    }).join('');

    const summaryHTML = `
        <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-line">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Shipping</span>
                <span>FREE</span>
            </div>
            <div class="summary-line" id="cart-total">
                <span>Total</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <button class="btn-primary" style="width:100%; margin-top: 1rem;">Proceed to Checkout</button>
        </div>
    `;
    
    cartContentWrapper.innerHTML = `
        <div class="cart-page-container">
            <div class="cart-items">${itemsHTML}</div>
            ${summaryHTML}
        </div>
    `;
}

function showCartPage() {
    showSection('cart-page');
    renderCartItems();
}

// ---- EVENT LISTENERS ----
document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');
    let cart = JSON.parse(localStorage.getItem('fashionStoreCart')) || [];

    const updateCartCount = () => {
        cart = JSON.parse(localStorage.getItem('fashionStoreCart')) || [];
        cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    document.querySelector('main').addEventListener('click', function(event) {
        if (event.target.matches('.btn-add-to-cart')) {
            const productId = event.target.dataset.id;
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id: productId, quantity: 1 });
            }
            localStorage.setItem('fashionStoreCart', JSON.stringify(cart));
            updateCartCount();
            const product = findProductById(productId);
            alert(`"${product.name}" has been added to your cart!`);
        }
    });

    cartContentWrapper.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;
        if (!productId) return;

        let itemInCart = cart.find(i => i.id === productId);

        if (target.matches('.quantity-btn')) {
            if (target.dataset.action === 'increase') {
                itemInCart.quantity++;
            } else if (target.dataset.action === 'decrease') {
                itemInCart.quantity--;
            }
        }
        
        if (target.matches('.remove-item-btn')) {
             itemInCart.quantity = 0;
        }

        cart = cart.filter(item => item.quantity > 0);

        localStorage.setItem('fashionStoreCart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    });

    updateCartCount();

    // --- Authentication Logic ---
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginNavLink = document.getElementById('login-nav-link');
    const logoutNavLink = document.getElementById('logout-nav-link');
    const welcomeMessage = document.getElementById('welcome-message');

    const updateNavUI = () => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            loginNavLink.classList.add('hidden');
            logoutNavLink.classList.remove('hidden');
            welcomeMessage.textContent = `Welcome, ${loggedInUser}`;
            welcomeMessage.classList.remove('hidden');
        } else {
            loginNavLink.classList.remove('hidden');
            logoutNavLink.classList.add('hidden');
            welcomeMessage.classList.add('hidden');
        }
    };

    const showModal = (modal) => modal.classList.add('active');
    const hideModals = () => {
        loginModal.classList.remove('active');
        signupModal.classList.remove('active');
    };

    loginNavLink.addEventListener('click', () => showModal(loginModal));
    document.getElementById('show-signup').addEventListener('click', () => { hideModals(); showModal(signupModal); });
    document.getElementById('show-login').addEventListener('click', () => { hideModals(); showModal(loginModal); });
    
    document.querySelectorAll('.modal-overlay .close-btn').forEach(btn => btn.addEventListener('click', hideModals));
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModals();
        });
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const messageEl = document.getElementById('signup-message');

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.email === email)) {
            messageEl.textContent = 'Email already exists!';
            messageEl.className = 'form-message error';
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        
        messageEl.textContent = 'Account created successfully! Please login.';
        messageEl.className = 'form-message success';
        setTimeout(() => {
            hideModals();
            showModal(loginModal);
        }, 1500);
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageEl = document.getElementById('login-message');
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', user.username);
            updateNavUI();
            hideModals();
        } else {
            messageEl.textContent = 'Invalid email or password.';
            messageEl.className = 'form-message error';
        }
    });
    
    logoutNavLink.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        updateNavUI();
        showSection('home');
    });
    
    updateNavUI();
});