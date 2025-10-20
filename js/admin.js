// ===== ADMIN FUNCTIONALITY =====

// Global admin variables
let currentPage = 1;
let itemsPerPage = 10;
let currentFilter = '';
let currentSearch = '';

// ===== ADMIN AUTHENTICATION =====
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';
const ADMIN_AUTH_KEY = 'solaraAdminAuthed';
const ADMIN_AUTH_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getAdminAuthState() {
    try {
        const raw = localStorage.getItem(ADMIN_AUTH_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (_) {
        return null;
    }
}

function isAdminAuthenticated() {
    const state = getAdminAuthState();
    if (!state || !state.token || !state.expiresAt) return false;
    return Date.now() < state.expiresAt;
}

function setAdminAuthenticated() {
    const state = {
        token: 'ok',
        issuedAt: Date.now(),
        expiresAt: Date.now() + ADMIN_AUTH_TTL_MS,
    };
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state));
}

function clearAdminAuth() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
}

function checkAdminAuth() {
    const adminContainer = document.querySelector('.admin-container');
    const adminLoginContainer = document.getElementById('admin-login-container');
    const urlParams = new URLSearchParams(window.location.search);
    const forceLogin = urlParams.has('login');

    // Force logout if requested
    if (forceLogin) {
        clearAdminAuth();
    }

    // Check if admin is authenticated (with expiry)
    const isAuthenticated = isAdminAuthenticated();
    
    if (isAuthenticated && !forceLogin) {
        // Show admin dashboard
        if (adminContainer) {
            adminContainer.style.display = 'block';
        }
        if (adminLoginContainer) {
            adminLoginContainer.style.display = 'none';
        }
        initializeAdminDashboard();
    } else {
        // Show login form
        if (adminContainer) {
            adminContainer.style.display = 'none';
        }
        if (adminLoginContainer) {
            adminLoginContainer.style.display = 'flex';
        }
        setupAdminLogin();
        
        // Clear any existing authentication
        clearAdminAuth();
    }
}

function setupAdminLogin() {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    const adminLogoutBtn = document.getElementById('admin-logout');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', handleAdminLogout);
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    const messageElement = document.getElementById('admin-login-message');

    if (usernameInput.value === ADMIN_USERNAME && passwordInput.value === ADMIN_PASSWORD) {
        setAdminAuthenticated();
        messageElement.textContent = 'Login successful!';
        messageElement.className = 'form-message success';
        messageElement.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } else {
        messageElement.textContent = 'Invalid username or password.';
        messageElement.className = 'form-message error';
        messageElement.style.display = 'block';
    }
}

function handleAdminLogout() {
    clearAdminAuth();
    window.location.href = 'admin.html?login'; // Redirect to login page
}

// ===== ADMIN INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin')) {
        checkAdminAuth();
    }
});

// Also run immediately in case DOMContentLoaded already fired
if (window.location.pathname.includes('admin')) {
    checkAdminAuth();
}

function initializeAdminDashboard() {
    loadDashboardStats();
    loadProductsTable();
    loadRecentOrders();
    setupAdminEventListeners();
    setupProductSearch();
    setupProductFilters();
    setupPagination();
    setupAdminNavigation();
}

function initializeAdmin() {
    loadDashboardStats();
    loadProductsTable();
    loadRecentOrders();
    setupAdminEventListeners();
    setupProductSearch();
    setupProductFilters();
    setupPagination();
}

// ===== DASHBOARD STATS =====

function loadDashboardStats() {
    const products = getProducts();
    const orders = getOrders();
    const users = getUsers();
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => {
        return total + order.total;
    }, 0);
    
    // Update stats display
    updateStatCard('total-products', products.length);
    updateStatCard('total-orders', orders.length);
    updateStatCard('total-revenue', formatPrice(totalRevenue));
    updateStatCard('total-customers', users.length);
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// ===== PRODUCTS TABLE =====

function loadProductsTable() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    
    const products = getProducts();
    const filteredProducts = filterProducts(products);
    const paginatedProducts = paginateProducts(filteredProducts);
    
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>No products found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedProducts.map(product => createProductTableRow(product)).join('');
    updatePagination(filteredProducts.length);
}

function createProductTableRow(product) {
    const statusClass = product.status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = product.status === 'active' ? 'Active' : 'Inactive';
    
    return `
        <tr>
            <td>
                <img src="../${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display:none; width:50px; height:50px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#999; font-size:1.2em;">
                    <i class="fas fa-image"></i>
                </div>
            </td>
            <td>
                <div class="product-name">${product.name}</div>
                <div class="product-brand">${product.brand || 'SOLARA'}</div>
            </td>
            <td>
                <span class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
            </td>
            <td>
                <span class="product-price">${formatPrice(product.price)}</span>
            </td>
            <td>
                <span class="product-stock">${product.stock || 0}</span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-outline btn-sm edit-product-btn" data-product-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-product-btn" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function filterProducts(products) {
    let filtered = [...products];
    
    // Apply category filter
    if (currentFilter && currentFilter !== '') {
        filtered = filtered.filter(product => product.category === currentFilter);
    }
    
    // Apply search filter
    if (currentSearch && currentSearch.trim() !== '') {
        const searchTerm = currentSearch.toLowerCase();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand?.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

function paginateProducts(products) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
}

// ===== PRODUCT MANAGEMENT =====

function setupProductSearch() {
    const searchInput = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value;
            currentPage = 1; // Reset to first page
            loadProductsTable();
        }, 300));
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('product-search');
            currentSearch = searchInput.value;
            currentPage = 1;
            loadProductsTable();
        });
    }
}

function setupProductFilters() {
    const categoryFilter = document.getElementById('category-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            currentPage = 1; // Reset to first page
            loadProductsTable();
        });
    }
}

function setupPagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadProductsTable();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const products = getProducts();
            const filteredProducts = filterProducts(products);
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
            
            if (currentPage < totalPages) {
                currentPage++;
                loadProductsTable();
            }
        });
    }
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (currentPageElement) currentPageElement.textContent = currentPage;
    if (totalPagesElement) totalPagesElement.textContent = totalPages;
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

// ===== PRODUCT EDIT/DELETE =====

function setupAdminEventListeners() {
    // Edit product buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-product-btn')) {
            const productId = e.target.closest('.edit-product-btn').dataset.productId;
            editProduct(productId);
        }
    });
    
    // Delete product buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-product-btn')) {
            const productId = e.target.closest('.delete-product-btn').dataset.productId;
            showDeleteConfirmation(productId);
        }
    });
    
    // Add product form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Edit product form
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }
    
    // Image preview
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('input', updateImagePreview);
    }
}

function editProduct(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    // Fill edit form with product data
    const form = document.getElementById('edit-product-form');
    if (form) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-compare-price').value = product.comparePrice || '';
        document.getElementById('product-sku').value = product.sku || '';
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-material').value = product.material || '';
        document.getElementById('product-care').value = product.care || '';
        document.getElementById('product-tags').value = product.tags || '';
        document.getElementById('product-meta-title').value = product.metaTitle || '';
        document.getElementById('product-meta-description').value = product.metaDescription || '';
        document.getElementById('featured-product').checked = product.featured || false;
        document.getElementById('product-status').checked = product.status === 'active';
        
        // Set sizes
        if (product.sizes) {
            product.sizes.forEach(size => {
                const checkbox = document.querySelector(`input[name="sizes"][value="${size}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Set colors
        if (product.colors) {
            const colorInputs = document.querySelectorAll('input[name="colors"]');
            product.colors.forEach((color, index) => {
                if (colorInputs[index]) {
                    colorInputs[index].value = color;
                }
            });
        }
        
        updateImagePreview();
    }
    
    // Navigate to edit page
    window.location.href = 'edit-product.html';
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        comparePrice: parseFloat(formData.get('comparePrice')) || null,
        sku: formData.get('sku'),
        stock: parseInt(formData.get('stock')) || 0,
        image: formData.get('image'),
        material: formData.get('material'),
        care: formData.get('care'),
        tags: formData.get('tags'),
        metaTitle: formData.get('metaTitle'),
        metaDescription: formData.get('metaDescription'),
        featured: formData.get('featured') === 'on',
        status: formData.get('status') === 'on' ? 'active' : 'inactive',
        sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value),
        colors: Array.from(document.querySelectorAll('input[name="colors"]')).map(input => input.value).filter(color => color.trim() !== '')
    };
    
    // Validate product data
    const validation = validateProductForm(e.target);
    if (!validation.isValid) {
        showFormErrors(e.target, validation.errors);
        showFormMessage(e.target, 'Please correct the errors below', 'error');
        return;
    }
    
    try {
        const newProduct = addProduct(productData);
        showFormMessage(e.target, 'Product added successfully!', 'success');
        
        // Reset form
        e.target.reset();
        updateImagePreview();
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
        
    } catch (error) {
        showFormMessage(e.target, 'Error adding product. Please try again.', 'error');
    }
}

function handleEditProduct(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const formData = new FormData(e.target);
    
    const updatedData = {
        name: formData.get('name'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        comparePrice: parseFloat(formData.get('comparePrice')) || null,
        sku: formData.get('sku'),
        stock: parseInt(formData.get('stock')) || 0,
        image: formData.get('image'),
        material: formData.get('material'),
        care: formData.get('care'),
        tags: formData.get('tags'),
        metaTitle: formData.get('metaTitle'),
        metaDescription: formData.get('metaDescription'),
        featured: formData.get('featured') === 'on',
        status: formData.get('status') === 'on' ? 'active' : 'inactive',
        sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value),
        colors: Array.from(document.querySelectorAll('input[name="colors"]')).map(input => input.value).filter(color => color.trim() !== '')
    };
    
    // Validate product data
    const validation = validateProductForm(e.target);
    if (!validation.isValid) {
        showFormErrors(e.target, validation.errors);
        showFormMessage(e.target, 'Please correct the errors below', 'error');
        return;
    }
    
    try {
        const updatedProduct = updateProduct(productId, updatedData);
        if (updatedProduct) {
            showFormMessage(e.target, 'Product updated successfully!', 'success');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
        } else {
            showFormMessage(e.target, 'Product not found', 'error');
        }
    } catch (error) {
        showFormMessage(e.target, 'Error updating product. Please try again.', 'error');
    }
}

function showDeleteConfirmation(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    const modal = document.getElementById('delete-product-modal');
    if (modal) {
        modal.classList.add('active');
        
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');
        
        confirmBtn.onclick = () => {
            deleteProduct(productId);
            modal.classList.remove('active');
            loadProductsTable();
            loadDashboardStats();
            showNotification('Product deleted successfully', 'success');
        };
        
        cancelBtn.onclick = () => {
            modal.classList.remove('active');
        };
    }
}

// ===== IMAGE PREVIEW =====

function updateImagePreview() {
    const imageInput = document.getElementById('product-image');
    const previewContainer = document.getElementById('image-preview');
    
    if (!imageInput || !previewContainer) return;
    
    const imageUrl = imageInput.value.trim();
    
    if (imageUrl) {
        previewContainer.innerHTML = `
            <div class="preview-item">
                <img src="${imageUrl}" alt="Product Preview" onerror="this.style.display='none'">
                <p>Main Image Preview</p>
            </div>
        `;
    } else {
        previewContainer.innerHTML = '';
    }
}

// ===== RECENT ORDERS =====

function loadRecentOrders() {
    const ordersContainer = document.getElementById('recent-orders');
    if (!ordersContainer) return;
    
    const orders = getOrders().slice(0, 5); // Get 5 most recent orders
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>No orders found</p>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = orders.map(order => createOrderItemHTML(order)).join('');
}

function createOrderItemHTML(order) {
    const user = findUserById(order.userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    const statusClass = `status-${order.status}`;
    
    return `
        <div class="order-item">
            <div class="order-info">
                <h4>${order.id}</h4>
                <p>${userName} - ${formatPrice(order.total)}</p>
            </div>
            <div class="order-status">
                <span class="status-badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div class="order-date">
                <p>${formatDate(order.createdAt)}</p>
            </div>
        </div>
    `;
}

// ===== ADMIN NAVIGATION =====

function setupAdminNavigation() {
    const manageProductsBtn = document.getElementById('manage-products');
    const editProductsBtn = document.getElementById('edit-products-btn');
    const ordersLink = document.querySelector('.admin-nav-menu a:nth-child(4)');
    const customersLink = document.querySelector('.admin-nav-menu a:nth-child(5)');
    const reportsBtn = document.querySelector('.action-buttons a:nth-child(3)');
    const settingsBtn = document.querySelector('.action-buttons a:nth-child(4)');
    
    if (manageProductsBtn) {
        manageProductsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to products table
            const productsSection = document.querySelector('.products-management');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (editProductsBtn) {
        editProductsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to products table
            const productsSection = document.querySelector('.products-management');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const showComingSoon = (label) => {
        showAdminNotification(`${label} is coming soon.`, 'info');
    };

    if (ordersLink) {
        ordersLink.addEventListener('click', (e) => {
            e.preventDefault();
            showComingSoon('Orders');
        });
    }
    if (customersLink) {
        customersLink.addEventListener('click', (e) => {
            e.preventDefault();
            showComingSoon('Customers');
        });
    }
    if (reportsBtn) {
        reportsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showComingSoon('Reports');
        });
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showComingSoon('Settings');
        });
    }
}

// ===== ADMIN UTILITIES =====

function showAdminNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to admin container
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        adminContainer.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideAdminNotification(notification);
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            hideAdminNotification(notification);
        });
    }
}

function hideAdminNotification(notification) {
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

// ===== ADMIN FORM VALIDATION =====

function validateAdminForm(form, customRules = {}) {
    const errors = {};
    let isValid = true;
    
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
        const fieldName = field.name;
        const fieldValue = field.value;
        const fieldRules = customRules[fieldName] || {};
        
        // Skip validation for hidden fields or disabled fields
        if (field.type === 'hidden' || field.disabled) {
            return;
        }
        
        const fieldErrors = validateField(field, fieldValue, fieldRules);
        
        if (fieldErrors.length > 0) {
            errors[fieldName] = fieldErrors;
            isValid = false;
        }
    });
    
    return { isValid, errors };
}

function showAdminFormErrors(form, errors) {
    // Clear existing errors
    clearFormErrors(form);
    
    // Show new errors
    Object.keys(errors).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            showFieldError(field, errors[fieldName][0]);
        }
    });
}

function showAdminFormMessage(form, message, type = 'error') {
    const messageElement = form.querySelector('.form-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
}

// ===== ADMIN PAGE-SPECIFIC INITIALIZATION =====

// Admin dashboard page
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupAdminNavigation();
    });
}

// Add product page
if (window.location.pathname.includes('add-product.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupProductFormValidation();
    });
}

// Edit product page
if (window.location.pathname.includes('edit-product.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupProductFormValidation();
        loadProductForEdit();
    });
}

function setupProductFormValidation() {
    const form = document.getElementById('add-product-form') || document.getElementById('edit-product-form');
    if (form) {
        setupRealTimeValidation(form, {
            name: { required: true, minLength: 3 },
            category: { required: true },
            price: { required: true, min: 0.01 },
            image: { required: true }
        });
    }
}

function loadProductForEdit() {
    // Get product ID from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || localStorage.getItem('editingProductId');
    
    if (productId) {
        editProduct(productId);
    }
}
