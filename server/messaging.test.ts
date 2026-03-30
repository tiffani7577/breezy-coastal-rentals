import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockBooking = {
  id: 1,
  bookingRef: "MSGTEST001",
  guestName: "Jane Smith",
  guestEmail: "jane@example.com",
  guestPhone: "(555) 000-0000",
  airbnbBookingName: "Jane Smith",
  startDate: new Date("2026-05-01"),
  endDate: new Date("2026-05-03"),
  totalDays: 3,
  dailyRate: "89.00",
  deliveryFee: "0.00",
  totalAmount: "267.00",
  bookingStatus: "submitted",
  documentStatus: "received",
  adminNotes: null,
  rejectionReason: null,
  stripeSessionId: "cs_test_abc",
  stripePaymentIntentId: "pi_test_abc",
  createdAt: new Date(),
  updatedAt: new Date(),
  paidAt: new Date(),
};

const mockMessages = [
  {
    id: 1,
    bookingId: 1,
    senderRole: "admin",
    senderName: "Admin User",
    content: "Hi Jane, your documents look great!",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 2,
    bookingId: 1,
    senderRole: "guest",
    senderName: "Jane Smith",
    content: "Thank you so much!",
    isRead: false,
    createdAt: new Date(),
  },
];

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./db", () => {
  const booking = {
    id: 1,
    bookingRef: "MSGTEST001",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    guestPhone: "(555) 000-0000",
    airbnbBookingName: "Jane Smith",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-03"),
    totalDays: 3,
    dailyRate: "89.00",
    deliveryFee: "0.00",
    totalAmount: "267.00",
    bookingStatus: "submitted",
    documentStatus: "received",
    adminNotes: null,
    rejectionReason: null,
    stripeSessionId: "cs_test_abc",
    stripePaymentIntentId: "pi_test_abc",
    createdAt: new Date(),
    updatedAt: new Date(),
    paidAt: new Date(),
  };
  const messages = [
    { id: 1, bookingId: 1, senderRole: "admin", senderName: "Admin User", content: "Hi Jane, your documents look great!", isRead: false, createdAt: new Date() },
    { id: 2, bookingId: 1, senderRole: "guest", senderName: "Jane Smith", content: "Thank you so much!", isRead: false, createdAt: new Date() },
  ];
  return {
    getBookingByRef: vi.fn().mockResolvedValue(booking),
    getBookingById: vi.fn().mockResolvedValue(booking),
    getDocumentsByBookingId: vi.fn().mockResolvedValue([]),
    getWaiverByBookingId: vi.fn().mockResolvedValue(null),
    getMessagesByBookingId: vi.fn().mockResolvedValue(messages),
    createMessage: vi.fn().mockResolvedValue(undefined),
    markMessagesRead: vi.fn().mockResolvedValue(undefined),
    getUnreadCountForAdmin: vi.fn().mockResolvedValue({ 1: 1 }),
    getPricing: vi.fn().mockResolvedValue(null),
    getBlockedDates: vi.fn().mockResolvedValue([]),
    getApprovedBookingDates: vi.fn().mockResolvedValue([]),
    createBooking: vi.fn().mockResolvedValue(booking),
    createWaiverSignature: vi.fn().mockResolvedValue(undefined),
    getAllBookings: vi.fn().mockResolvedValue([booking]),
    updateBookingStatus: vi.fn().mockResolvedValue(undefined),
    updateDocumentStatus: vi.fn().mockResolvedValue(undefined),
    updateBookingStripe: vi.fn().mockResolvedValue(undefined),
    updatePricing: vi.fn().mockResolvedValue(undefined),
    addBlockedDate: vi.fn().mockResolvedValue(undefined),
    removeBlockedDate: vi.fn().mockResolvedValue(undefined),
    createDocument: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

// ─── Context factories ────────────────────────────────────────────────────────
function publicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { "x-forwarded-for": "1.2.3.4" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function adminCtx(): TrpcContext {
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

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Guest Messaging", () => {
  it("guest can fetch messages by booking ref", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.messages.getByRef({ ref: "MSGTEST001" });
    expect(result.messages).toHaveLength(2);
    expect(result.guestName).toBe("Jane Smith");
  });

  it("guest can send a message", async () => {
    const { createMessage } = await import("./db");
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.messages.sendByRef({ ref: "MSGTEST001", content: "Is the cart available?" });
    expect(result.success).toBe(true);
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ senderRole: "guest", content: "Is the cart available?" })
    );
  });

  it("guest cannot send an empty message", async () => {
    const caller = appRouter.createCaller(publicCtx());
    await expect(caller.messages.sendByRef({ ref: "MSGTEST001", content: "" })).rejects.toThrow();
  });

  it("returns NOT_FOUND for unknown booking ref", async () => {
    const { getBookingByRef } = await import("./db");
    (getBookingByRef as any).mockResolvedValueOnce(null);
    const caller = appRouter.createCaller(publicCtx());
    await expect(caller.messages.getByRef({ ref: "BADREF" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("Admin Messaging", () => {
  it("admin can fetch booking detail with messages", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const result = await caller.admin.getBookingDetailWithMessages({ id: 1 });
    expect(result.booking.guestName).toBe("Jane Smith");
    expect(result.messages).toHaveLength(2);
  });

  it("admin can send a message to a guest", async () => {
    const { createMessage } = await import("./db");
    const caller = appRouter.createCaller(adminCtx());
    const result = await caller.admin.sendMessage({ bookingId: 1, content: "Your booking is approved!" });
    expect(result.success).toBe(true);
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ senderRole: "admin", content: "Your booking is approved!" })
    );
  });

  it("admin can get unread message counts", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const counts = await caller.admin.getUnreadCounts();
    expect(counts[1]).toBe(1);
  });

  it("non-admin cannot access admin messaging", async () => {
    const userCtx: TrpcContext = {
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
    const caller = appRouter.createCaller(userCtx);
    await expect(caller.admin.sendMessage({ bookingId: 1, content: "test" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
