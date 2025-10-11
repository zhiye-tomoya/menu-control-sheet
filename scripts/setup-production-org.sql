-- Setup production organization and shop structure
-- This script creates an initial organization and shop, then assigns existing data to it

-- Create the default organization
INSERT INTO organizations (id, name, description, created_at, updated_at)
VALUES (
  'default-org',
  'メインレストラン',
  'デフォルトのレストラン組織',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create the default shop under the organization
INSERT INTO shops (id, name, description, organization_id, created_at, updated_at)
VALUES (
  'main-shop',
  'メイン店舗',
  'メインの店舗',
  'default-org',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Update all existing menus to belong to the main shop
UPDATE menus 
SET shop_id = 'main-shop'
WHERE shop_id IS NULL OR shop_id = '';

-- Update all existing ingredients to belong to the main shop
UPDATE ingredients 
SET shop_id = 'main-shop'
WHERE shop_id IS NULL OR shop_id = '';

-- Display summary
SELECT 
  'Organizations' as table_name, 
  COUNT(*) as record_count 
FROM organizations
UNION ALL
SELECT 
  'Shops' as table_name, 
  COUNT(*) as record_count 
FROM shops
UNION ALL
SELECT 
  'Menus assigned' as table_name, 
  COUNT(*) as record_count 
FROM menus 
WHERE shop_id = 'main-shop'
UNION ALL
SELECT 
  'Ingredients assigned' as table_name, 
  COUNT(*) as record_count 
FROM ingredients 
WHERE shop_id = 'main-shop';
