#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Import the database connection
const { neon } = require("@neondatabase/serverless");

console.log("🚀 Simple Category to Subcategory Migration");
console.log("============================================");

async function runMigration() {
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

    if (!dbUrl) {
      console.error("❌ Database URL not found");
      console.log(`Environment: ${environment || "unknown"}`);
      process.exit(1);
    }

    console.log(`✅ Database URL found for ${environment} environment`);

    // Read the migration SQL
    const migrationFile = path.join(__dirname, "simple-migration.sql");
    const migrationSQL = fs.readFileSync(migrationFile, "utf8");

    console.log("📋 Executing migration...");

    // Create database connection
    const sql = neon(dbUrl);

    // Execute migration step by step
    console.log("Step 1: Renaming categories table to subcategories...");
    await sql`ALTER TABLE categories RENAME TO subcategories`;

    console.log("Step 2: Adding category_id column to subcategories...");
    await sql`ALTER TABLE subcategories ADD COLUMN category_id text`;

    console.log("Step 3: Creating new categories table...");
    await sql`CREATE TABLE categories (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      description text DEFAULT '',
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )`;

    console.log("Step 4: Inserting default parent categories...");
    await sql`INSERT INTO categories (id, name, description) VALUES
      ('main-dishes', 'Main Dishes', 'Primary meal items'),
      ('appetizers', 'Appetizers', 'Starter items'),  
      ('beverages', 'Beverages', 'Drinks and refreshments'),
      ('desserts', 'Desserts', 'Sweet treats'),
      ('other', 'Other', 'Miscellaneous items')`;

    console.log("Step 5: Assigning subcategories to 'other' parent category...");
    await sql`UPDATE subcategories SET category_id = 'other'`;

    console.log("Step 6: Making category_id NOT NULL...");
    await sql`ALTER TABLE subcategories ALTER COLUMN category_id SET NOT NULL`;

    console.log("Step 7: Adding foreign key constraint to subcategories...");
    await sql`ALTER TABLE subcategories 
      ADD CONSTRAINT subcategories_category_id_categories_id_fk 
      FOREIGN KEY (category_id) REFERENCES categories(id)`;

    console.log("Step 8: Renaming column in menus table...");
    await sql`ALTER TABLE menus RENAME COLUMN category_id TO subcategory_id`;

    console.log("Step 9: Updating foreign key constraint in menus table...");
    await sql`ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_category_id_categories_id_fk`;
    await sql`ALTER TABLE menus 
      ADD CONSTRAINT menus_subcategory_id_subcategories_id_fk 
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)`;

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Verifying migration results...");

    // Verify the migration
    const categoryCount = await sql`SELECT count(*) as count FROM categories`;
    const subcategoryCount = await sql`SELECT count(*) as count FROM subcategories`;
    const menuCount = await sql`SELECT count(*) as count FROM menus`;

    console.log(`- Categories count: ${categoryCount[0].count}`);
    console.log(`- Subcategories count: ${subcategoryCount[0].count}`);
    console.log(`- Menus count: ${menuCount[0].count}`);

    console.log("\n🎉 Your existing categories are now subcategories!");
    console.log("📝 Next Steps:");
    console.log("1. Start your application: npm run dev");
    console.log("2. Verify your menus display correctly");
    console.log("3. Reassign subcategories to appropriate parent categories if needed");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure your database is running and accessible");
    console.log("2. Check that your database URL is correct");
    console.log("3. Verify you have the necessary database permissions");
    process.exit(1);
  }
}

runMigration();
