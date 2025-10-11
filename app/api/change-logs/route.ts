import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { changeLogs, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const url = new URL(request.url);
  const tableName = url.searchParams.get("table");
  const recordId = url.searchParams.get("recordId");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  if (!tableName || !recordId) {
    return NextResponse.json({ error: "table and recordId parameters are required" }, { status: 400 });
  }

  try {
    // Get change logs with user information
    const logs = await db
      .select({
        id: changeLogs.id,
        tableName: changeLogs.tableName,
        recordId: changeLogs.recordId,
        action: changeLogs.action,
        beforeData: changeLogs.beforeData,
        afterData: changeLogs.afterData,
        createdAt: changeLogs.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(changeLogs)
      .leftJoin(users, eq(changeLogs.userId, users.id))
      .where(and(eq(changeLogs.tableName, tableName), eq(changeLogs.recordId, recordId)))
      .orderBy(desc(changeLogs.createdAt))
      .limit(limit);

    return NextResponse.json({
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error("Error fetching change logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
