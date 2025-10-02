-- Migration: Convert categories to subcategories and create parent categories
-- This migration preserves all existing data

BEGIN;

-- Step 1: Create new parent categories table
CREATE TABLE IF NOT EXISTS "new_categories" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text DEFAULT '',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Step 2: Create subcategories table (will hold current category data)
CREATE TABLE IF NOT EXISTS "subcategories" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text DEFAULT '',
  "category_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "subcategories_category_id_new_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "new_categories"("id") ON DELETE no action ON UPDATE no action
);

-- Step 3: Insert default parent categories
-- You can customize these categories based on your business needs
INSERT INTO "new_categories" ("id", "name", "description", "created_at", "updated_at") VALUES
('main-dishes', 'Main Dishes', 'Primary meal items', now(), now()),
('appetizers', 'Appetizers', 'Starter items', now(), now()),
('beverages', 'Beverages', 'Drinks and refreshments', now(), now()),
('desserts', 'Desserts', 'Sweet treats', now(), now()),
('other', 'Other', 'Miscellaneous items', now(), now());

-- Step 4: Migrate existing categories to subcategories
-- Assign all existing categories to 'other' parent category by default
-- You can later reassign them to appropriate parent categories
INSERT INTO "subcategories" ("id", "name", "description", "category_id", "created_at", "updated_at")
SELECT 
  "id",
  "name", 
  "description",
  'other' as "category_id",
  "created_at",
  "updated_at"
FROM "categories";

-- Step 5: Add new column to menus table for subcategory reference
ALTER TABLE "menus" ADD COLUMN "subcategory_id" text;

-- Step 6: Update menus to reference subcategories instead of categories
UPDATE "menus" 
SET "subcategory_id" = "category_id";

-- Step 7: Add foreign key constraint for subcategory_id
ALTER TABLE "menus" 
ADD CONSTRAINT "menus_subcategory_id_subcategories_id_fk" 
FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") 
ON DELETE no action ON UPDATE no action;

-- Step 8: Make subcategory_id NOT NULL after data migration
ALTER TABLE "menus" ALTER COLUMN "subcategory_id" SET NOT NULL;

-- Step 9: Rename tables to complete the migration
-- Backup old categories table
ALTER TABLE "categories" RENAME TO "old_categories";
-- Make new categories table the active one
ALTER TABLE "new_categories" RENAME TO "categories";

-- Step 10: Drop old foreign key constraint and column from menus
ALTER TABLE "menus" DROP CONSTRAINT IF EXISTS "menus_category_id_categories_id_fk";
ALTER TABLE "menus" DROP COLUMN "category_id";

COMMIT;

-- Rollback instructions (run these commands if you need to revert):
-- BEGIN;
-- ALTER TABLE "menus" ADD COLUMN "category_id" text;
-- UPDATE "menus" SET "category_id" = "subcategory_id";
-- ALTER TABLE "menus" ALTER COLUMN "category_id" SET NOT NULL;
-- ALTER TABLE "menus" ADD CONSTRAINT "menus_category_id_old_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "old_categories"("id");
-- ALTER TABLE "menus" DROP CONSTRAINT "menus_subcategory_id_subcategories_id_fk";
-- ALTER TABLE "menus" DROP COLUMN "subcategory_id";
-- DROP TABLE "subcategories";
-- ALTER TABLE "categories" RENAME TO "temp_categories";
-- ALTER TABLE "old_categories" RENAME TO "categories";
-- DROP TABLE "temp_categories";
-- COMMIT;
