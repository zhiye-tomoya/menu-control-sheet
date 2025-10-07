const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function fixDatabaseMigration() {
  console.log("🔧 Starting database migration fix...");

  try {
    // Step 1: Check what tables exist
    console.log("📋 Checking existing tables...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(
      "Existing tables:",
      tables.map((t) => t.table_name)
    );

    // Step 2: Create missing tables one by one (safer approach)

    // Create categories table if it doesn't exist
    if (!tables.some((t) => t.table_name === "categories")) {
      console.log("📝 Creating categories table...");
      await sql`
        CREATE TABLE "categories" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "description" text DEFAULT '',
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
    }

    // Create subcategories table if it doesn't exist
    if (!tables.some((t) => t.table_name === "subcategories")) {
      console.log("📝 Creating subcategories table...");
      await sql`
        CREATE TABLE "subcategories" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "description" text DEFAULT '',
          "category_id" text NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;

      // Add foreign key if categories table exists
      if (tables.some((t) => t.table_name === "categories")) {
        await sql`
          ALTER TABLE "subcategories" 
          ADD CONSTRAINT "subcategories_category_id_categories_id_fk" 
          FOREIGN KEY ("category_id") REFERENCES "categories"("id")
        `;
      }
    }

    // Create menus table if it doesn't exist
    if (!tables.some((t) => t.table_name === "menus")) {
      console.log("📝 Creating menus table...");
      await sql`
        CREATE TABLE "menus" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "image_url" text DEFAULT '',
          "category_id" text NOT NULL,
          "subcategory_id" text NOT NULL,
          "ingredients" jsonb DEFAULT '[]',
          "selling_price" numeric(10,2) NOT NULL,
          "total_cost" numeric(10,2) NOT NULL,
          "cost_rate" numeric(6,2) NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;

      // Add foreign keys
      await sql`
        ALTER TABLE "menus" 
        ADD CONSTRAINT "menus_category_id_categories_id_fk" 
        FOREIGN KEY ("category_id") REFERENCES "categories"("id")
      `;

      await sql`
        ALTER TABLE "menus" 
        ADD CONSTRAINT "menus_subcategory_id_subcategories_id_fk" 
        FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id")
      `;
    }

    // Fix foreign key constraints for menu_ingredients if it exists
    if (tables.some((t) => t.table_name === "menu_ingredients")) {
      console.log("🔗 Adding foreign key constraint to menu_ingredients...");
      try {
        await sql`
          ALTER TABLE "menu_ingredients" 
          ADD CONSTRAINT "menu_ingredients_menu_id_menus_id_fk" 
          FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE cascade
        `;
      } catch (error) {
        if (!error.message.includes("already exists")) {
          console.log("⚠️ Foreign key constraint already exists or failed:", error.message);
        }
      }
    }

    console.log("✅ Database migration fix completed successfully!");

    // Step 3: Show final status
    const finalTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(
      "🎉 Final tables:",
      finalTables.map((t) => t.table_name)
    );
  } catch (error) {
    console.error("❌ Error during migration fix:", error);
    process.exit(1);
  }
}

fixDatabaseMigration();
