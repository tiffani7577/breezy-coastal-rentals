import "dotenv/config";
import { createPool } from "mysql2/promise";
import { buildDatabaseConnectionOptions } from "../server/db";
import { ensureDatabaseSchema } from "../server/dbBootstrap";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to migrate the Breezy Coastal Rentals database.");
}

const pool = createPool(buildDatabaseConnectionOptions(databaseUrl));

try {
  await ensureDatabaseSchema(pool);
  await pool.query("SELECT 1");
  console.log("Database schema is ready.");
} finally {
  await pool.end();
}
