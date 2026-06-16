-- Add indexes to products table for optimizing catalog query performance
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(name);
