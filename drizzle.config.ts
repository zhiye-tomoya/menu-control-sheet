import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

// Get the appropriate database URL based on environment
const environment = process.env.ENVIRONMENT;
let databaseUrl;

if (environment === "development") {
  databaseUrl = process.env.DEV_DATABASE_URL;
} else if (environment === "production") {
  databaseUrl = process.env.PROD_DATABASE_URL;
} else {
  databaseUrl = process.env.DATABASE_URL;
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl!,
  },
  schemaFilter: ["public"],
});
