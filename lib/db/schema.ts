import { pgTable, text, timestamp, integer, jsonb, decimal, boolean } from "drizzle-orm/pg-core";

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
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
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
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  costRate: decimal("cost_rate", { precision: 10, scale: 2 }).notNull(),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Authentication and Organization Tables
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shops = pgTable("shops", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userShops = pgTable("user_shops", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const changeLogs = pgTable("change_logs", {
  id: text("id").primaryKey(),
  tableName: text("table_name").notNull(), // ingredients, menus, etc.
  recordId: text("record_id").notNull(), // ID of the changed record
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  beforeData: jsonb("before_data"), // Previous state (null for CREATE)
  afterData: jsonb("after_data"), // New state (null for DELETE)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Auth.js required tables
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});
