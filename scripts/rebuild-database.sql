-- Complete database rebuild script
-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS menu_ingredients CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

-- Create categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create subcategories table
CREATE TABLE subcategories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category_id TEXT NOT NULL REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create ingredients table
CREATE TABLE ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    default_unit TEXT NOT NULL,
    pricing_unit TEXT NOT NULL,
    conversion_factor DECIMAL(10, 3) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    category TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create menus table
CREATE TABLE menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    category_id TEXT NOT NULL REFERENCES categories(id),
    subcategory_id TEXT NOT NULL REFERENCES subcategories(id),
    selling_price DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    cost_rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create menu_ingredients table
CREATE TABLE menu_ingredients (
    id TEXT PRIMARY KEY,
    menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
    quantity DECIMAL(10, 3) NOT NULL,
    calculated_cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default categories
INSERT INTO categories (id, name, description) VALUES 
('appetizers', 'Appetizers', 'Starter dishes'),
('main-dishes', 'Main Dishes', 'Main course items'),
('desserts', 'Desserts', 'Sweet treats'),
('beverages', 'Beverages', 'Drinks'),
('other', 'Other', 'Other items');

-- Insert default subcategories
INSERT INTO subcategories (id, name, description, category_id) VALUES 
('appetizers-default', 'デフォルト', 'Default appetizers subcategory', 'appetizers'),
('main-dishes-default', 'デフォルト', 'Default main dishes subcategory', 'main-dishes'),
('desserts-default', 'デフォルト', 'Default desserts subcategory', 'desserts'),
('beverages-default', 'デフォルト', 'Default beverages subcategory', 'beverages'),
('other-default', 'デフォルト', 'Default other subcategory', 'other');
