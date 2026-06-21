package com.ecommerce.bazaario.initializer;

import com.ecommerce.bazaario.entity.Category;
import com.ecommerce.bazaario.entity.Product;
import com.ecommerce.bazaario.repository.*;
import com.github.javafaker.Faker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private final Random random = new Random();

    private static final String[] ELECTRONICS_IMAGES = {
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551645121-d1034da75057?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&auto=format&fit=crop&q=80"
    };

    private static final String[] FASHION_IMAGES = {
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80"
    };

    private static final String[] BEAUTY_IMAGES = {
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=500&auto=format&fit=crop&q=80"
    };

    private static final String[] HOME_LIVING_IMAGES = {
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=80"
    };

    private static final String[] SPORTS_IMAGES = {
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1594470117754-e347c2b9fc7c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=500&auto=format&fit=crop&q=80"
    };

    private static final String[] GAMING_IMAGES = {
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548685913-fe6574340a49?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80"
    };

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking database catalog status...");

        long currentCount = productRepository.count();
        boolean alreadyCustomSeeded = false;
        if (currentCount > 0) {
            boolean hasHighPrices = productRepository.findAll().stream()
                    .anyMatch(p -> p.getPrice().doubleValue() > 1000.0);
            alreadyCustomSeeded = hasHighPrices;
        }

        if (currentCount >= 5000 && alreadyCustomSeeded) {
            System.out.println("Database catalog already seeded with " + currentCount + " products. Skipping initialization.");
            return;
        }

        System.out.println("Cleaning database catalog tables for initial seed...");
        cartItemRepository.deleteAll();
        orderItemRepository.deleteAll();
        reviewRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        System.out.println("Initializing categories...");
        List<Category> categories = new ArrayList<>();
        String[] categoryNames = {"Electronics", "Fashion", "Beauty", "Home & Living", "Sports", "Gaming"};
        String[] categoryDescriptions = {
            "Gadgets, devices, and smart tech appliances",
            "Trendy clothing, shoes, and apparel for everyone",
            "Skincare, makeup, and personal care products",
            "Furniture, decor, and home improvement essentials",
            "Athletic gear, fitness equipment, and outdoor wear",
            "Consoles, games, controllers, and accessories"
        };

        for (int i = 0; i < categoryNames.length; i++) {
            Category cat = new Category();
            cat.setName(categoryNames[i]);
            cat.setDescription(categoryDescriptions[i]);
            categories.add(categoryRepository.save(cat));
        }

        System.out.println("Generating 5000 products using Faker...");
        Faker faker = new Faker();
        List<Product> productsToSave = new ArrayList<>();

        int categoriesCount = categories.size();

        for (int i = 0; i < categoriesCount; i++) {
            Category cat = categories.get(i);
            int countForCategory = (i == categoriesCount - 1) ? 835 : 833; // 833 * 5 + 835 = 5000
            String[] imageUrls = getImagesForCategory(cat.getName());

            for (int j = 0; j < countForCategory; j++) {
                Product p = new Product();
                p.setName(generateProductName(cat.getName(), j, faker));
                p.setDescription(generateProductDescription(cat.getName(), p.getName()));

                // Convert price to INR (~83.0 exchange rate)
                double basePriceVal = 9.99 + (140.00 * random.nextDouble());
                double priceVal = basePriceVal * 83.0;
                p.setPrice(BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP));
                p.setStockQty(random.nextInt(120) + 10);
                p.setCategory(cat);

                String imgUrl = imageUrls[j % imageUrls.length];
                p.setImageUrl(imgUrl);

                productsToSave.add(p);

                if (productsToSave.size() >= 50) {
                    productRepository.saveAll(productsToSave);
                    productsToSave.clear();
                }
            }
        }

        if (!productsToSave.isEmpty()) {
            productRepository.saveAll(productsToSave);
            productsToSave.clear();
        }

        System.out.println("Database catalog seeded successfully with " + productRepository.count() + " products!");
    }

    private String[] getImagesForCategory(String categoryName) {
        switch (categoryName) {
            case "Electronics": return ELECTRONICS_IMAGES;
            case "Fashion": return FASHION_IMAGES;
            case "Beauty": return BEAUTY_IMAGES;
            case "Home & Living": return HOME_LIVING_IMAGES;
            case "Sports": return SPORTS_IMAGES;
            case "Gaming": return GAMING_IMAGES;
            default: return ELECTRONICS_IMAGES;
        }
    }

    private String generateProductName(String categoryName, int index, Faker faker) {
        String[] prefixes;
        String[] suffixes;
        String item;

        switch (categoryName) {
            case "Electronics":
                prefixes = new String[]{"Pro", "Ultra-Slim", "Smart", "NextGen", "Wireless", "Premium", "Elite", "Quantum"};
                suffixes = new String[]{"Hub", "Connect", "X1", "Max", "Air", "Link", "Plus"};
                item = new String[]{
                    "Wireless Headphones", 
                    "Smart Watch Pro", 
                    "Wireless Charger", 
                    "Studio Headphones", 
                    "Macbook Laptop", 
                    "Professional Monitor", 
                    "Slim Laptop", 
                    "Tablet Pro", 
                    "Desktop Screen", 
                    "Office Monitor"
                }[index % 10];
                break;
            case "Fashion":
                prefixes = new String[]{"Classic", "Slim-Fit", "Designer", "Urban", "Casual", "Luxury", "Minimalist", "Vintage"};
                suffixes = new String[]{"Tee", "Jacket", "Denim", "Sneakers", "Boots", "Belt", "Coat", "Cardigan"};
                item = new String[]{
                    "Casual Leather Shoes", 
                    "Denim Jacket", 
                    "Luxury Handbag", 
                    "Summer Dress", 
                    "Winter Trench Coat", 
                    "Cotton Summer Skirt", 
                    "Silk Dress", 
                    "Slim Fit Blazer", 
                    "Casual Tee", 
                    "Knit Sweater"
                }[index % 10];
                break;
            case "Beauty":
                prefixes = new String[]{"Hydrating", "Organic", "Natural", "Revitalizing", "Pure Glow", "Anti-Aging", "Botanical", "Silky"};
                suffixes = new String[]{"Serum", "Elixir", "Cream", "Balm", "Lotion", "Mist", "Oil"};
                item = new String[]{
                    "Makeup Brush Set", 
                    "Hydrating Face Serum", 
                    "Organic Cleansing Oil", 
                    "Revitalizing Moisturizer", 
                    "Mud Clay Mask", 
                    "Hyaluronic Serum", 
                    "Lip Gloss Balm", 
                    "Anti-Aging Night Cream", 
                    "Moisturizing Body Lotion", 
                    "Botanical Essential Oil"
                }[index % 10];
                break;
            case "Home & Living":
                prefixes = new String[]{"Ergonomic", "Minimalist", "Modern", "Handcrafted", "Rustic", "Cozy", "Aesthetic", "Premium"};
                suffixes = new String[]{"Decor", "Comfort", "Style", "Living", "Space"};
                item = new String[]{
                    "Cozy Sofa Cushion", 
                    "Wooden Coffee Table", 
                    "Cozy Bed Blanket", 
                    "Modern Desk Organizer", 
                    "Minimalist Wall Frame", 
                    "Ergonomic Office Chair", 
                    "Aesthetic Floor Lamp", 
                    "Cotton Duvet Cover", 
                    "Decorative Wall Mirror", 
                    "Scented Soy Candle"
                }[index % 10];
                break;
            case "Sports":
                prefixes = new String[]{"High-Performance", "All-Weather", "Pro-Fitness", "Heavy-Duty", "Active", "Endurance", "Therma", "Flex"};
                suffixes = new String[]{"Gear", "Fit", "Pro", "Shield", "Pulse"};
                item = new String[]{
                    "Gym Dumbbells", 
                    "Sports Water Bottle", 
                    "Athletic Running Shoes", 
                    "Breathable Sports Tee", 
                    "Heavy-Duty Dumbbell", 
                    "Anti-Slip Yoga Mat", 
                    "Speed Jump Rope", 
                    "Fitness Resistance Bands", 
                    "Sports Gym Bag", 
                    "Outdoor Fitness Gear"
                }[index % 10];
                break;
            case "Gaming":
                prefixes = new String[]{"Mechanical", "RGB", "Wireless", "Pro-Gamer", "Ultra-Responsive", "Precision", "Immersive", "Stealth"};
                suffixes = new String[]{"Edition", "Pro", "Series", "X", "Apex"};
                item = new String[]{
                    "Anime Custom Keycap Set", 
                    "Wireless Gaming Controller", 
                    "Mechanical Keyboard", 
                    "Precision Joystick", 
                    "Classic Console Dock", 
                    "Immersive Gaming Headset", 
                    "RGB Gaming Mouse", 
                    "Pro-Gamer Console Dock", 
                    "VR Headset", 
                    "RGB Extended Mouse Pad"
                }[index % 10];
                break;
            default:
                prefixes = new String[]{"Premium"};
                suffixes = new String[]{"Special"};
                item = "Item";
        }

        String prefix = prefixes[index % prefixes.length];
        String suffix = suffixes[faker.random().nextInt(suffixes.length)];
        return prefix + " " + item + " " + suffix;
    }

    private String generateProductDescription(String categoryName, String productName) {
        String base = "This high-quality " + productName + " is designed to deliver outstanding performance and exceptional utility. ";
        switch (categoryName) {
            case "Electronics":
                return base + "Featuring cutting-edge smart connectivity, ultra-low latency, and advanced power management to keep your workflow seamless. Built with robust, heat-resistant components that ensure long-lasting durability for daily intensive tasks.";
            case "Fashion":
                return base + "Crafted from premium, breathable organic materials that offer a perfect blend of modern fashion aesthetics and everyday comfort. Designed with precision stitching and a versatile silhouette suitable for both casual outings and evening gatherings.";
            case "Beauty":
                return base + "Formulated with pure, skin-loving botanical ingredients and essential minerals to nourish and revitalize your natural glow. Safe for all skin types, dermatologically tested, and free from harmful parabens or synthetic additives.";
            case "Home & Living":
                return base + "Designed to elevate your indoor living space with modern minimalist aesthetics and structural stability. Built using sustainably sourced materials, offering functional storage and space-saving ergonomics to complement any decor.";
            case "Sports":
                return base + "Engineered for maximum athletic endurance and impact resistance under demanding weather conditions. Features slip-resistant grips and moisture-wicking technology to help you push your limits during intense workout sessions.";
            case "Gaming":
                return base + "Optimized for competitive esports gameplay with ultra-responsive mechanical switches, customizable dynamic RGB lighting, and tactile control. Ergonomically designed to reduce strain during extended, high-intensity gaming sessions.";
            default:
                return base + "Crafted to meet the highest standards of reliability, safety, and modern design. Ideal for adding value and premium comfort to your daily routines.";
        }
    }
}
