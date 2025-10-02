import { pgTable, text, timestamp, foreignKey, jsonb, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().default('),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const menus = pgTable("menus", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	imageUrl: text("image_url").default('),
	ingredients: jsonb().notNull(),
	sellingPrice: numeric("selling_price").notNull(),
	totalCost: numeric("total_cost").notNull(),
	costRate: numeric("cost_rate").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	categoryId: text("category_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "menus_category_id_categories_id_fk"
		}),
]);
