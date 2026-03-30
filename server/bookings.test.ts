import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ─────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getPricing: vi.fn().mockResolvedValue({
    id: 1,
    dailyRate: "89.00",
    deliveryFee: "0.00",
    cartName: "Breezy Golf Cart",
    cartDescription: null,
    cartImageUrl: null,
    updatedAt: new Date(),
  }),
  getBlockedDates: vi.fn().mockResolvedValue([]),
  getApprovedBookingDates: vi.fn().mockResolvedValue([]),
  createBooking: vi.fn().mockResolvedValue({
    id: 1,
    bookingRef: "TESTREF001",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    guestPhone: "(555) 000-0000",
    airbnbBookingName: "Jane Smith",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-04-03"),
    totalDays: 3,
    dailyRate: "89.00",
    deliveryFee: "0.00",
    totalAmount: "267.00",
    bookingStatus: "pending_payment",
    documentStatus: "pending",
    adminNotes: null,
    rejectionReason: null,
    stripeSessionId: null,
    stripePaymentIntentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    paidAt: null,
  }),
  createWaiverSignature: vi.fn().mockResolvedValue(undefined),
  getBookingByRef: vi.fn().mockResolvedValue({
    id: 1,
    bookingRef: "TESTREF001",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    guestPhone: "(555) 000-0000",
    airbnbBookingName: "Jane Smith",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-04-03"),
    totalDays: 3,
    dailyRate: "89.00",
    deliveryFee: "0.00",
    totalAmount: "267.00",
    bookingStatus: "submitted",
    documentStatus: "received",
    adminNotes: null,
    rejectionReason: null,
    stripeSessionId: "cs_test_123",
    stripePaymentIntentId: "pi_test_123",
    createdAt: new Date(),
    updatedAt: new Date(),
    paidAt: new Date(),
  }),
  getDocumentsByBookingId: vi.fn().mockResolvedValue([]),
  getWaiverByBookingId: vi.fn().mockResolvedValue({
    id: 1,
    bookingId: 1,
    legalName: "Jane Smith",
    agreedToTerms: true,
    ipAddress: "127.0.0.1",
    userAgent: "test",
    signedAt: new Date(),
  }),
  getAllBookings: vi.fn().mockResolvedValue([]),
  getBookingById: vi.fn().mockResolvedValue(null),
  updateBookingStatus: vi.fn().mockResolvedValue(undefined),
  updateDocumentStatus: vi.fn().mockResolvedValue(undefined),
  updateBookingStripe: vi.fn().mockResolvedValue(undefined),
  updatePricing: vi.fn().mockResolvedValue(undefined),
  addBlockedDate: vi.fn().mockResolvedValue(undefined),
  removeBlockedDate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

// ─── Context factories ────────────────────────────────────────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      email: "admin@breezy.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("pricing.get", () => {
  it("returns pricing data as public procedure", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.pricing.get();
    expect(result).not.toBeNull();
    expect(result?.dailyRate).toBe("89.00");
    expect(result?.cartName).toBe("Breezy Golf Cart");
  });
});

describe("availability.getBlockedDates", () => {
  it("returns empty blocks and approved ranges", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.availability.getBlockedDates();
    expect(result.blocks).toEqual([]);
    expect(result.approvedRanges).toEqual([]);
  });
});

describe("bookings.create", () => {
  it("creates a booking and returns bookingRef and bookingId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.bookings.create({
      guestName: "Jane Smith",
      guestEmail: "jane@example.com",
      guestPhone: "(555) 000-0000",
      airbnbBookingName: "Jane Smith",
      startDate: "2026-04-01",
      endDate: "2026-04-03",
      totalDays: 3,
      dailyRate: "89.00",
      deliveryFee: "0.00",
      totalAmount: "267.00",
      waiverLegalName: "Jane Smith",
      waiverAgreed: true,
    });
    expect(result.bookingRef).toBeDefined();
    expect(result.bookingId).toBe(1);
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookings.create({
        guestName: "Jane Smith",
        guestEmail: "not-an-email",
        guestPhone: "(555) 000-0000",
        airbnbBookingName: "Jane Smith",
        startDate: "2026-04-01",
        endDate: "2026-04-03",
        totalDays: 3,
        dailyRate: "89.00",
        deliveryFee: "0.00",
        totalAmount: "267.00",
        waiverLegalName: "Jane Smith",
        waiverAgreed: true,
      })
    ).rejects.toThrow();
  });
});

describe("bookings.getByRef", () => {
  it("returns booking by reference", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.bookings.getByRef({ ref: "TESTREF001" });
    expect(result.booking).toBeDefined();
    expect(result.booking.bookingRef).toBe("TESTREF001");
    expect(result.waiver?.legalName).toBe("Jane Smith");
  });
});

describe("admin.getAllBookings", () => {
  it("allows admin to get all bookings", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.getAllBookings();
    expect(Array.isArray(result)).toBe(true);
  });

  it("blocks non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.getAllBookings()).rejects.toThrow();
  });

  it("blocks unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.getAllBookings()).rejects.toThrow();
  });
});

describe("admin.updateBookingStatus", () => {
  it("allows admin to update booking status", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.updateBookingStatus({
      id: 1,
      status: "approved",
    });
    expect(result.success).toBe(true);
  });

  it("blocks non-admin from updating status", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.updateBookingStatus({ id: 1, status: "approved" })
    ).rejects.toThrow();
  });
});

describe("availability.addBlock (admin only)", () => {
  it("allows admin to block a date", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.availability.addBlock({ date: "2026-05-01", reason: "Maintenance" });
    expect(result.success).toBe(true);
  });

  it("blocks non-admin from blocking dates", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.availability.addBlock({ date: "2026-05-01" })).rejects.toThrow();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
