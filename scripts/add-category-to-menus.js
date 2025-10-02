#!/usr/bin/env node
const { neon } = require("@neondatabase/serverless");

console.log("🔧 Adding category_id to menus table");
console.log("====================================");

async function addCategoryToMenus() {
  try {
    // Load environment variables
    require("dotenv").config({ path: ".env" });
    require("dotenv").config({ path: ".env.local", override: true });

    // Get database URL
    const environment = process.env.ENVIRONMENT;
    let dbUrl;

    if (environment === "development") {
      dbUrl = process.env.DEV_DATABASE_URL;
    } else if (environment === "production") {
      dbUrl = process.env.PROD_DATABASE_URL;
    } else {
      dbUrl = process.env.DATABASE_URL;
    }

    console.log(`✅ Connected to ${environment} database`);

    // Create database connection
    const sql = neon(dbUrl);

    console.log("📋 Current menus table structure...");

    // Check if category_id already exists
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'menus' 
      ORDER BY ordinal_position
    `;

    console.log("Current columns in menus table:");
    columns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    const hasCategoryId = columns.find((col) => col.column_name === "category_id");

    if (hasCategoryId) {
      console.log("\n⚠️ category_id column already exists in menus table");
      return;
    }

    console.log("\n🔧 Adding category_id column to menus table...");

    // Step 1: Add category_id column
    await sql`ALTER TABLE menus ADD COLUMN category_id text`;

    // Step 2: Populate category_id based on subcategory relationship
    console.log("📊 Populating category_id from subcategory relationships...");

    const updateResult = await sql`
      UPDATE menus 
      SET category_id = subcategories.category_id 
      FROM subcategories 
      WHERE menus.subcategory_id = subcategories.id
    `;

    console.log(`✅ Updated ${updateResult.length || "all"} menu records`);

    // Step 3: Make category_id NOT NULL
    console.log("🔒 Making category_id NOT NULL...");
    await sql`ALTER TABLE menus ALTER COLUMN category_id SET NOT NULL`;

    // Step 4: Add foreign key constraint
    console.log("🔗 Adding foreign key constraint...");
    await sql`ALTER TABLE menus 
      ADD CONSTRAINT menus_category_id_categories_id_fk 
      FOREIGN KEY (category_id) REFERENCES categories(id)`;

    console.log("\n✅ Successfully added category_id to menus table!");

    // Step 5: Verify the results
    console.log("\n📊 Verification:");
    const menuData = await sql`
      SELECT 
        m.id, 
        m.name,
        c.name as category_name,
        s.name as subcategory_name
      FROM menus m
      JOIN categories c ON m.category_id = c.id
      JOIN subcategories s ON m.subcategory_id = s.id
      LIMIT 5
    `;

    console.log("Sample menu data with categories:");
    menuData.forEach((menu) => {
      console.log(`  - ${menu.name} → ${menu.category_name} > ${menu.subcategory_name}`);
    });

    const counts = await sql`
      SELECT 
        c.name as category,
        COUNT(m.id) as menu_count
      FROM categories c
      LEFT JOIN menus m ON c.id = m.category_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;

    console.log("\nMenus per parent category:");
    counts.forEach((row) => {
      console.log(`  - ${row.category}: ${row.menu_count} menus`);
    });

    console.log("\n🎉 Menus table now has both category_id and subcategory_id!");
  } catch (error) {
    console.error("\n❌ Failed to add category_id:", error.message);
    process.exit(1);
  }
}

addCategoryToMenus();
