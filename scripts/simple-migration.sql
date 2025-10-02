-- Simple migration to convert categories to subcategories
-- This preserves all existing data

BEGIN;

-- Step 1: Rename existing categories table to subcategories
ALTER TABLE categories RENAME TO subcategories;

-- Step 2: Add categoryId column to subcategories (will be populated later)
ALTER TABLE subcategories ADD COLUMN category_id text;

-- Step 3: Create new categories table for parent categories
CREATE TABLE categories (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Step 4: Insert default parent categories
INSERT INTO categories (id, name, description) VALUES
('main-dishes', 'Main Dishes', 'Primary meal items'),
('appetizers', 'Appetizers', 'Starter items'),  
('beverages', 'Beverages', 'Drinks and refreshments'),
('desserts', 'Desserts', 'Sweet treats'),
('other', 'Other', 'Miscellaneous items');

-- Step 5: Assign all existing subcategories to 'other' parent category
UPDATE subcategories SET category_id = 'other';

-- Step 6: Make category_id NOT NULL
ALTER TABLE subcategories ALTER COLUMN category_id SET NOT NULL;

-- Step 7: Add foreign key constraint
ALTER TABLE subcategories 
ADD CONSTRAINT subcategories_category_id_categories_id_fk 
FOREIGN KEY (category_id) REFERENCES categories(id);

-- Step 8: Rename column in menus table
ALTER TABLE menus RENAME COLUMN category_id TO subcategory_id;

-- Step 9: Update foreign key constraint in menus table
ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_category_id_categories_id_fk;
ALTER TABLE menus 
ADD CONSTRAINT menus_subcategory_id_subcategories_id_fk 
FOREIGN KEY (subcategory_id) REFERENCES subcategories(id);

COMMIT;

-- Verify the migration
SELECT 'Categories count:' as info, count(*) as count FROM categories
UNION ALL
SELECT 'Subcategories count:' as info, count(*) as count FROM subcategories  
UNION ALL
SELECT 'Menus count:' as info, count(*) as count FROM menus;
