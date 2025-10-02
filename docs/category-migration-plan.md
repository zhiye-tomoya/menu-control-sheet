# Category to Subcategory Migration Plan

## Overview

We need to restructure the database to convert existing categories into subcategories while creating a new parent category system. This migration will preserve all existing data.

## Migration Strategy

### Step 1: Create New Tables

1. Keep the existing `categories` table temporarily (rename to `old_categories`)
2. Create new `categories` table for parent categories
3. Create new `subcategories` table (will contain current category data)
4. Update `menus` table to reference subcategories instead of categories

### Step 2: Data Migration

1. Create default parent categories (or ask user to define them)
2. Migrate existing category data to the new `subcategories` table
3. Assign subcategories to appropriate parent categories
4. Update menu references from categoryId to subcategoryId

### Step 3: Clean Up

1. Verify all data is correctly migrated
2. Remove old tables
3. Update all application code

## No Data Loss Guarantee

- All existing categories will become subcategories
- All menu-category relationships will be preserved
- All category names, descriptions, and timestamps will be maintained
- Rollback strategy available if needed

## Timeline

1. **Phase 1**: Create new schema alongside existing (no data changes)
2. **Phase 2**: Migrate data safely
3. **Phase 3**: Update application code
4. **Phase 4**: Clean up old tables

This approach ensures zero data loss and allows for rollback at any stage.
