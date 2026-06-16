-- Seed Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Gadgets, devices, and smart tech appliances'),
('Fashion', 'Trendy clothing, shoes, and apparel for everyone'),
('Beauty', 'Skincare, makeup, and personal care products'),
('Home & Living', 'Furniture, decor, and home improvement essentials'),
('Sports', 'Athletic gear, fitness equipment, and outdoor wear'),
('Gaming', 'Consoles, games, controllers, and accessories');

-- Seed Products
INSERT INTO products (name, description, price, stock_qty, category_id, image_url) VALUES
('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, high-fidelity sound, and 40-hour battery life.', 129.99, 50, 1, '/images/headphones.jpg'),
('Smart Watch Series X', 'Advanced smartwatch with fitness tracking, heart rate monitor, sleep analysis, and cell connectivity.', 249.00, 30, 1, '/images/smartwatch.jpg'),
('Minimalist Leather Tote Bag', 'Handcrafted genuine leather tote bag with a spacious interior and timeless design.', 89.00, 20, 2, '/images/totebag.jpg'),
('Hydrating Serum Pro Formula', 'Intense hydrating serum with hyaluronic acid and vitamin B5 for smooth, glowing skin.', 54.00, 100, 3, '/images/serum.jpg'),
('Ergonomic Gaming Chair', 'High-back gaming chair with lumbar support, adjustable armrests, and 180-degree recline.', 199.99, 15, 6, '/images/gamingchair.jpg'),
('Mechanical Keyboard Pro', 'Tenkeyless mechanical keyboard with customizable RGB lighting and tactile switches.', 79.99, 40, 6, '/images/keyboard.jpg');

-- Seed Users
-- Hashed passwords correspond to 'password123' using BCrypt
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@bazaario.com', '$2a$10$Ruyc17pD0V7kM7V0eJlyreFq07vK9M9v7Gz6a2Xm9PjW1o8XvX9kG', 'ROLE_ADMIN'),
('John Doe', 'john@gmail.com', '$2a$10$Ruyc17pD0V7kM7V0eJlyreFq07vK9M9v7Gz6a2Xm9PjW1o8XvX9kG', 'ROLE_USER');
