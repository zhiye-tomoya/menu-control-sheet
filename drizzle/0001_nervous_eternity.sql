CREATE TABLE "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"default_unit" text NOT NULL,
	"pricing_unit" text NOT NULL,
	"conversion_factor" numeric(10, 3) NOT NULL,
	"current_price" numeric(10, 2) NOT NULL,
	"category" text DEFAULT '',
	"description" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_id" text NOT NULL,
	"ingredient_id" text NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"calculated_cost" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"category_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menus" ALTER COLUMN "ingredients" SET DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "menus" ALTER COLUMN "ingredients" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "menus" ALTER COLUMN "selling_price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "menus" ALTER COLUMN "total_cost" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "menus" ALTER COLUMN "cost_rate" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "subcategory_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE no action ON UPDATE no action;