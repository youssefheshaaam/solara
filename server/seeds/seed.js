// Database Seed Script
// Run with: node seeds/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://youssef2103390_db_user:vJ2ObfFmHlhwXiiB@cluster0.mxy2kdw.mongodb.net/solara_store?retryWrites=true&w=majority&appName=Cluster0';

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Sample Products Data
const products = [
    {
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
        name: "Crossbody Leather Bag",
        price: 75.00,
        image: "images/products/1W2A4345_copy_5.jpg",
        category: "women",
        description: "Stylish crossbody bag made from premium leather",
        brand: "SOLARA",
        sizes: ["One Size"],
        colors: ["Brown", "Black", "Tan"],
        material: "Genuine Leather",
        stock: 15,
        featured: false,
        status: "active"
    },
    {
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
        featured: true,
        status: "active"
    },
    {
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
        featured: true,
        status: "active"
    },
    {
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
        featured: true,
        status: "active"
    },
    {
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

// Admin user
const adminUser = {
    firstName: "Admin",
    lastName: "SOLARA",
    email: "admin@solara.com",
    password: "Admin@123",
    role: "admin",
    isActive: true
};

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await Product.deleteMany({});
        await User.deleteMany({ role: 'admin' }); // Only delete admin users
        
        // Seed products (one by one to generate slugs properly)
        console.log('Seeding products...');
        let createdCount = 0;
        for (const productData of products) {
            try {
                await Product.create(productData);
                createdCount++;
                process.stdout.write(`\rCreated ${createdCount}/${products.length} products`);
            } catch (err) {
                console.log(`\nError creating ${productData.name}:`, err.message);
            }
        }
        console.log(`\nCreated ${createdCount} products`);

        // Create admin user
        console.log('Creating admin user...');
        const existingAdmin = await User.findOne({ email: adminUser.email });
        if (!existingAdmin) {
            await User.create(adminUser);
            console.log('Admin user created: admin@solara.com / Admin@123');
        } else {
            console.log('Admin user already exists');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\n--- Summary ---');
        console.log(`Products: ${createdProducts.length}`);
        console.log('Admin: admin@solara.com / Admin@123');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
}

// Run the seed
seedDatabase();

