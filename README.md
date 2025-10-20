# SOLARA - Modern Minimal Luxury E-Commerce

## Project Overview

SOLARA is a sleek, modern e-commerce web application that embodies minimal luxury aesthetics. This project implements a sophisticated design system featuring a carefully curated color palette with rich charcoal black (#1C1C1C), warm beige-sand (#EADBC8), and terracotta orange (#E67E22). The application delivers a youthful, clean aesthetic inspired by contemporary fashion brands like Zara, ASOS, and Nike, but with a more personal and refined approach.

The platform provides a seamless shopping experience with full client-side functionality including user authentication, advanced product management, sophisticated shopping cart, and comprehensive administrative features. The design emphasizes minimalism, clean typography using Inter and Poppins fonts, and subtle animations that enhance user experience without overwhelming the interface.

## Key Features

### Customer Features
- **User Authentication**: Complete login and registration system with form validation
- **Product Browsing**: Browse products by category (Men, Women, Kids) with search and filtering
- **Shopping Cart**: Add/remove items, adjust quantities, and manage cart contents
- **Wishlist**: Save favorite products for later purchase
- **User Profile**: Manage personal information, addresses, and preferences
- **Order Management**: View order history and track order status
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Features
- **Product Management**: Add, edit, and delete products with detailed information
- **Dashboard**: Overview of key metrics including total products, orders, revenue, and customers
- **Order Management**: View and manage customer orders
- **Inventory Tracking**: Monitor product stock levels and status

### Technical Features
- **Form Validation**: Comprehensive client-side validation for all forms
- **Local IndexedDB Auth**: Users stored locally with salted+hashed passwords (PBKDF2)
- **Local Storage**: Persistent data storage for cart, wishlist, and user sessions
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Responsive Layout**: Mobile-first design with CSS Grid and Flexbox
- **Interactive Elements**: Hover effects, modal dialogs, and dynamic content

## Project Structure

```
/project-root
│
├── index.html                 # Home page with featured products
├── login.html                 # User login page
├── register.html              # User registration page
│
├── /pages
│   ├── profile.html           # User profile management
│   ├── orders.html            # Order history and tracking
│   ├── cart.html              # Shopping cart
│   ├── checkout.html          # Checkout process
│   └── contact.html           # Contact form and FAQ
│
├── /admin
│   ├── admin.html             # Admin dashboard
│   ├── add-product.html       # Add new product form
│   └── edit-product.html      # Edit existing product form
│
├── /css
│   ├── style.css              # Main stylesheet
│   ├── forms.css              # Form-specific styles
│   └── admin.css              # Admin panel styles
│
├── /js
│   ├── db.js                  # IndexedDB local user database (hashed passwords)
│   ├── data.js                # Data management (products, orders, cart, wishlist)
│   ├── validation.js          # Form validation functions
│   ├── main.js                # Main application logic & universal navbar
│   └── admin.js               # Admin functionality
│
├── /images                    # Product images and assets
└── README.md                  # Project documentation
```

## Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **JavaScript (ES6+)**: Vanilla JavaScript with modern features
- **Local Storage**: Client-side data persistence
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Inter and Poppins font families for modern typography

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Installation

1. **Clone or download the project files**
   ```bash
   git clone [repository-url]
   cd fashion-store
   ```

2. **Set up a local web server** (recommended)
   
   **Option 1: Python**
   ```bash
   python -m http.server 8000
   ```
   
   **Option 2: Node.js**
   ```bash
   npx serve .
   ```
   
   **Option 3: VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

3. **Access the application**
   - Open your browser and navigate to `http://localhost:8000`
   - Or simply double-click `index.html` to open directly

## Usage Guide

### For Customers

1. **Browse Products**
   - Visit the home page to see featured products
   - Use category filters to browse Men's, Women's, or Kids' collections
   - Search for specific products using the search bar

2. **User Account**
   - Click "Login" to sign in or "Register" to create a new account
   - Manage your profile information and preferences
   - View your order history

3. **Shopping**
   - Add products to your cart or wishlist
   - Adjust quantities and remove items as needed
   - Proceed to checkout to complete your purchase

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin/admin.html`
   - Use the admin dashboard to manage products and view statistics

2. **Product Management**
   - Add new products with detailed information
   - Edit existing products and update inventory
   - Delete products that are no longer available

3. **Order Management**
   - View recent orders and customer information
   - Track order status and customer details

## Form Validation

The application includes comprehensive form validation for:

- **User Registration**: Name, email, phone, password strength, age verification
- **User Login**: Email format and password validation
- **Product Forms**: Required fields, price validation, image URL verification
- **Checkout**: Shipping information, payment details, card validation
- **Contact Form**: Message length, subject selection, email format

## Data Management & Auth

- **Local IndexedDB (Auth)**: Users are stored in a local IndexedDB database with salted+hashed passwords (PBKDF2, SHA-256)
- **Local Storage (App)**: Products, orders, cart, wishlist are stored in localStorage
- **Sample Data**: Pre-loaded with sample products, users, and orders
- **Data Persistence**: Cart contents, wishlist, and user sessions persist between visits

## Responsive Design

The application is fully responsive with breakpoints for:
- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: 320px to 767px

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- Backend integration with database
- Payment gateway integration
- Email notifications
- Advanced search and filtering
- Product reviews and ratings
- Inventory management system
- Analytics and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for educational purposes as part of the SWE230 course requirements.

## Contact

For questions or support, please contact the development team or refer to the course documentation.

---

**Note**: This is a frontend-only implementation. Auth uses the browser's IndexedDB with password hashing via Web Crypto; no external server is required.
