-- Add missing columns for multi-tenancy to existing tables
-- and migrate existing data to belong to the organization and shop

-- Add organization_id column to ingredients table
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- Add shop_id column to menus table  
ALTER TABLE menus
ADD COLUMN IF NOT EXISTS shop_id TEXT;

-- Update all existing ingredients to belong to the organization
UPDATE ingredients 
SET organization_id = 'SO7I474jUOh0dyf1w8y_C'
WHERE organization_id IS NULL;

-- Update all existing menus to belong to the shop
UPDATE menus 
SET shop_id = 'KiKYPOtl2Ff8T_Wi6Nfe3'  
WHERE shop_id IS NULL;

-- Add foreign key constraints (optional - for data integrity)
-- Note: Adding this after updating data to avoid constraint violations

-- Add foreign key constraint for ingredients.organization_id
-- ALTER TABLE ingredients 
-- ADD CONSTRAINT fk_ingredients_organization 
-- FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Add foreign key constraint for menus.shop_id  
-- ALTER TABLE menus
-- ADD CONSTRAINT fk_menus_shop
-- FOREIGN KEY (shop_id) REFERENCES shops(id);

-- Make the columns NOT NULL after updating existing data
ALTER TABLE ingredients 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE menus
ALTER COLUMN shop_id SET NOT NULL;
