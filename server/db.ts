import { and, desc, eq, gt, gte, lte, ne, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  availabilityBlocks,
  bookingMessages,
  bookings,
  documents,
  inspectionChecklists,
  InsertBooking,
  InsertBookingMessage,
  InsertDocument,
  InsertInspectionChecklist,
  InsertUser,
  InsertWaiverSignature,
  pricing,
  users,
  waiverSignatures,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────
import { ENV } from "./_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
export async function getPricing() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pricing).limit(1);
  return result[0] ?? null;
}

export async function updatePricing(data: {
  dailyRate?: string;
  deliveryFee?: string;
  cartName?: string;
  cartDescription?: string;
  cartImageUrl?: string;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(pricing).limit(1);
  if (existing.length === 0) {
    await db.insert(pricing).values({
      dailyRate: data.dailyRate ?? "170.00",
      deliveryFee: data.deliveryFee ?? "0.00",
      cartName: data.cartName ?? "Breezy Golf Cart",
      cartDescription: data.cartDescription ?? null,
      cartImageUrl: data.cartImageUrl ?? null,
    });
  } else {
    await db.update(pricing).set(data).where(eq(pricing.id, existing[0].id));
  }
}

// ─── Availability ─────────────────────────────────────────────────────────────
export async function getBlockedDates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(availabilityBlocks);
}

export async function addBlockedDate(blockDate: string, reason?: string) {
  const db = await getDb();
  if (!db) return;
  // blockDate is YYYY-MM-DD; convert to Date for drizzle
  const dateObj = new Date(blockDate + "T12:00:00Z");
  await db.insert(availabilityBlocks).values({ blockDate: dateObj, reason });
}

export async function removeBlockedDate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
}

export async function getApprovedBookingDates() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ startDate: bookings.startDate, endDate: bookings.endDate })
    .from(bookings)
    .where(eq(bookings.bookingStatus, "approved"));
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(bookings).values(data);
  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingRef, data.bookingRef!))
    .limit(1);
  return result[0];
}

export async function getBookingByRef(bookingRef: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingRef, bookingRef))
    .limit(1);
  return result[0] ?? null;
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(bookings.createdAt);
}

export async function updateBookingStatus(
  id: number,
  bookingStatus: string,
  opts?: { adminNotes?: string; rejectionReason?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookings)
    .set({ bookingStatus: bookingStatus as any, ...opts })
    .where(eq(bookings.id, id));
}

export async function updateDocumentStatus(id: number, documentStatus: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookings)
    .set({ documentStatus: documentStatus as any })
    .where(eq(bookings.id, id));
}

export async function updateBookingStripe(
  bookingRef: string,
  stripeSessionId: string,
  stripePaymentIntentId?: string
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookings)
    .set({
      stripeSessionId,
      stripePaymentIntentId: stripePaymentIntentId ?? null,
      bookingStatus: "submitted",
      paidAt: new Date(),
    })
    .where(eq(bookings.bookingRef, bookingRef));
}

// ─── Documents ────────────────────────────────────────────────────────────────
export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(documents).values(data);
}

export async function getDocumentsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.bookingId, bookingId));
}

// ─── Waiver Signatures ────────────────────────────────────────────────────────
export async function createWaiverSignature(data: InsertWaiverSignature) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(waiverSignatures).values(data);
}

export async function getWaiverByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(waiverSignatures)
    .where(eq(waiverSignatures.bookingId, bookingId))
    .limit(1);
  return result[0] ?? null;
}

// ─── Booking Messages ────────────────────────────────────────────────────────
export async function createMessage(data: InsertBookingMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(bookingMessages).values(data);
}

export async function getMessagesByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(bookingMessages)
    .where(eq(bookingMessages.bookingId, bookingId))
    .orderBy(bookingMessages.createdAt);
}

export async function markMessagesRead(bookingId: number, readerRole: "admin" | "guest") {
  // Mark messages sent by the OTHER role as read (i.e. admin reading guest messages, or vice versa)
  const senderRole = readerRole === "admin" ? "guest" : "admin";
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookingMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(bookingMessages.bookingId, bookingId),
        eq(bookingMessages.senderRole, senderRole),
        eq(bookingMessages.isRead, false)
      )
    );
}

export async function getUnreadCountForAdmin() {
  // Returns map of bookingId -> unread count (messages from guests not yet read by admin)
  const db = await getDb();
  if (!db) return {};
  const rows = await db
    .select()
    .from(bookingMessages)
    .where(and(eq(bookingMessages.senderRole, "guest"), eq(bookingMessages.isRead, false)));
  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.bookingId] = (counts[row.bookingId] ?? 0) + 1;
  }
  return counts;
}

// ─── Inspection Checklists ────────────────────────────────────────────────────────────────────────────────────────
export async function getInspectionByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(inspectionChecklists)
    .where(eq(inspectionChecklists.bookingId, bookingId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertInspection(data: InsertInspectionChecklist) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(inspectionChecklists)
    .where(eq(inspectionChecklists.bookingId, data.bookingId))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(inspectionChecklists)
      .set({ ...data })
      .where(eq(inspectionChecklists.bookingId, data.bookingId));
  } else {
    await db.insert(inspectionChecklists).values(data);
  }
}
