-- Migration to drop the redundant ingredients JSONB column from menus table
-- Now that we use the normalized menuIngredients table structure

ALTER TABLE menus DROP COLUMN IF EXISTS ingredients;
