// ===== SOLARA API SERVICE =====
// Handles all communication with the backend

const API_BASE_URL = 'http://localhost:5000/api';

// Store token in memory and localStorage
let authToken = localStorage.getItem('authToken') || null;

// ===== HTTP HELPERS =====

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (authToken) {
        defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include', // Include cookies for sessions
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            const errorMsg = data.error || data.errors?.[0]?.message || 'Request failed';
            console.error('API Error Details:', data);
            throw new Error(errorMsg);
        }
        
        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

// ===== AUTH API =====

const AuthAPI = {
    async register(userData) {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        
        if (response.success && response.data.token) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
        
        return response;
    },
    
    async login(email, password) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response.success && response.data.token) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
        
        return response;
    },
    
    async adminLogin(email, password) {
        const response = await apiRequest('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response.success && response.data.token) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            localStorage.setItem('isAdmin', 'true');
        }
        
        return response;
    },
    
    async logout() {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore logout errors
        }
        
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
    },
    
    async getMe() {
        return await apiRequest('/auth/me');
    },
    
    async checkAuth() {
        return await apiRequest('/auth/check');
    },
    
    async changePassword(currentPassword, newPassword, confirmPassword) {
        return await apiRequest('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        });
    },
    
    isLoggedIn() {
        return !!authToken;
    },
    
    getToken() {
        return authToken;
    },
    
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
};

// ===== PRODUCTS API =====

const ProductsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        return await apiRequest(endpoint);
    },
    
    async getById(id) {
        return await apiRequest(`/products/${id}`);
    },
    
    async getByCategory(category, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString 
            ? `/products/category/${category}?${queryString}` 
            : `/products/category/${category}`;
        return await apiRequest(endpoint);
    },
    
    async getFeatured(limit = 8) {
        return await apiRequest(`/products/featured?limit=${limit}`);
    },
    
    async getNewArrivals(limit = 8) {
        return await apiRequest(`/products/new-arrivals?limit=${limit}`);
    },
    
    async search(query, params = {}) {
        const queryString = new URLSearchParams({ q: query, ...params }).toString();
        return await apiRequest(`/products/search?${queryString}`);
    },
    
    // Admin methods
    async create(productData) {
        return await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },
    
    async createWithFiles(formData) {
        const url = `${API_BASE_URL}/products`;
        const token = localStorage.getItem('authToken');
        
        const config = {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                // Don't set Content-Type - browser will set it with boundary for FormData
            },
            body: formData,
            credentials: 'include',
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            
            return data;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    },
    
    async update(id, productData) {
        return await apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },
    
    async updateWithFiles(id, formData) {
        const url = `${API_BASE_URL}/products/${id}`;
        const token = localStorage.getItem('authToken');
        
        const config = {
            method: 'PUT',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                // Don't set Content-Type - browser will set it with boundary for FormData
            },
            body: formData,
            credentials: 'include',
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            
            return data;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    },
    
    async delete(id) {
        return await apiRequest(`/products/${id}`, {
            method: 'DELETE',
        });
    },
    
    async getStats() {
        return await apiRequest('/products/admin/stats');
    }
};

// ===== CART API =====

const CartAPI = {
    async get() {
        if (!AuthAPI.isLoggedIn()) {
            // Return local cart for guests
            return { success: true, data: getLocalCart() };
        }
        return await apiRequest('/cart');
    },
    
    async add(productId, quantity = 1, options = {}) {
        if (!AuthAPI.isLoggedIn()) {
            // Handle local cart for guests
            addToLocalCart(productId, quantity, options);
            return { success: true, data: getLocalCart() };
        }
        return await apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity, ...options }),
        });
    },
    
    async update(productId, quantity) {
        if (!AuthAPI.isLoggedIn()) {
            updateLocalCartItem(productId, quantity);
            return { success: true, data: getLocalCart() };
        }
        return await apiRequest(`/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    },
    
    async remove(productId) {
        if (!AuthAPI.isLoggedIn()) {
            removeFromLocalCart(productId);
            return { success: true, data: getLocalCart() };
        }
        return await apiRequest(`/cart/${productId}`, {
            method: 'DELETE',
        });
    },
    
    async clear() {
        if (!AuthAPI.isLoggedIn()) {
            clearLocalCart();
            return { success: true };
        }
        return await apiRequest('/cart', {
            method: 'DELETE',
        });
    },
    
    async applyCoupon(couponCode) {
        return await apiRequest('/cart/coupon', {
            method: 'POST',
            body: JSON.stringify({ couponCode }),
        });
    },
    
    async syncCart() {
        // Sync local cart with server after login
        const localCart = getLocalCart();
        if (localCart.items && localCart.items.length > 0) {
            const response = await apiRequest('/cart/sync', {
                method: 'POST',
                body: JSON.stringify({ items: localCart.items }),
            });
            clearLocalCart();
            return response;
        }
        return await this.get();
    }
};

// ===== LOCAL CART HELPERS (for guests) =====

function getLocalCart() {
    const cart = localStorage.getItem('guestCart');
    return cart ? JSON.parse(cart) : { items: [], itemCount: 0, subtotal: 0, total: 0 };
}

function saveLocalCart(cart) {
    localStorage.setItem('guestCart', JSON.stringify(cart));
}

function addToLocalCart(productId, quantity, options) {
    const cart = getLocalCart();
    const existingIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
    } else {
        cart.items.push({ productId, quantity, ...options });
    }
    
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    saveLocalCart(cart);
}

function updateLocalCartItem(productId, quantity) {
    const cart = getLocalCart();
    const index = cart.items.findIndex(item => item.productId === productId);
    
    if (index > -1) {
        if (quantity <= 0) {
            cart.items.splice(index, 1);
        } else {
            cart.items[index].quantity = quantity;
        }
    }
    
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    saveLocalCart(cart);
}

function removeFromLocalCart(productId) {
    const cart = getLocalCart();
    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    saveLocalCart(cart);
}

function clearLocalCart() {
    localStorage.removeItem('guestCart');
}

// ===== ORDERS API =====

const OrdersAPI = {
    async getMyOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/orders/my-orders?${queryString}` : '/orders/my-orders';
        return await apiRequest(endpoint);
    },
    
    async getById(id) {
        return await apiRequest(`/orders/${id}`);
    },
    
    async getByNumber(orderNumber) {
        return await apiRequest(`/orders/number/${orderNumber}`);
    },
    
    async create(orderData) {
        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },
    
    async cancel(id) {
        return await apiRequest(`/orders/${id}/cancel`, {
            method: 'PUT',
        });
    },
    
    // Admin methods
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/orders?${queryString}` : '/orders';
        return await apiRequest(endpoint);
    },
    
    async updateStatus(id, status, data = {}) {
        return await apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, ...data }),
        });
    },
    
    async getStats() {
        return await apiRequest('/orders/admin/stats');
    }
};

// ===== USERS API =====

const UsersAPI = {
    async getProfile() {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        return await apiRequest(`/users/${user._id || user.id}`);
    },
    
    async updateProfile(data) {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        const response = await apiRequest(`/users/${user._id || user.id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        
        if (response.success) {
            // Update stored user data
            if (response.data) {
                AuthAPI.setCurrentUser(response.data);
            }
            localStorage.setItem('currentUser', JSON.stringify(response.data));
        }
        
        return response;
    },
    
    async updateProfileWithFile(formData, userId) {
        const url = `${API_BASE_URL}/users/${userId}`;
        const token = localStorage.getItem('authToken');
        
        const config = {
            method: 'PUT',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                // Don't set Content-Type - browser will set it with boundary for FormData
            },
            body: formData,
            credentials: 'include',
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            
            if (data.success && data.data) {
                AuthAPI.setCurrentUser(data.data);
                localStorage.setItem('currentUser', JSON.stringify(data.data));
            }
            
            return data;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    },
    
    async addAddress(address) {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        return await apiRequest(`/users/${user._id || user.id}/addresses`, {
            method: 'POST',
            body: JSON.stringify(address),
        });
    },
    
    async updateAddress(addressId, address) {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        return await apiRequest(`/users/${user._id || user.id}/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(address),
        });
    },
    
    async deleteAddress(addressId) {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        return await apiRequest(`/users/${user._id || user.id}/addresses/${addressId}`, {
            method: 'DELETE',
        });
    },
    
    async addToWishlist(productId) {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        return await apiRequest(`/users/${user._id || user.id}/wishlist`, {
            method: 'POST',
            body: JSON.stringify({ productId }),
        });
    },
    
    async removeFromWishlist(productId) {
        const user = AuthAPI.getCurrentUser();
        if (!user) throw new Error('Not logged in');
        return await apiRequest(`/users/${user._id || user.id}/wishlist/${productId}`, {
            method: 'DELETE',
        });
    },
    
    // Admin methods
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/users?${queryString}` : '/users';
        return await apiRequest(endpoint);
    },
    
    async updateByAdmin(userId, data) {
        return await apiRequest(`/users/${userId}/admin`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    
    async delete(userId) {
        return await apiRequest(`/users/${userId}`, {
            method: 'DELETE',
        });
    },
    
    async getStats() {
        return await apiRequest('/users/stats');
    }
};

// ===== LOCALIZATION API =====

const LocaleAPI = {
    async getTranslations(lang = 'en') {
        return await apiRequest(`/locales/${lang}`);
    },
    
    async setLanguage(lang) {
        return await apiRequest('/set-language', {
            method: 'POST',
            body: JSON.stringify({ lang }),
        });
    }
};

// ===== EXPORT =====

// Make APIs globally available
window.API = {
    Auth: AuthAPI,
    Products: ProductsAPI,
    Cart: CartAPI,
    Orders: OrdersAPI,
    Users: UsersAPI,
    Locale: LocaleAPI
};

// Also export individual APIs
window.AuthAPI = AuthAPI;
window.ProductsAPI = ProductsAPI;
window.CartAPI = CartAPI;
window.OrdersAPI = OrdersAPI;
window.UsersAPI = UsersAPI;
window.LocaleAPI = LocaleAPI;

console.log('🌟 SOLARA API Service loaded');

