import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { shops, users, userShops } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for shop creation
const createShopSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  description: z.string().optional().default(""),
  organizationId: z.string().min(1, "Organization ID is required"),
  adminUserId: z.string().min(1, "Admin user ID is required"), // User who creates the shop
});

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, description, organizationId, adminUserId } = createShopSchema.parse(body);

    // Verify that the user exists and belongs to the organization
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, adminUserId))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.organizationId !== organizationId) {
      return NextResponse.json({ error: "User does not belong to this organization" }, { status: 403 });
    }

    // Create shop
    const shopId = nanoid();
    await db.insert(shops).values({
      id: shopId,
      name,
      description,
      organizationId,
    });

    // Associate user with the shop
    const userShopId = nanoid();
    await db.insert(userShops).values({
      id: userShopId,
      userId: adminUserId,
      shopId,
    });

    return NextResponse.json({
      message: "Shop created successfully",
      shopId,
    });
  } catch (error) {
    console.error("Error creating shop:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  try {
    let allShops;

    if (organizationId) {
      allShops = await db.select().from(shops).where(eq(shops.organizationId, organizationId));
    } else {
      allShops = await db.select().from(shops);
    }

    return NextResponse.json({
      shops: allShops,
    });
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
