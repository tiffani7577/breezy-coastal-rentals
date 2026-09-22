import { describe, expect, it } from "vitest";
import { buildDatabaseConnectionOptions } from "./db";

describe("database connection configuration", () => {
  it("enforces verified TLS for TiDB Cloud URLs", () => {
    const options = buildDatabaseConnectionOptions(
      "mysql://user:password@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/app?ssl=true"
    );

    expect(options.uri).not.toContain("ssl=true");
    expect(options.ssl).toMatchObject({
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
      verifyIdentity: true,
    });
    expect(options.connectTimeout).toBe(8_000);
    expect(options.enableKeepAlive).toBe(true);
  });

  it("keeps a non-TiDB MySQL URL free of forced TLS settings", () => {
    const options = buildDatabaseConnectionOptions("mysql://user:password@mysql.internal:3306/app");

    expect(options.uri).toBe("mysql://user:password@mysql.internal:3306/app");
    expect(options.ssl).toBeUndefined();
  });
});
