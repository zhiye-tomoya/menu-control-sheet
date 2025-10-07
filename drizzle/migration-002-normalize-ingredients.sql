-- Migration: Normalize ingredients from JSON to separate tables
-- This migration extracts ingredients from menus.ingredients JSON into separate tables

-- Create ingredients table
CREATE TABLE IF NOT EXISTS "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"default_unit" text NOT NULL,
	"pricing_unit" text NOT NULL,
	"conversion_factor" numeric(10,3) NOT NULL,
	"current_price" numeric(10,2) NOT NULL,
	"category" text DEFAULT '',
	"description" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create menu_ingredients junction table
CREATE TABLE IF NOT EXISTS "menu_ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_id" text NOT NULL,
	"ingredient_id" text NOT NULL,
	"quantity" numeric(10,3) NOT NULL,
	"calculated_cost" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Function to extract and normalize ingredients from existing menu data
DO $$
DECLARE
    menu_record RECORD;
    ingredient_json jsonb;
    ingredient_record jsonb;
    ingredient_id text;
    menu_ingredient_id text;
    existing_ingredient_id text;
BEGIN
    -- Loop through all menus with ingredients
    FOR menu_record IN SELECT id, ingredients FROM menus WHERE ingredients IS NOT NULL LOOP
        -- Loop through each ingredient in the JSON array
        FOR ingredient_record IN SELECT * FROM jsonb_array_elements(menu_record.ingredients) LOOP
            -- Check if this ingredient already exists (by name, unit, pricing_unit, conversion_factor)
            SELECT id INTO existing_ingredient_id 
            FROM ingredients 
            WHERE name = (ingredient_record->>'name')
              AND default_unit = COALESCE(ingredient_record->>'unit', 'g')
              AND pricing_unit = COALESCE(ingredient_record->>'pricingUnit', COALESCE(ingredient_record->>'unit', 'g'))
              AND conversion_factor = COALESCE((ingredient_record->>'conversionFactor')::numeric, 1)
            LIMIT 1;
            
            -- If ingredient doesn't exist, create it
            IF existing_ingredient_id IS NULL THEN
                ingredient_id := 'ing_' || substr(md5(random()::text), 1, 16);
                
                INSERT INTO ingredients (
                    id,
                    name,
                    default_unit,
                    pricing_unit,
                    conversion_factor,
                    current_price,
                    category,
                    description
                ) VALUES (
                    ingredient_id,
                    ingredient_record->>'name',
                    COALESCE(ingredient_record->>'unit', 'g'),
                    COALESCE(ingredient_record->>'pricingUnit', COALESCE(ingredient_record->>'unit', 'g')),
                    COALESCE((ingredient_record->>'conversionFactor')::numeric, 1),
                    COALESCE((ingredient_record->>'unitPrice')::numeric, 0),
                    '',
                    ''
                );
            ELSE
                ingredient_id := existing_ingredient_id;
            END IF;
            
            -- Create menu_ingredient record
            menu_ingredient_id := 'mi_' || substr(md5(random()::text), 1, 16);
            
            INSERT INTO menu_ingredients (
                id,
                menu_id,
                ingredient_id,
                quantity,
                calculated_cost
            ) VALUES (
                menu_ingredient_id,
                menu_record.id,
                ingredient_id,
                COALESCE((ingredient_record->>'quantity')::numeric, 0),
                COALESCE((ingredient_record->>'totalPrice')::numeric, 0)
            );
        END LOOP;
    END LOOP;
END $$;

-- Remove ingredients column from menus table (commented out for safety)
-- ALTER TABLE menus DROP COLUMN IF EXISTS ingredients;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS "idx_menu_ingredients_menu_id" ON "menu_ingredients" ("menu_id");
CREATE INDEX IF NOT EXISTS "idx_menu_ingredients_ingredient_id" ON "menu_ingredients" ("ingredient_id");
CREATE INDEX IF NOT EXISTS "idx_ingredients_name" ON "ingredients" ("name");
