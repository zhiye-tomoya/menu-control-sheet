import { relations } from "drizzle-orm/relations";
import { categories, menus } from "./schema";

export const menusRelations = relations(menus, ({one}) => ({
	category: one(categories, {
		fields: [menus.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	menus: many(menus),
}));