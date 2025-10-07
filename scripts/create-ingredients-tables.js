require("dotenv").config();
require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");

async function createIngredientsTables() {
  console.log("🚀 Creating Ingredients Tables");
  console.log("===============================");

  const sql = neon(process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.log("❌ DATABASE_URL not found");
    process.exit(1);
  }

  console.log("✅ Database URL found for production environment");
  console.log("📋 Creating ingredients tables...");

  try {
    // Create ingredients table
    await sql`
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
    `;
    console.log("✅ Created ingredients table");

    // Create menu_ingredients junction table
    await sql`
      CREATE TABLE IF NOT EXISTS "menu_ingredients" (
        "id" text PRIMARY KEY NOT NULL,
        "menu_id" text NOT NULL,
        "ingredient_id" text NOT NULL,
        "quantity" numeric(10,3) NOT NULL,
        "calculated_cost" numeric(10,2) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created menu_ingredients table");

    // Add foreign key constraints
    try {
      await sql`
        ALTER TABLE "menu_ingredients" 
        ADD CONSTRAINT "menu_ingredients_menu_id_menus_id_fk" 
        FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE cascade ON UPDATE no action;
      `;
      console.log("✅ Added menu_id foreign key constraint");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("ℹ️  Menu foreign key constraint already exists");
      } else {
        console.log("⚠️  Could not add menu foreign key constraint:", err.message);
      }
    }

    try {
      await sql`
        ALTER TABLE "menu_ingredients" 
        ADD CONSTRAINT "menu_ingredients_ingredient_id_ingredients_id_fk" 
        FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE no action ON UPDATE no action;
      `;
      console.log("✅ Added ingredient_id foreign key constraint");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("ℹ️  Ingredient foreign key constraint already exists");
      } else {
        console.log("⚠️  Could not add ingredient foreign key constraint:", err.message);
      }
    }

    // Add indexes for better performance
    try {
      await sql`CREATE INDEX IF NOT EXISTS "idx_menu_ingredients_menu_id" ON "menu_ingredients" ("menu_id");`;
      await sql`CREATE INDEX IF NOT EXISTS "idx_menu_ingredients_ingredient_id" ON "menu_ingredients" ("ingredient_id");`;
      await sql`CREATE INDEX IF NOT EXISTS "idx_ingredients_name" ON "ingredients" ("name");`;
      console.log("✅ Created indexes for better performance");
    } catch (err) {
      console.log("⚠️  Could not create indexes:", err.message);
    }

    console.log("\n🎉 Ingredients tables creation completed successfully!");
    console.log("👉 You can now use the ingredients management system");
  } catch (error) {
    console.log("\n❌ Table creation failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure your database is running and accessible");
    console.log("2. Check that your database URL is correct");
    console.log("3. Verify you have the necessary database permissions");
    process.exit(1);
  }
}

createIngredientsTables();
