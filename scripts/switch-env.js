#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ENV_FILE = path.join(process.cwd(), ".env.local");

function switchEnvironment(targetEnv) {
  if (!["development", "production"].includes(targetEnv)) {
    console.error('❌ Environment must be "development" or "production"');
    process.exit(1);
  }

  try {
    // Read current .env.local
    const envContent = fs.readFileSync(ENV_FILE, "utf8");

    // Extract database URLs
    const devDbMatch = envContent.match(/DEV_DATABASE_URL="([^"]+)"/);
    const prodDbMatch = envContent.match(/PROD_DATABASE_URL="([^"]+)"/);

    if (!devDbMatch || !prodDbMatch) {
      console.error("❌ Could not find DEV_DATABASE_URL or PROD_DATABASE_URL");
      process.exit(1);
    }

    const devDbUrl = devDbMatch[1];
    const prodDbUrl = prodDbMatch[1];

    // Select the appropriate database URL
    const activeDbUrl = targetEnv === "development" ? devDbUrl : prodDbUrl;

    // Update the environment file
    const updatedContent = envContent.replace(/ENVIRONMENT="[^"]*"/, `ENVIRONMENT="${targetEnv}"`).replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${activeDbUrl}"`);

    fs.writeFileSync(ENV_FILE, updatedContent);

    console.log(`✅ Switched to ${targetEnv} environment`);
    console.log(`📊 Using database: ${activeDbUrl.split("@")[1].split("/")[0]}...`);
  } catch (error) {
    console.error("❌ Error switching environment:", error.message);
    process.exit(1);
  }
}

// Get command line argument
const targetEnv = process.argv[2];

if (!targetEnv) {
  console.log("🔧 Environment Switcher");
  console.log("Usage: node scripts/switch-env.js <development|production>");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/switch-env.js development");
  console.log("  node scripts/switch-env.js production");
  process.exit(0);
}

switchEnvironment(targetEnv);
