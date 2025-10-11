import { db } from "@/lib/db/connection";
import { changeLogs } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export interface LogChangeParams {
  tableName: string;
  recordId: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  beforeData?: any;
  afterData?: any;
}

export async function logChange({ tableName, recordId, userId, action, beforeData, afterData }: LogChangeParams) {
  if (!db) {
    console.error("Database not available for change logging");
    return;
  }

  try {
    const changeId = nanoid();
    await db.insert(changeLogs).values({
      id: changeId,
      tableName,
      recordId,
      userId,
      action,
      beforeData: beforeData || null,
      afterData: afterData || null,
    });
  } catch (error) {
    console.error("Error logging change:", error);
    // Don't throw error to avoid breaking the main operation
  }
}
