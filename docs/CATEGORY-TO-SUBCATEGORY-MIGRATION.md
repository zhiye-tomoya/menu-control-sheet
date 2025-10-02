# Category to Subcategory Migration Guide

## Overview

This migration transforms your existing single-level category system into a hierarchical two-level system:

- **Parent Categories**: Main groupings (e.g., "Main Dishes", "Beverages", "Desserts")
- **Subcategories**: Your existing categories become subcategories under parent categories

## ✅ Data Safety Guarantee

**Your existing data will NOT be lost!** This migration:

- ✅ Preserves all existing categories (they become subcategories)
- ✅ Maintains all menu-category relationships
- ✅ Keeps all menu data intact
- ✅ Creates backups before making changes
- ✅ Provides rollback instructions

## What Changes

### Before Migration

```
categories
├── Coffee Drinks
├── Pastries
├── Sandwiches
└── ...

menus
├── Menu 1 → Coffee Drinks
├── Menu 2 → Pastries
└── ...
```

### After Migration

```
categories (parent)
├── Main Dishes
├── Appetizers
├── Beverages
├── Desserts
└── Other

subcategories
├── Coffee Drinks → Other
├── Pastries → Other
├── Sandwiches → Other
└── ...

menus
├── Menu 1 → Coffee Drinks (subcategory)
├── Menu 2 → Pastries (subcategory)
└── ...
```

## How to Run Migration

### Prerequisites

1. **Backup your database** (the script will also create a backup)
2. Ensure your database is running and accessible
3. Make sure `psql` is installed for database operations
4. Verify your `DATABASE_URL` is correctly set in `.env`

### Step 1: Review the Changes

First, examine what will happen:

```bash
# Review the migration plan
cat docs/category-migration-plan.md

# Check the SQL migration script
cat drizzle/migration-001-category-restructure.sql
```

### Step 2: Run the Migration

```bash
npm run migrate:subcategories
```

The script will:

1. ✅ Test database connectivity
2. 💾 Create a backup of your existing data
3. 🔄 Execute the migration safely
4. 📊 Show you a summary of changes

### Step 3: Verify Results

After migration, check your data:

```bash
# Open database studio to inspect the new structure
npm run db:studio
```

You should see:

- `categories` table with parent categories
- `subcategories` table with your old categories
- `menus` table now references `subcategory_id`
- `old_categories` table as backup

## Post-Migration Steps

### 1. Reassign Subcategories

By default, all your existing categories become subcategories under "Other". You may want to reorganize them:

1. Open your application
2. Edit subcategories to assign them to appropriate parent categories
3. For example:
   - "Coffee" → "Beverages"
   - "Pasta" → "Main Dishes"
   - "Cake" → "Desserts"

### 2. Customize Parent Categories

The migration creates default parent categories. You can:

- Rename them to match your business
- Add new parent categories
- Update descriptions

### 3. Test Your Application

1. Start your development server: `npm run dev`
2. Verify all menus display correctly
3. Test creating new menus
4. Test editing existing menus

## Rollback Instructions

If something goes wrong, you can rollback:

### Option 1: Using Backup File

```bash
# Find your backup file
ls backup-categories-*.sql

# Restore from backup (replace with your backup filename)
psql $DATABASE_URL < backup-categories-2024-01-10.sql
```

### Option 2: Using Migration Rollback

The migration file contains rollback commands at the bottom. Execute them:

```bash
# Edit the migration file and uncomment the rollback section
# Then run the rollback commands manually via psql
```

## Files Changed

### Database Schema

- `lib/db/schema.ts` - Added `subcategories` table, updated relationships
- `drizzle/migration-001-category-restructure.sql` - Migration SQL

### API Endpoints

- `app/api/subcategories/route.ts` - New subcategory API
- `app/api/subcategories/[id]/route.ts` - Subcategory CRUD operations
- `app/api/menus/route.ts` - Updated to use subcategories
- `app/api/menus/[id]/route.ts` - Updated field references

### Frontend Components

- `components/menu-control-sheet.tsx` - Uses subcategoryId instead of categoryId
- `components/menu-list.tsx` - Updated to group by subcategories
- `lib/types.ts` - Added Subcategory interface

### Scripts & Documentation

- `scripts/migrate-to-subcategories.js` - Migration execution script
- `docs/category-migration-plan.md` - Migration strategy
- `package.json` - Added migration script command

## FAQ

### Q: Will this break my application?

**A**: No, all data is preserved and the application code is updated to work with the new structure.

### Q: Can I undo this migration?

**A**: Yes, rollback instructions are provided and a backup is created automatically.

### Q: What happens to my existing menu data?

**A**: All menus remain exactly the same, they just reference subcategories instead of categories.

### Q: Do I need to update my category management?

**A**: The existing category interfaces now manage subcategories. You'll see them organized under parent categories.

### Q: Can I customize the parent categories?

**A**: Yes, you can rename, add, or remove parent categories after migration.

## Support

If you encounter issues:

1. **Check the logs** from the migration script
2. **Verify database connectivity** with `npm run db:studio`
3. **Review the backup file** to ensure data is safe
4. **Test with a small dataset first** if you're unsure

## Technical Details

### Database Changes

- New `categories` table for parent categories
- New `subcategories` table (contains old category data)
- `menus.categoryId` → `menus.subcategoryId`
- Old `categories` table renamed to `old_categories`

### Application Changes

- TypeScript interfaces updated for type safety
- API endpoints handle the new structure
- Components work with hierarchical categories
- All existing functionality preserved

---

**Remember**: This migration is designed to be safe and reversible. Your data is precious, and we've taken every precaution to protect it! 🛡️
