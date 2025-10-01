# Database Migration Guide

This guide outlines the steps to migrate from localStorage to Neon PostgreSQL database.

## Current Implementation

The application currently uses:

- **TanStack Query** for state management and caching
- **localStorage** for data persistence via `menuService`
- **Type-safe interfaces** in `lib/types.ts`

## Migration Steps

### 1. Install Database Dependencies

```bash
npm install @neondatabase/serverless drizzle-orm drizzle-kit
npm install -D @types/pg
```

### 2. Environment Variables

Create `.env.local` file:

```env
# Neon Database
DATABASE_URL="postgresql://username:password@endpoint/database?sslmode=require"
```

### 3. Database Schema

Create `lib/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, decimal, integer, jsonb } from "drizzle-orm/pg-core";

export const menus = pgTable("menus", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").default(""),
  ingredients: jsonb("ingredients").notNull(),
  sellingPrice: decimal("selling_price").notNull(),
  totalCost: decimal("total_cost").notNull(),
  costRate: decimal("cost_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 4. Database Connection

Create `lib/db/connection.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 5. Update Menu Service

Replace `lib/services/menu-service.ts` with database operations:

```typescript
import { db } from "@/lib/db/connection";
import { menus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MenuData, MenuItem, CreateMenuInput, UpdateMenuInput } from "@/lib/types";

export const menuService = {
  async getMenus(): Promise<MenuItem[]> {
    const result = await db.select().from(menus);
    return result.map((menu) => ({
      ...menu,
      totalCost: Number(menu.totalCost),
      sellingPrice: Number(menu.sellingPrice),
      costRate: Number(menu.costRate),
    }));
  },

  async getMenu(id: string): Promise<MenuData | null> {
    const result = await db.select().from(menus).where(eq(menus.id, id));
    if (result.length === 0) return null;

    const menu = result[0];
    return {
      ...menu,
      totalCost: Number(menu.totalCost),
      sellingPrice: Number(menu.sellingPrice),
      costRate: Number(menu.costRate),
      ingredients: menu.ingredients as any,
    };
  },

  async createMenu(input: CreateMenuInput): Promise<MenuData> {
    const { totalCost, costRate } = calculateMenuValues(input);

    const newMenu = {
      id: Date.now().toString(),
      name: input.name,
      imageUrl: input.imageUrl,
      ingredients: input.ingredients,
      sellingPrice: input.sellingPrice.toString(),
      totalCost: totalCost.toString(),
      costRate: costRate.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(menus).values(newMenu);

    return {
      ...newMenu,
      totalCost: Number(newMenu.totalCost),
      sellingPrice: Number(newMenu.sellingPrice),
      costRate: Number(newMenu.costRate),
    };
  },

  async updateMenu(input: UpdateMenuInput): Promise<MenuData> {
    const { totalCost, costRate } = calculateMenuValues(input);

    const updatedMenu = {
      name: input.name,
      imageUrl: input.imageUrl,
      ingredients: input.ingredients,
      sellingPrice: input.sellingPrice.toString(),
      totalCost: totalCost.toString(),
      costRate: costRate.toString(),
      updatedAt: new Date(),
    };

    await db.update(menus).set(updatedMenu).where(eq(menus.id, input.id));

    const result = await db.select().from(menus).where(eq(menus.id, input.id));
    const menu = result[0];

    return {
      ...menu,
      totalCost: Number(menu.totalCost),
      sellingPrice: Number(menu.sellingPrice),
      costRate: Number(menu.costRate),
      ingredients: menu.ingredients as any,
    };
  },

  async deleteMenu(id: string): Promise<void> {
    await db.delete(menus).where(eq(menus.id, id));
  },
};
```

### 6. API Routes (if using Next.js App Router)

Create API routes in `app/api/menus/`:

- `app/api/menus/route.ts` - GET all, POST new
- `app/api/menus/[id]/route.ts` - GET by ID, PUT update, DELETE

### 7. Update Menu Service to Use API

For client-server separation, update the service to use fetch:

```typescript
export const menuService = {
  async getMenus(): Promise<MenuItem[]> {
    const response = await fetch("/api/menus");
    if (!response.ok) throw new Error("Failed to fetch menus");
    return response.json();
  },

  // ... other methods using fetch
};
```

## Migration Benefits

- **Scalability**: Handle multiple users and larger datasets
- **Data integrity**: ACID compliance and referential integrity
- **Performance**: Optimized queries and indexing
- **Backup & Recovery**: Automated backups with Neon
- **Multi-user support**: Concurrent access handling

## No Changes Required

The following components require **no changes** after migration:

- ✅ React components (`MenuList`, `MenuControlSheet`)
- ✅ TanStack Query hooks (`useMenus`, `useCreateMenu`, etc.)
- ✅ TypeScript interfaces (`MenuData`, `Ingredient`, etc.)
- ✅ Toast notifications
- ✅ UI components and styling

This is the power of the abstraction layer we've created with TanStack Query!
