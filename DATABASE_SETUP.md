# Database Setup Guide

## Step 1: Get Your Neon Database Connection String

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in to your account
3. Create a new project or select an existing one
4. Go to your project dashboard
5. Click on "Connection Details" or "Connect"
6. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Update Your Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder DATABASE_URL with your actual connection string:
   ```env
   DATABASE_URL="postgresql://your_username:your_password@your_endpoint/your_database?sslmode=require"
   ```

## Step 3: Generate and Apply Database Migration

Run these commands in your terminal:

```bash
# Generate migration files from your schema
npm run db:generate

# Push the schema directly to your database (for development)
npm run db:push
```

## Step 4: Verify Database Connection

1. Restart your development server:

   ```bash
   npm run dev
   ```

2. Check that there are no database connection errors in the console

## Step 5: Test the Application

1. Open your browser to the running application
2. Try creating a new menu item
3. The data is now stored in your Neon database

## Optional: Database Studio

You can also explore your database with Drizzle Studio:

```bash
npm run db:studio
```

This will open a web interface where you can view and edit your database data directly.

## Troubleshooting

- **Connection Error**: Double-check your DATABASE_URL format and credentials
- **Migration Issues**: Make sure your Neon database is running and accessible
- **Permission Issues**: Ensure your database user has the necessary permissions

## What's Already Done ✅

- ✅ Database schema defined (`lib/db/schema.ts`)
- ✅ Database connection setup with fallback (`lib/db/connection.ts`)
- ✅ API routes configured to use database when available
- ✅ Menu service uses database exclusively
- ✅ Drizzle configuration file (`drizzle.config.ts`)
- ✅ Package.json scripts for database operations

Once you complete the steps above, your application will be fully using PostgreSQL!
