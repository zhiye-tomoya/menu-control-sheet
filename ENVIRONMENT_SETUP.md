# Environment Management Guide

This project now supports easy switching between development and production databases.

## 🌍 Available Commands

### Switch to Development Database

```bash
npm run env:dev
```

### Switch to Production Database

```bash
npm run env:prod
```

### Check Current Environment

```bash
npm run env:status
```

## 📁 Environment Configuration

Your `.env.local` file contains:

- `ENVIRONMENT`: Current environment ("development" or "production")
- `DEV_DATABASE_URL`: Development database connection
- `PROD_DATABASE_URL`: Production database connection
- `DATABASE_URL`: Active database (automatically set)

## 🔄 How It Works

1. **Development Mode** (default):

   - Uses your working development database
   - All your existing data and categories are preserved
   - Safe for testing and development

2. **Production Mode**:
   - Uses the production database
   - Clean environment for live deployment
   - Separate data from development

## 🚀 Deployment Workflow

### For Development:

```bash
npm run env:dev      # Switch to development database
npm run dev          # Start development server
```

### For Production:

```bash
npm run env:prod     # Switch to production database
npm run db:push      # Ensure production database has tables
npm run build        # Build for production
npm run start        # Start production server
```

### For Deployment Platforms (Vercel/Netlify):

Set environment variable:

- **Name**: `DATABASE_URL`
- **Value**: Your production database URL
- **Environment**: Production

## 🛠️ Database Setup

### Setting up Production Database:

1. Switch to production: `npm run env:prod`
2. Create tables: `npm run db:push`
3. Test: `npm run dev` (should show clean slate)
4. Switch back to dev: `npm run env:dev`

## ✅ Benefits

- **Safe Development**: Your development data is never affected
- **Easy Testing**: Switch to production database to test deployment
- **Quick Recovery**: Always switch back to development easily
- **Production Ready**: Clean separation for live deployment

## 📊 Database Status

Check which database you're currently using:

```bash
npm run env:status
```

This will show you the current environment and database endpoint.
