#!/usr/bin/env node
const { neon } = require("@neondatabase/serverless");

console.log("🔍 Database Schema Check");
console.log("========================");

async function checkDatabase() {
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

    console.log(`✅ Checking ${environment} database`);

    // Create database connection
    const sql = neon(dbUrl);

    // Check what tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log("\n📋 Existing tables:");
    if (tables.length === 0) {
      console.log("  No tables found - this appears to be an empty database");
    } else {
      tables.forEach((table) => {
        console.log(`  - ${table.table_name}`);
      });
    }

    // Check if specific tables exist
    const categoryTable = tables.find((t) => t.table_name === "categories");
    const menuTable = tables.find((t) => t.table_name === "menus");

    console.log("\n🔍 Table Status:");
    console.log(`  Categories table: ${categoryTable ? "✅ EXISTS" : "❌ NOT FOUND"}`);
    console.log(`  Menus table: ${menuTable ? "✅ EXISTS" : "❌ NOT FOUND"}`);

    if (categoryTable) {
      console.log("\n📊 Categories table info:");
      const categoryCount = await sql`SELECT count(*) as count FROM categories`;
      console.log(`  - Record count: ${categoryCount[0].count}`);
    }

    if (menuTable) {
      console.log("\n📊 Menus table info:");
      const menuCount = await sql`SELECT count(*) as count FROM menus`;
      console.log(`  - Record count: ${menuCount[0].count}`);
    }
  } catch (error) {
    console.error("\n❌ Database check failed:", error.message);
  }
}

checkDatabase();
