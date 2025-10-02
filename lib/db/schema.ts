import { pgTable, text, timestamp, integer, jsonb, decimal } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subcategories = pgTable("subcategories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
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
  subcategoryId: text("subcategory_id")
    .notNull()
    .references(() => subcategories.id),
  ingredients: jsonb("ingredients").notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  costRate: decimal("cost_rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
