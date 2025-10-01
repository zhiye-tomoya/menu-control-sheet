import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Only create database connection if DATABASE_URL is provided
export const db = process.env.DATABASE_URL ? drizzle(neon(process.env.DATABASE_URL), { schema }) : null;

export const isDatabaseEnabled = !!process.env.DATABASE_URL;
