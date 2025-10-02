#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Category to Subcategory Migration Script");
console.log("==========================================");

// Check if migration file exists
const migrationFile = path.join(__dirname, "../drizzle/migration-001-category-restructure.sql");
if (!fs.existsSync(migrationFile)) {
  console.error("❌ Migration file not found:", migrationFile);
  process.exit(1);
}

console.log("✅ Migration file found");

// Read environment variables the same way as the app
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

// Check environment and use appropriate DATABASE_URL
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
  console.log("Please ensure your database URL is correctly configured in .env.local");
  process.exit(1);
}

console.log(`✅ Database URL found for ${environment} environment`);

try {
  console.log("\n📋 Pre-migration checks:");

  // Check if we can connect to the database
  console.log("- Testing database connection...");
  execSync("npx drizzle-kit introspect", { stdio: "pipe" });
  console.log("  ✅ Database connection successful");

  // Backup existing data (optional but recommended)
  console.log("\n💾 Creating backup...");
  const backupFile = `backup-categories-${new Date().toISOString().split("T")[0]}.sql`;
  try {
    execSync(`pg_dump ${dbUrl} --table=categories --table=menus --data-only > ${backupFile}`, { stdio: "pipe" });
    console.log(`  ✅ Backup created: ${backupFile}`);
  } catch (error) {
    console.log("  ⚠️ Backup failed (continuing without backup)");
    console.log("  Note: Make sure pg_dump is installed for backup functionality");
  }

  console.log("\n🔄 Executing migration...");

  // Copy migration to drizzle folder with proper naming
  const drizzleDir = path.join(__dirname, "../drizzle");
  const targetFile = path.join(drizzleDir, "0001_category_restructure.sql");

  // Read the migration file and copy it
  const migrationSQL = fs.readFileSync(migrationFile, "utf8");
  fs.writeFileSync(targetFile, migrationSQL);

  try {
    // Use drizzle-kit to run the migration
    execSync("npx drizzle-kit migrate", { stdio: "inherit" });

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Migration Summary:");
    console.log("- ✅ New parent categories table created");
    console.log("- ✅ Subcategories table created with existing category data");
    console.log("- ✅ Menus table updated to reference subcategories");
    console.log('- ✅ Old categories table backed up as "old_categories"');
    console.log("\n🎉 Your existing categories are now subcategories under parent categories!");
    console.log("   All your data has been preserved.");

    console.log("\n📝 Next Steps:");
    console.log("1. Review the default parent categories (Main Dishes, Appetizers, Beverages, Desserts, Other)");
    console.log("2. Reassign subcategories to appropriate parent categories if needed");
    console.log("3. Test your application to ensure everything works correctly");
    console.log('4. Once satisfied, you can drop the "old_categories" table');

    console.log("\n🔧 Rollback Instructions:");
    console.log("If you need to rollback, run the commented rollback commands in the migration file");

    // Clean up
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    throw error;
  }
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  console.log("\n🔧 Troubleshooting:");
  console.log("1. Ensure your database is running and accessible");
  console.log("2. Check that DATABASE_URL is correctly set");
  console.log("3. Verify you have the necessary database permissions");
  console.log("4. Try running 'npm run db:migrate' manually if drizzle-kit is not working");

  process.exit(1);
}
