// ===== FORM VALIDATION FUNCTIONS =====

// Validation rules and patterns
const validationRules = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address"
    },
    phone: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: "Please enter a valid phone number"
    },
    password: {
        minLength: 8,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: "Password must be 8-128 characters with uppercase, lowercase, number and special character (@$!%*?&)",
        requirements: {
            length: "At least 8 characters",
            lowercase: "At least one lowercase letter",
            uppercase: "At least one uppercase letter", 
            number: "At least one number",
            special: "At least one special character (@$!%*?&)"
        }
    },
    name: {
        pattern: /^[a-zA-Z\s]{2,50}$/,
        message: "Name must be 2-50 characters and contain only letters and spaces"
    },
    cardNumber: {
        pattern: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
        message: "Please enter a valid 16-digit card number"
    },
    cvv: {
        pattern: /^\d{3,4}$/,
        message: "Please enter a valid CVV (3-4 digits)"
    },
    expiryDate: {
        pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
        message: "Please enter a valid expiry date (MM/YY)"
    }
};

// ===== VALIDATION FUNCTIONS =====

function validateField(field, value, rules = {}) {
    const errors = [];
    
    // Required field validation
    if (rules.required && (!value || value.trim() === '')) {
        errors.push(`${getFieldLabel(field)} is required`);
        return errors;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
        return errors;
    }
    
    // Email validation
    if (field.type === 'email' || field.name?.includes('email')) {
        if (!validationRules.email.pattern.test(value)) {
            errors.push(validationRules.email.message);
        }
    }
    
    // Phone validation
    if (field.type === 'tel' || field.name?.includes('phone')) {
        if (!validationRules.phone.pattern.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errors.push(validationRules.phone.message);
        }
    }
    
    // Password validation
    if (field.type === 'password' || field.name?.includes('password')) {
        const passwordErrors = validatePasswordRequirements(value);
        errors.push(...passwordErrors);
    }
    
    // Name validation
    if (field.name?.includes('name') && field.type === 'text') {
        if (!validationRules.name.pattern.test(value)) {
            errors.push(validationRules.name.message);
        }
    }
    
    // Card number validation
    if (field.name?.includes('cardNumber')) {
        if (!validationRules.cardNumber.pattern.test(value)) {
            errors.push(validationRules.cardNumber.message);
        }
    }
    
    // CVV validation
    if (field.name?.includes('cvv')) {
        if (!validationRules.cvv.pattern.test(value)) {
            errors.push(validationRules.cvv.message);
        }
    }
    
    // Expiry date validation
    if (field.name?.includes('expiryDate')) {
        if (!validationRules.expiryDate.pattern.test(value)) {
            errors.push(validationRules.expiryDate.message);
        } else {
            // Check if expiry date is in the future
            const [month, year] = value.split('/');
            const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const currentDate = new Date();
            if (expiryDate < currentDate) {
                errors.push("Card has expired");
            }
        }
    }
    
    // Custom validation rules
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${getFieldLabel(field)} must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${getFieldLabel(field)} must be no more than ${rules.maxLength} characters long`);
    }
    
    if (rules.min && parseFloat(value) < rules.min) {
        errors.push(`${getFieldLabel(field)} must be at least ${rules.min}`);
    }
    
    if (rules.max && parseFloat(value) > rules.max) {
        errors.push(`${getFieldLabel(field)} must be no more than ${rules.max}`);
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.message || `${getFieldLabel(field)} format is invalid`);
    }
    
    return errors;
}

function getFieldLabel(field) {
    const label = field.closest('.form-group')?.querySelector('label');
    return label ? label.textContent.replace('*', '').trim() : field.name || 'Field';
}

// ===== FORM VALIDATION =====

function validateForm(form, customRules = {}) {
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

// ===== REAL-TIME VALIDATION =====

function setupRealTimeValidation(form, customRules = {}) {
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
        // Validate on blur
        field.addEventListener('blur', () => {
            validateFieldRealTime(field, customRules[field.name] || {});
        });
        
        // Validate on input for certain field types
        if (field.type === 'email' || field.type === 'password' || field.name?.includes('password')) {
            field.addEventListener('input', debounce(() => {
                validateFieldRealTime(field, customRules[field.name] || {});
            }, 500));
        }
        
        // Special handling for password confirmation
        if (field.name?.includes('confirmPassword')) {
            field.addEventListener('input', () => {
                const passwordField = form.querySelector('input[name="password"]');
                if (passwordField && field.value !== passwordField.value) {
                    showFieldError(field, 'Passwords do not match');
                } else {
                    clearFieldError(field);
                }
            });
        }
        
        // Format input for certain field types
        if (field.name?.includes('cardNumber')) {
            field.addEventListener('input', formatCardNumber);
        }
        
        if (field.name?.includes('expiryDate')) {
            field.addEventListener('input', formatExpiryDate);
        }
        
        if (field.name?.includes('phone')) {
            field.addEventListener('input', formatPhoneNumber);
        }
    });
}

function validateFieldRealTime(field, rules = {}) {
    const errors = validateField(field, field.value, rules);
    
    if (errors.length > 0) {
        showFieldError(field, errors[0]);
    } else {
        clearFieldError(field);
    }
}

// ===== ERROR DISPLAY =====

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.appendChild(errorElement);
    }
    
    field.classList.add('error');
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    field.classList.remove('error');
}

function showFormErrors(form, errors) {
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

function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
    
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

function showFormMessage(form, message, type = 'error') {
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

// ===== INPUT FORMATTING =====

function formatCardNumber(event) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    
    if (formattedValue.length > 19) {
        formattedValue = formattedValue.substring(0, 19);
    }
    
    event.target.value = formattedValue;
}

function formatExpiryDate(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    event.target.value = value;
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
    } else if (value.length >= 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    }
    
    event.target.value = value;
}

// ===== PASSWORD REQUIREMENTS VALIDATION =====

function validatePasswordRequirements(password) {
    const errors = [];
    const rules = validationRules.password;
    
    // Check minimum length
    if (password.length < rules.minLength) {
        errors.push(`Password must be at least ${rules.minLength} characters long`);
    }
    
    // Check maximum length
    if (password.length > rules.maxLength) {
        errors.push(`Password must be no more than ${rules.maxLength} characters long`);
    }
    
    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    
    // Check for number
    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    
    // Check for special character
    if (!/[@$!%*?&]/.test(password)) {
        errors.push("Password must contain at least one special character (@$!%*?&)");
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push("This password is too common. Please choose a more secure password");
    }
    
    return errors;
}

function getPasswordRequirementsStatus(password) {
    const status = {
        length: password.length >= validationRules.password.minLength && password.length <= validationRules.password.maxLength,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
    };
    
    return status;
}

// ===== PASSWORD STRENGTH VALIDATION =====

function setupPasswordStrength(field) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    field.addEventListener('input', () => {
        const strength = calculatePasswordStrength(field.value);
        
        strengthBar.className = `strength-fill ${strength.level}`;
        strengthText.textContent = strength.text;
    });
}

function calculatePasswordStrength(password) {
    if (!password) {
        return { level: 'none', text: 'Enter a password', score: 0 };
    }
    
    const status = getPasswordRequirementsStatus(password);
    let score = 0;
    
    // Calculate score based on requirements
    if (status.length) score++;
    if (status.lowercase) score++;
    if (status.uppercase) score++;
    if (status.number) score++;
    if (status.special) score++;
    
    // Bonus points for length
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;
    
    // Penalty for common passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
        score = Math.max(0, score - 2);
    }
    
    if (score < 2) {
        return { level: 'weak', text: 'Weak password', score: score };
    } else if (score < 3) {
        return { level: 'fair', text: 'Fair password', score: score };
    } else if (score < 4) {
        return { level: 'good', text: 'Good password', score: score };
    } else {
        return { level: 'strong', text: 'Strong password', score: score };
    }
}

// ===== SPECIFIC FORM VALIDATIONS =====

// Login form validation
function validateLoginForm(form) {
    const rules = {
        email: { required: true },
        password: { required: true }
    };
    
    return validateForm(form, rules);
}

// Register form validation
function validateRegisterForm(form) {
    const rules = {
        firstName: { required: true, minLength: 2 },
        lastName: { required: true, minLength: 2 },
        email: { required: true },
        phone: { required: true },
        password: { required: true, minLength: 8 },
        confirmPassword: { required: true },
        dateOfBirth: { required: true },
        gender: { required: true },
        terms: { required: true }
    };
    
    const result = validateForm(form, rules);
    
    // Check password confirmation
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
    
    if (password !== confirmPassword) {
        result.isValid = false;
        result.errors.confirmPassword = ['Passwords do not match'];
    }
    
    // Check age requirement
    const dateOfBirth = form.querySelector('input[name="dateOfBirth"]').value;
    if (dateOfBirth) {
        const age = calculateAge(dateOfBirth);
        if (age < 13) {
            result.isValid = false;
            result.errors.dateOfBirth = ['You must be at least 13 years old'];
        }
    }
    
    return result;
}

// Contact form validation
function validateContactForm(form) {
    const rules = {
        firstName: { required: true, minLength: 2 },
        lastName: { required: true, minLength: 2 },
        email: { required: true },
        subject: { required: true },
        message: { required: true, minLength: 10 }
    };
    
    return validateForm(form, rules);
}

// Checkout form validation
function validateCheckoutForm(form) {
    const rules = {
        firstName: { required: true },
        lastName: { required: true },
        email: { required: true },
        phone: { required: true },
        address: { required: true },
        city: { required: true },
        state: { required: true },
        zipCode: { required: true },
        country: { required: true },
        cardNumber: { required: true },
        expiryDate: { required: true },
        cvv: { required: true },
        cardName: { required: true },
        termsAgreement: { required: true }
    };
    
    return validateForm(form, rules);
}

// Product form validation
function validateProductForm(form) {
    const rules = {
        name: { required: true, minLength: 3 },
        category: { required: true },
        price: { required: true, min: 0.01 },
        image: { required: true }
    };
    
    return validateForm(form, rules);
}

// ===== UTILITY FUNCTIONS =====

function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
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

// ===== PASSWORD REQUIREMENTS DISPLAY =====

function setupPasswordRequirements(field) {
    const requirementsContainer = document.querySelector('.password-requirements');
    if (!requirementsContainer) return;
    
    field.addEventListener('input', () => {
        const status = getPasswordRequirementsStatus(field.value);
        const rules = validationRules.password.requirements;
        
        // Update each requirement
        Object.keys(status).forEach(requirement => {
            const requirementElement = requirementsContainer.querySelector(`[data-requirement="${requirement}"]`);
            if (requirementElement) {
                const icon = requirementElement.querySelector('i');
                const text = requirementElement.querySelector('span');
                
                if (status[requirement]) {
                    icon.className = 'fas fa-check';
                    icon.style.color = 'var(--success-color)';
                    text.style.color = 'var(--success-color)';
                } else {
                    icon.className = 'fas fa-times';
                    icon.style.color = 'var(--error-color)';
                    text.style.color = 'var(--text-secondary)';
                }
            }
        });
    });
}

// ===== PASSWORD TOGGLE FUNCTIONALITY =====

function setupPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
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
        });
    });
}

// ===== FORM SUBMISSION HANDLERS =====

function setupFormSubmission(form, validationFunction, submitHandler) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const validation = validationFunction(form);
        
        if (validation.isValid) {
            submitHandler(form);
        } else {
            showFormErrors(form, validation.errors);
            showFormMessage(form, 'Please correct the errors below', 'error');
        }
    });
}

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggle();
    
    // Setup password requirements for register form
    const passwordField = document.querySelector('input[name="password"]');
    if (passwordField) {
        setupPasswordStrength(passwordField);
        setupPasswordRequirements(passwordField);
    }
});
