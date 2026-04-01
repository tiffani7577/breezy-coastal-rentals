import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { pricing } from "./drizzle/schema.ts";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);
await db.update(pricing).set({ dailyRate: "170.00" });
console.log("✓ Pricing updated to $170/day");
await conn.end();
