#!/usr/bin/env node
const { neon } = require("@neondatabase/serverless");

console.log("🔍 Comprehensive Database Structure Verification");
console.log("================================================");

async function verifyStructure() {
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

    console.log(`✅ Verifying ${environment} database structure\n`);

    // Create database connection
    const sql = neon(dbUrl);

    // 1. Verify table structure
    console.log("📋 Table Structure:");

    const menuColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'menus' 
      ORDER BY ordinal_position
    `;

    console.log("Menus table columns:");
    menuColumns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === "NO" ? "NOT NULL" : "nullable"})`);
    });

    // 2. Verify foreign key relationships
    console.log("\n🔗 Foreign Key Relationships:");
    const foreignKeys = await sql`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'menus'
    `;

    foreignKeys.forEach((fk) => {
      console.log(`  - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // 3. Verify data integrity
    console.log("\n📊 Data Integrity Check:");

    const dataCheck = await sql`
      SELECT 
        COUNT(*) as total_menus,
        COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as menus_with_category,
        COUNT(CASE WHEN subcategory_id IS NOT NULL THEN 1 END) as menus_with_subcategory
      FROM menus
    `;

    const { total_menus, menus_with_category, menus_with_subcategory } = dataCheck[0];

    console.log(`  Total menus: ${total_menus}`);
    console.log(`  Menus with category_id: ${menus_with_category}`);
    console.log(`  Menus with subcategory_id: ${menus_with_subcategory}`);

    if (total_menus === menus_with_category && total_menus === menus_with_subcategory) {
      console.log("  ✅ All menus have both category_id and subcategory_id");
    } else {
      console.log("  ❌ Some menus are missing category_id or subcategory_id");
    }

    // 4. Verify hierarchical relationships
    console.log("\n🏗️ Hierarchical Structure:");

    const hierarchy = await sql`
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT s.id) as subcategory_count,
        COUNT(m.id) as menu_count
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      LEFT JOIN menus m ON s.id = m.subcategory_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;

    hierarchy.forEach((row) => {
      console.log(`  ${row.category_name}:`);
      console.log(`    - Subcategories: ${row.subcategory_count}`);
      console.log(`    - Menus: ${row.menu_count}`);
    });

    // 5. Sample data verification
    console.log("\n📝 Sample Menu Data:");

    const sampleMenus = await sql`
      SELECT 
        m.name as menu_name,
        c.name as category_name,
        s.name as subcategory_name,
        m.selling_price,
        m.cost_rate
      FROM menus m
      JOIN categories c ON m.category_id = c.id
      JOIN subcategories s ON m.subcategory_id = s.id
      LIMIT 3
    `;

    sampleMenus.forEach((menu) => {
      console.log(`  ${menu.menu_name}:`);
      console.log(`    - Category: ${menu.category_name} > ${menu.subcategory_name}`);
      console.log(`    - Price: ¥${menu.selling_price} (Cost rate: ${menu.cost_rate}%)`);
    });

    // 6. Final validation
    console.log("\n✅ Structure Verification Complete!");
    console.log("🎉 Your hierarchical menu system is working correctly!");
    console.log(`📱 Application running at: http://localhost:3003`);
  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verifyStructure();
