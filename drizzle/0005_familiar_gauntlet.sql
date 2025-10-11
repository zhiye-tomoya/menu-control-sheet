ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "shop_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" DROP COLUMN "organization_id";