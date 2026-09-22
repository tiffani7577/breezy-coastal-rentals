import { describe, expect, it } from "vitest";
import { ensureDatabaseSchema, getSchemaStatements } from "./dbBootstrap";

describe("database schema bootstrap", () => {
  it("includes the customer-facing availability and pricing tables", () => {
    const statements = getSchemaStatements().join("\n");

    expect(statements).toContain("CREATE TABLE IF NOT EXISTS `availability_blocks`");
    expect(statements).toContain("CREATE TABLE IF NOT EXISTS `pricing`");
    expect(statements).toContain("CREATE TABLE IF NOT EXISTS `bookings`");
    expect(getSchemaStatements().every((statement) => statement.includes("IF NOT EXISTS"))).toBe(true);
  });

  it("runs the idempotent statements and seeds pricing once", async () => {
    const statements: string[] = [];
    const pool = {
      query: async (statement: string) => {
        statements.push(statement);
        return [[], []] as any;
      },
    };

    await ensureDatabaseSchema(pool as any);

    expect(statements).toHaveLength(getSchemaStatements().length + 1);
    expect(statements.at(-1)).toContain("INSERT INTO `pricing`");
    expect(statements.at(-1)).toContain("ON DUPLICATE KEY UPDATE");
  });
});
