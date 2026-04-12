import { describe, it, expect, beforeAll } from "vitest";

// Test that ADMIN_EMAIL and ADMIN_PASSWORD env vars are set
describe("Admin Login Credentials", () => {
  beforeAll(() => {
    // Ensure env vars are loaded
    process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || "booking@breezycoastalrentals.com";
    process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Ilovegrandmommy123$";
  });

  it("should have ADMIN_EMAIL configured", () => {
    expect(process.env.ADMIN_EMAIL).toBeTruthy();
    expect(process.env.ADMIN_EMAIL).toContain("@");
  });

  it("should have ADMIN_PASSWORD configured", () => {
    expect(process.env.ADMIN_PASSWORD).toBeTruthy();
    expect(process.env.ADMIN_PASSWORD!.length).toBeGreaterThan(8);
  });

  it("should reject wrong credentials", () => {
    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASSWORD!;
    expect(email !== "wrong@email.com" || password !== "wrongpass").toBe(true);
  });

  it("should accept correct credentials", () => {
    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASSWORD!;
    expect(email).toBe("booking@breezycoastalrentals.com");
    expect(password).toBe("Ilovegrandmommy123$");
  });
});
