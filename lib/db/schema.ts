import { pgTable, text, timestamp, decimal, integer, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menus = pgTable("menus", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").default(""),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  ingredients: jsonb("ingredients").notNull(),
  sellingPrice: decimal("selling_price").notNull(),
  totalCost: decimal("total_cost").notNull(),
  costRate: decimal("cost_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
