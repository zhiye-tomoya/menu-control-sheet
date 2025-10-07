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

export const ingredients = pgTable("ingredients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  defaultUnit: text("default_unit").notNull(), // g, ml, 個, etc.
  pricingUnit: text("pricing_unit").notNull(), // 袋, kg, l, etc.
  conversionFactor: decimal("conversion_factor", { precision: 10, scale: 3 }).notNull(), // how many default_unit per pricing_unit
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").default(""), // dairy, proteins, vegetables, etc.
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menuIngredients = pgTable("menu_ingredients", {
  id: text("id").primaryKey(),
  menuId: text("menu_id")
    .notNull()
    .references(() => menus.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => ingredients.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(), // amount used in recipe
  calculatedCost: decimal("calculated_cost", { precision: 10, scale: 2 }).notNull(), // auto-calculated based on quantity & ingredient price
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  // Keep ingredients field for backward compatibility during transition
  ingredients: jsonb("ingredients").default("[]"),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  costRate: decimal("cost_rate", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
