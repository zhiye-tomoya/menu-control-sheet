import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { organizations, users, shops } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for organization creation with first admin user
const createOrganizationSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationDescription: z.string().optional().default(""),
  adminEmail: z.string().email("Valid email is required"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  adminName: z.string().min(1, "Admin name is required"),
});

export async function POST(request: NextRequest) {
  console.log("POST /api/organizations - Starting organization creation");

  if (!db) {
    console.error("Database not available");
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  try {
    console.log("Parsing request body...");
    const body = await request.json();
    console.log("Request body parsed:", { ...body, adminPassword: "[REDACTED]" });

    const { organizationName, organizationDescription, adminEmail, adminPassword, adminName } = createOrganizationSchema.parse(body);
    console.log("Schema validation passed");

    // Check if user with this email already exists
    console.log("Checking for existing user...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (existingUser) {
      console.log("User already exists:", adminEmail);
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    console.log("Creating organization...");
    // Create organization
    const organizationId = nanoid();
    await db.insert(organizations).values({
      id: organizationId,
      name: organizationName,
      description: organizationDescription,
    });
    console.log("Organization created with ID:", organizationId);

    // Hash password and create admin user
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    console.log("Password hashed, creating user...");

    const userId = nanoid();
    await db.insert(users).values({
      id: userId,
      email: adminEmail,
      hashedPassword,
      name: adminName,
      organizationId,
      isAdmin: true,
    });
    console.log("User created with ID:", userId);

    console.log("Organization creation successful");
    return NextResponse.json({
      message: "Organization created successfully",
      organizationId,
      userId,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  // For now, we'll return all organizations (in production, you'd add proper auth)
  try {
    const allOrganizations = await db.select().from(organizations);

    return NextResponse.json({
      organizations: allOrganizations,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
