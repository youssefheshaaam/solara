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
const Cart = require('../models/Cart');

// Enhanced Products Data with detailed information
const products = [
    // MEN'S COLLECTION
    {
        name: "Classic Cotton T-Shirt",
        price: 850.00,
        comparePrice: 1100.00,
        image: "images/products/1.gif",
        category: "men",
        description: "Our signature Classic Cotton T-Shirt is the ultimate wardrobe essential. Crafted from 100% premium combed cotton, this tee offers exceptional softness and breathability. The relaxed fit provides all-day comfort while maintaining a clean, modern silhouette. Reinforced stitching at the collar and hem ensures long-lasting durability. Perfect for layering or wearing on its own.",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Blue", "White", "Black", "Red", "Navy"],
        material: "100% Premium Combed Cotton",
        stock: 50,
        featured: true,
        status: "active",
        fit: "Regular Fit",
        season: "All Season",
        careInstructions: [
            "Machine wash cold with similar colors",
            "Do not bleach",
            "Tumble dry low",
            "Warm iron if needed",
            "Do not dry clean"
        ],
        tags: ["casual", "essential", "cotton", "everyday"],
        ratings: { average: 4.7, count: 128 }
    },
    {
        name: "Classic Oxford Shirt",
        price: 950.00,
        comparePrice: 1200.00,
        image: "images/products/1W2A0097.jpg",
        category: "men",
        description: "Elevate your everyday style with our Classic Oxford Shirt. This timeless piece features a button-down collar and single-button barrel cuffs. The premium cotton oxford fabric offers a refined texture with natural breathability. A perfect choice for business casual settings or dressed-down weekend wear. Pair with chinos or jeans for versatile styling options.",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Light Blue", "Pink", "Navy Stripe"],
        material: "100% Premium Cotton Oxford",
        stock: 40,
        featured: true,
        status: "active",
        fit: "Slim Fit",
        season: "All Season",
        careInstructions: [
            "Machine wash warm",
            "Non-chlorine bleach when needed",
            "Tumble dry medium",
            "Steam iron on medium heat",
            "May be dry cleaned"
        ],
        tags: ["formal", "business", "oxford", "professional"],
        ratings: { average: 4.8, count: 95 }
    },
    {
        name: "Slim Fit Stretch Jeans",
        price: 1100.00,
        comparePrice: 1400.00,
        image: "images/products/1W2A0099-Edit_5.jpg",
        category: "men",
        description: "Experience the perfect blend of style and comfort with our Slim Fit Stretch Jeans. The innovative stretch denim technology allows for maximum mobility while maintaining a sleek, tailored look. Features include a classic five-pocket design, branded rivets, and a signature leather patch. The dark indigo wash offers versatility for both casual and smart casual occasions.",
        brand: "SOLARA",
        sizes: ["28", "30", "32", "34", "36", "38", "40"],
        colors: ["Dark Indigo", "Light Wash", "Black", "Gray"],
        material: "98% Cotton, 2% Elastane Stretch Denim",
        stock: 35,
        featured: false,
        status: "active",
        fit: "Slim Fit",
        season: "All Season",
        careInstructions: [
            "Machine wash cold inside out",
            "Do not bleach",
            "Hang dry recommended",
            "Warm iron inside out",
            "Do not dry clean"
        ],
        tags: ["jeans", "denim", "casual", "stretch"],
        ratings: { average: 4.6, count: 156 }
    },
    {
        name: "Premium Leather Derby Shoes",
        price: 1450.00,
        comparePrice: 1800.00,
        image: "images/products/1W2A3842HQ_996391aa-7b22-4f88-a959-d83f639ffbbf_2.jpg",
        category: "men",
        description: "Step into sophistication with our Premium Leather Derby Shoes. Handcrafted from full-grain Italian leather, these shoes feature a Goodyear welted construction for superior durability and easy resoling. The cushioned insole provides all-day comfort, while the leather outsole offers elegant flex with every step. A timeless investment piece for the modern gentleman.",
        brand: "SOLARA",
        sizes: ["7", "8", "9", "10", "11", "12", "13"],
        colors: ["Brown", "Black", "Burgundy", "Tan"],
        material: "Full-Grain Italian Leather, Leather Sole",
        stock: 20,
        featured: true,
        status: "active",
        fit: "True to Size",
        season: "All Season",
        careInstructions: [
            "Use shoe trees after wearing",
            "Clean with soft cloth",
            "Apply leather conditioner monthly",
            "Polish regularly",
            "Store in dust bags"
        ],
        tags: ["formal", "leather", "dress shoes", "premium"],
        ratings: { average: 4.9, count: 67 }
    },
    {
        name: "Classic Polo Shirt",
        price: 900.00,
        comparePrice: 1150.00,
        image: "images/products/1W2A7021.jpg",
        category: "men",
        description: "Our Classic Polo Shirt embodies timeless elegance with a modern twist. Crafted from premium cotton piqué fabric, it features a ribbed collar and cuffs that hold their shape. The two-button placket and vented hem provide refined details. Perfect for golf, casual Fridays, or weekend brunches. An essential piece that transitions seamlessly from day to evening.",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Navy", "Red", "Black", "Forest Green"],
        material: "100% Premium Cotton Piqué",
        stock: 42,
        featured: false,
        status: "active",
        fit: "Classic Fit",
        season: "Spring/Summer",
        careInstructions: [
            "Machine wash cold",
            "Do not bleach",
            "Tumble dry low",
            "Warm iron if needed",
            "Do not dry clean"
        ],
        tags: ["polo", "casual", "smart casual", "classic"],
        ratings: { average: 4.5, count: 89 }
    },
    {
        name: "Streetwear Premium Hoodie",
        price: 1150.00,
        comparePrice: 1450.00,
        image: "images/products/9.gif",
        category: "men",
        description: "Make a statement with our Streetwear Premium Hoodie. This heavyweight hoodie features a relaxed, oversized fit with dropped shoulders for that coveted streetwear aesthetic. The double-layered hood, kangaroo pocket, and ribbed cuffs provide both function and style. Made from a plush cotton blend that gets softer with every wash.",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Heather Gray", "White", "Olive"],
        material: "80% Cotton, 20% Polyester Fleece",
        stock: 28,
        featured: true,
        status: "active",
        fit: "Oversized",
        season: "Fall/Winter",
        careInstructions: [
            "Machine wash cold inside out",
            "Do not bleach",
            "Tumble dry low",
            "Do not iron print",
            "Do not dry clean"
        ],
        tags: ["streetwear", "hoodie", "casual", "oversized"],
        ratings: { average: 4.8, count: 203 }
    },
    {
        name: "Urban Street Jacket",
        price: 1250.00,
        comparePrice: 1600.00,
        image: "images/products/omar7barakat_StreetWear_-27_1.jpg",
        category: "men",
        description: "The Urban Street Jacket is designed for the style-conscious city dweller. Features include multiple utility pockets, adjustable cuffs, and a modern cropped silhouette. The water-resistant cotton canvas shell keeps you protected from light rain, while the soft cotton lining ensures comfort. Perfect for layering over hoodies or wearing with a simple tee.",
        brand: "SOLARA",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Olive", "Navy", "Khaki"],
        material: "Water-Resistant Cotton Canvas, Cotton Lining",
        stock: 22,
        featured: false,
        status: "active",
        fit: "Modern Cropped",
        season: "Spring/Fall",
        careInstructions: [
            "Spot clean recommended",
            "Machine wash cold if needed",
            "Hang dry",
            "Do not bleach",
            "Warm iron if needed"
        ],
        tags: ["jacket", "streetwear", "urban", "outerwear"],
        ratings: { average: 4.7, count: 78 }
    },

    // WOMEN'S COLLECTION
    {
        name: "Elegant Summer Dress",
        price: 1050.00,
        comparePrice: 1400.00,
        image: "images/products/1R5A0057_1_2.jpg",
        category: "women",
        description: "Embrace summer in our Elegant Summer Dress. This flowing midi-length dress features a flattering V-neckline and delicate cap sleeves. The lightweight fabric drapes beautifully, creating an effortlessly chic silhouette. Perfect for garden parties, brunches, or vacation wear. Pair with sandals for a casual look or heels for evening elegance.",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Floral Print", "Sky Blue", "Blush Pink", "White"],
        material: "100% Viscose Rayon",
        stock: 30,
        featured: true,
        status: "active",
        fit: "Relaxed Fit",
        season: "Spring/Summer",
        careInstructions: [
            "Hand wash cold or delicate cycle",
            "Do not bleach",
            "Hang dry",
            "Cool iron if needed",
            "Do not dry clean"
        ],
        tags: ["dress", "summer", "elegant", "feminine"],
        ratings: { average: 4.8, count: 142 }
    },
    {
        name: "Silk Ruffle Blouse",
        price: 1200.00,
        comparePrice: 1500.00,
        image: "images/products/1W2A3908HQ_4.jpg",
        category: "women",
        description: "Add a touch of romance to your wardrobe with our Silk Ruffle Blouse. This luxurious piece features cascading ruffles down the front and delicate mother-of-pearl buttons. The pure silk fabric offers a beautiful drape and subtle sheen. Perfect for office to evening transitions. Tuck into high-waisted trousers or wear untucked with jeans.",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Ivory", "Black", "Navy", "Dusty Rose"],
        material: "100% Mulberry Silk",
        stock: 28,
        featured: true,
        status: "active",
        fit: "Classic Fit",
        season: "All Season",
        careInstructions: [
            "Dry clean recommended",
            "Or hand wash in cold water",
            "Use silk-specific detergent",
            "Hang dry away from direct sunlight",
            "Iron on low silk setting"
        ],
        tags: ["silk", "blouse", "elegant", "office"],
        ratings: { average: 4.9, count: 86 }
    },
    {
        name: "A-Line Midi Skirt",
        price: 1000.00,
        comparePrice: 1300.00,
        image: "images/products/1W2A4118_2.jpg",
        category: "women",
        description: "Our A-Line Midi Skirt is a versatile wardrobe staple that flatters every figure. The classic A-line silhouette falls gracefully below the knee for an elegant, feminine look. Features include a concealed side zipper and a comfortable elastic waistband at the back. Pair with blouses for the office or knit tops for weekend style.",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Camel", "Burgundy"],
        material: "Polyester Crepe Blend",
        stock: 32,
        featured: false,
        status: "active",
        fit: "A-Line",
        season: "All Season",
        careInstructions: [
            "Machine wash cold delicate",
            "Do not bleach",
            "Hang dry",
            "Steam or iron on low",
            "May be dry cleaned"
        ],
        tags: ["skirt", "midi", "office", "versatile"],
        ratings: { average: 4.6, count: 67 }
    },
    {
        name: "Designer Leather Crossbody Bag",
        price: 1300.00,
        comparePrice: 1700.00,
        image: "images/products/1W2A4345_copy_5.jpg",
        category: "women",
        description: "Elevate your accessories game with our Designer Leather Crossbody Bag. Crafted from buttery-soft pebbled leather, this bag features an adjustable strap, secure magnetic closure, and multiple interior pockets. The perfect size for your daily essentials without weighing you down. A timeless investment piece that complements any outfit.",
        brand: "SOLARA",
        sizes: ["One Size"],
        colors: ["Cognac", "Black", "Burgundy", "Tan", "Navy"],
        material: "Premium Pebbled Leather, Cotton Lining",
        stock: 15,
        featured: true,
        status: "active",
        fit: "Adjustable Strap",
        season: "All Season",
        careInstructions: [
            "Store in dust bag when not in use",
            "Clean with soft dry cloth",
            "Avoid direct sunlight",
            "Use leather conditioner occasionally",
            "Keep away from water"
        ],
        tags: ["bag", "leather", "accessories", "crossbody"],
        ratings: { average: 4.9, count: 112 }
    },
    {
        name: "Tailored Wool Blazer",
        price: 1450.00,
        comparePrice: 1850.00,
        image: "images/products/215576B3-B23A-443F-AE54-5F7179347F5C_1.jpg",
        category: "women",
        description: "Command attention in our Tailored Wool Blazer. This impeccably crafted piece features a single-button closure, notched lapels, and functional pockets. The wool blend fabric provides structure while remaining comfortable for all-day wear. Perfect for the boardroom or dressed down with jeans for a polished casual look.",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Heather Gray", "Camel"],
        material: "70% Wool, 30% Polyester, Satin Lining",
        stock: 18,
        featured: true,
        status: "active",
        fit: "Tailored Fit",
        season: "Fall/Winter",
        careInstructions: [
            "Dry clean only",
            "Store on padded hanger",
            "Steam to remove wrinkles",
            "Avoid direct heat",
            "Brush to remove lint"
        ],
        tags: ["blazer", "professional", "wool", "tailored"],
        ratings: { average: 4.8, count: 94 }
    },
    {
        name: "Elegant Evening Gown",
        price: 1500.00,
        comparePrice: 2000.00,
        image: "images/products/IMG_6838.gif",
        category: "women",
        description: "Make an unforgettable entrance in our Elegant Evening Gown. This show-stopping piece features a figure-flattering draped bodice and a flowing floor-length skirt. The luxurious silk chiffon fabric creates beautiful movement with every step. Complete with a subtle side slit and concealed back zipper for a flawless fit. Perfect for galas, weddings, and special occasions.",
        brand: "SOLARA",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Emerald", "Burgundy", "Midnight Navy"],
        material: "100% Silk Chiffon, Silk Charmeuse Lining",
        stock: 12,
        featured: true,
        status: "active",
        fit: "Figure-Hugging Bodice, Flowing Skirt",
        season: "All Season (Formal Events)",
        careInstructions: [
            "Professional dry clean only",
            "Store hanging in garment bag",
            "Steam to remove wrinkles",
            "Handle with care",
            "Avoid perfume directly on fabric"
        ],
        tags: ["gown", "evening", "formal", "luxury"],
        ratings: { average: 5.0, count: 48 }
    },

    // KIDS' COLLECTION
    {
        name: "Kids Winter Puffer Jacket",
        price: 950.00,
        comparePrice: 1200.00,
        image: "images/products/1R5A0160.jpg",
        category: "kids",
        description: "Keep your little ones warm and stylish with our Kids Winter Puffer Jacket. Features include a cozy fleece-lined hood, multiple zippered pockets, and reflective details for visibility in low light. The water-resistant shell keeps kids dry during outdoor play, while the synthetic insulation provides lightweight warmth. Machine washable for easy care.",
        brand: "SOLARA Kids",
        sizes: ["4", "6", "8", "10", "12", "14"],
        colors: ["Red", "Royal Blue", "Forest Green", "Black", "Pink"],
        material: "Water-Resistant Polyester Shell, Recycled Polyester Fill",
        stock: 25,
        featured: true,
        status: "active",
        fit: "Regular Fit",
        season: "Fall/Winter",
        careInstructions: [
            "Machine wash cold",
            "Tumble dry low with tennis balls",
            "Do not bleach",
            "Do not iron",
            "Can be dry cleaned"
        ],
        tags: ["jacket", "winter", "kids", "warm"],
        ratings: { average: 4.8, count: 156 }
    },
    {
        name: "Fun Graphic Print T-Shirt",
        price: 750.00,
        comparePrice: 950.00,
        image: "images/products/2_4.gif",
        category: "kids",
        description: "Let kids express their personality with our Fun Graphic Print T-Shirt. Made from soft, breathable cotton that's gentle on sensitive skin. Features playful designs that kids love and parents approve of. Pre-shrunk fabric ensures the perfect fit wash after wash. Available in a rainbow of colors to mix and match with their favorite bottoms.",
        brand: "SOLARA Kids",
        sizes: ["2T", "3T", "4T", "5", "6", "7", "8", "10", "12"],
        colors: ["Blue", "Red", "Green", "Yellow", "Purple", "Orange"],
        material: "100% Organic Combed Cotton",
        stock: 45,
        featured: false,
        status: "active",
        fit: "Relaxed Fit",
        season: "All Season",
        careInstructions: [
            "Machine wash cold inside out",
            "Do not bleach",
            "Tumble dry low",
            "Do not iron print directly",
            "Do not dry clean"
        ],
        tags: ["t-shirt", "kids", "graphic", "fun"],
        ratings: { average: 4.7, count: 234 }
    },
    {
        name: "Comfortable Jogger Pants",
        price: 800.00,
        comparePrice: 1050.00,
        image: "images/products/1W2A6581_0f869f30-1398-4694-9c5e-6413bded0bc8_1.jpg",
        category: "kids",
        description: "Perfect for school, sports, or lounging at home, our Comfortable Jogger Pants are a kid's wardrobe essential. The soft cotton blend moves with active kids while the elasticated waist with drawstring ensures a secure, adjustable fit. Features include side pockets for treasures and ribbed cuffs that stay in place. Easy pull-on style kids can manage themselves.",
        brand: "SOLARA Kids",
        sizes: ["2T", "3T", "4T", "5", "6", "7", "8", "10", "12", "14"],
        colors: ["Heather Gray", "Navy", "Black", "Olive", "Burgundy"],
        material: "60% Cotton, 40% Polyester French Terry",
        stock: 38,
        featured: false,
        status: "active",
        fit: "Relaxed Fit",
        season: "All Season",
        careInstructions: [
            "Machine wash warm",
            "Do not bleach",
            "Tumble dry medium",
            "Warm iron if needed",
            "Do not dry clean"
        ],
        tags: ["joggers", "kids", "comfortable", "school"],
        ratings: { average: 4.6, count: 189 }
    },
    {
        name: "Light-Up LED Sneakers",
        price: 850.00,
        comparePrice: 1100.00,
        image: "images/products/1W2A6997_1fc82186-029c-4dca-8b2b-bcb246902a85_3.jpg",
        category: "kids",
        description: "Watch your kids light up with joy in our Light-Up LED Sneakers! These exciting shoes feature multicolor LED lights in the sole that can be set to different modes. The rechargeable battery provides hours of glowing fun. Beyond the lights, these sneakers offer comfortable cushioning, a secure velcro closure, and a non-slip sole for safe play.",
        brand: "SOLARA Kids",
        sizes: ["10", "11", "12", "13", "1", "2", "3", "4"],
        colors: ["White/Rainbow", "Black/Rainbow", "Pink/Rainbow", "Blue/Rainbow"],
        material: "Synthetic Upper, LED-Integrated Sole, USB Rechargeable",
        stock: 22,
        featured: true,
        status: "active",
        fit: "True to Size",
        season: "All Season",
        careInstructions: [
            "Wipe clean with damp cloth",
            "Do not machine wash",
            "Do not submerge in water",
            "Charge fully before first use",
            "Remove insole for cleaning"
        ],
        tags: ["sneakers", "LED", "kids", "fun"],
        ratings: { average: 4.9, count: 312 }
    },
    {
        name: "Active Sports Shorts",
        price: 750.00,
        comparePrice: 950.00,
        image: "images/products/6_d81aa1cd-fb9c-42f8-9ee6-88c004f8c4fd_5.jpg",
        category: "kids",
        description: "Designed for active kids who love to move, our Active Sports Shorts feature moisture-wicking fabric that keeps them cool and dry during sports and play. The stretchy waistband with internal drawstring provides a comfortable, secure fit. Mesh side panels enhance breathability, while the quick-dry fabric is perfect for swimming and water play.",
        brand: "SOLARA Kids",
        sizes: ["4", "5", "6", "7", "8", "10", "12", "14"],
        colors: ["Blue", "Red", "Black", "Green", "Navy"],
        material: "92% Polyester, 8% Spandex, Moisture-Wicking",
        stock: 35,
        featured: false,
        status: "active",
        fit: "Athletic Fit",
        season: "Spring/Summer",
        careInstructions: [
            "Machine wash cold",
            "Do not bleach",
            "Tumble dry low or hang dry",
            "Do not iron",
            "Do not dry clean"
        ],
        tags: ["shorts", "sports", "kids", "active"],
        ratings: { average: 4.5, count: 145 }
    },
    {
        name: "Cozy Fleece Hoodie",
        price: 850.00,
        comparePrice: 1100.00,
        image: "images/products/1.gif",
        category: "kids",
        description: "Wrap them in comfort with our Cozy Fleece Hoodie. Super-soft fleece fabric provides warmth without weight. Features include a lined hood for extra coziness, a spacious kangaroo pocket for cold hands or treasures, and ribbed cuffs and hem that hold their shape. Easy care and durable enough for everyday adventures.",
        brand: "SOLARA Kids",
        sizes: ["2T", "3T", "4T", "5", "6", "7", "8", "10", "12", "14"],
        colors: ["Heather Gray", "Navy", "Red", "Pink", "Black", "Forest Green"],
        material: "100% Polyester Microfleece",
        stock: 40,
        featured: false,
        status: "active",
        fit: "Relaxed Fit",
        season: "Fall/Winter",
        careInstructions: [
            "Machine wash cold",
            "Do not bleach",
            "Tumble dry low",
            "Do not iron",
            "Do not dry clean"
        ],
        tags: ["hoodie", "fleece", "kids", "cozy"],
        ratings: { average: 4.7, count: 178 }
    }
];

// Admin and test users
const users = [
    {
        firstName: "Admin",
        lastName: "SOLARA",
        email: "admin@solara.com",
        password: "Admin@123",
        role: "admin",
        isActive: true,
        preferences: {
            language: "en",
            currency: "USD",
            emailNotifications: true
        }
    },
    {
        firstName: "Test",
        lastName: "Customer",
        email: "customer@test.com",
        password: "Test@123",
        role: "user",
        isActive: true,
        phone: "+1234567890",
        addresses: [{
            label: "Home",
            firstName: "Test",
            lastName: "Customer",
            street: "123 Test Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
            isDefault: true
        }],
        preferences: {
            language: "en",
            currency: "USD",
            emailNotifications: true
        }
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('\n🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        await Cart.deleteMany({});
        console.log('✅ Existing data cleared');
        
        // Seed products (one by one to generate slugs properly)
        console.log('\n📦 Seeding products...');
        let createdProducts = 0;
        for (const productData of products) {
            try {
                await Product.create(productData);
                createdProducts++;
                process.stdout.write(`\r   Created ${createdProducts}/${products.length} products`);
            } catch (err) {
                console.log(`\n   ⚠️  Error creating ${productData.name}:`, err.message);
            }
        }
        console.log(`\n✅ Created ${createdProducts} products`);

        // Create users
        console.log('\n👥 Creating users...');
        let createdUsers = 0;
        for (const userData of users) {
            try {
                await User.create(userData);
                createdUsers++;
                console.log(`   ✅ Created ${userData.role}: ${userData.email}`);
            } catch (err) {
                console.log(`   ⚠️  Error creating ${userData.email}:`, err.message);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\n📊 Summary:');
        console.log(`   Products: ${createdProducts}`);
        console.log(`   Users: ${createdUsers}`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin: admin@solara.com / Admin@123');
        console.log('   Customer: customer@test.com / Test@123');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📤 Database connection closed');
        process.exit(0);
    }
}

// Run the seed
seedDatabase();
