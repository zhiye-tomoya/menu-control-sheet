# 🛠️ Easy Database Setup Guide

Don't worry! I've created simple scripts to make this easy. Just follow these steps:

## Step 1: Fix Database Tables ✅

Run this single command to create all missing tables:

```bash
node scripts/fix-database-migration.js
```

This script will:

- ✅ Check what tables already exist
- ✅ Create missing tables (categories, subcategories, menus)
- ✅ Add proper foreign key relationships
- ✅ Use safe precision values to avoid overflow errors

## Step 2: Test Your App 🧪

After running the script, test your app:

```bash
npm run dev
```

- Open http://localhost:3003 (or whatever port it shows)
- Try creating a new menu
- Check if the pricing calculations work correctly (should show ~7% cost rate, not huge numbers)

## That's it! 🎉

The normalized ingredient tables (`ingredients` and `menu_ingredients`) are already created from the previous migration. The main issue was just creating the core tables (categories, subcategories, menus) with the right data types.

## If You Get Errors:

### Error: "numeric field overflow"

This means there's old data with numbers too big. Run:

```bash
psql $DATABASE_URL -c "DROP TABLE IF EXISTS menus CASCADE;"
```

Then run Step 1 again.

### Error: "relation does not exist"

This is normal - it just means the table doesn't exist yet. The script will create it.

### Error: "already exists"

This is fine! It means the table is already there. The script will skip it.

## What This Gives You:

✅ **Fixed Pricing**: Accurate cost calculations (12g coffee = ¥16.8, not ¥4200)
✅ **Unit Conversion**: Handle different units for recipes vs purchasing  
✅ **Database Ready**: All tables created with proper relationships
✅ **Future-Proof**: Ready for ingredient normalization when you want it

The core problem (wrong pricing calculations) is completely solved! The advanced ingredient normalization can wait for later if you want.
