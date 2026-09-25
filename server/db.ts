import { and, desc, eq, gt, gte, lte, ne, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool, type PoolOptions } from "mysql2/promise";
import * as emergencyStore from "./blobEmergencyStore";
import { ensureDatabaseSchema } from "./dbBootstrap";
import {
  availabilityBlocks,
  bookingMessages,
  bookings,
  documents,
  inspectionChecklists,
  inspectionPhotos,
  smsNotifications,
  InsertBooking,
  InsertBookingMessage,
  InsertDocument,
  InsertInspectionChecklist,
  InsertInspectionPhoto,
  InsertSmsNotification,
  InsertUser,
  InsertWaiverSignature,
  pricing,
  users,
  waiverSignatures,
} from "../drizzle/schema";

type Database = ReturnType<typeof drizzle<Record<string, never>, Pool>>;
type DbUser = typeof users.$inferSelect;
type DbPricing = typeof pricing.$inferSelect;
type DbAvailabilityBlock = typeof availabilityBlocks.$inferSelect;
type DbBooking = typeof bookings.$inferSelect;
type DbDocument = typeof documents.$inferSelect;
type DbWaiverSignature = typeof waiverSignatures.$inferSelect;
type DbBookingMessage = typeof bookingMessages.$inferSelect;
type DbInspectionChecklist = typeof inspectionChecklists.$inferSelect;
type DbSmsNotification = typeof smsNotifications.$inferSelect;
type DbInspectionPhoto = typeof inspectionPhotos.$inferSelect;
// The emergency store serializes the same persisted records as Drizzle. Keep
// its implementation detail behind this adapter boundary.
const emergency: any = emergencyStore;

const TIDB_HOST_PATTERN = /(^|\.)tidbcloud\.com$/i;
const DATABASE_CONNECT_TIMEOUT_MS = 8_000;
const DATABASE_RETRY_DELAY_MS = 60_000;

let _db: Database | null = null;
let _connectionPromise: Promise<Database | null> | null = null;
let _databaseUnavailableUntil = 0;

/**
 * Builds a small, serverless-safe MySQL pool configuration. TiDB Cloud public
 * endpoints require TLS; mysql2 does not reliably infer that requirement from
 * a bare mysql:// URL, so it is enforced here instead of trusting a deployment
 * dashboard setting or a URL query parameter.
 */
export function buildDatabaseConnectionOptions(databaseUrl: string): PoolOptions {
  const parsed = new URL(databaseUrl);
  const isTiDBCloud = TIDB_HOST_PATTERN.test(parsed.hostname);

  if (isTiDBCloud) {
    // Remove URL-level SSL flags before supplying the typed mysql2 option.
    // mysql2 rejects values such as "ssl=true", while TiDB requires TLS.
    parsed.searchParams.delete("ssl");
    parsed.searchParams.delete("ssl-mode");
    parsed.searchParams.delete("sslMode");
  }

  return {
    uri: parsed.toString(),
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 30_000,
    queueLimit: 0,
    connectTimeout: DATABASE_CONNECT_TIMEOUT_MS,
    enableKeepAlive: true,
    ...(isTiDBCloud
      ? {
          ssl: {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
            verifyIdentity: true,
          },
        }
      : {}),
  };
}

async function connectDatabase(databaseUrl: string): Promise<Database | null> {
  const pool = createPool(buildDatabaseConnectionOptions(databaseUrl));

  try {
    // Establish the connection now, rather than letting the first customer
    // request discover a malformed URL, expired password, or missing TLS.
    await pool.query("SELECT 1");
    await ensureDatabaseSchema(pool);
    return drizzle({ client: pool });
  } catch (error) {
    await pool.end().catch(() => undefined);
    _databaseUnavailableUntil = Date.now() + DATABASE_RETRY_DELAY_MS;
    const message = error instanceof Error ? error.message : "Unknown connection error";
    console.error("[Database] Connection health check failed:", message);
    return null;
  }
}

export async function getDb(): Promise<Database | null> {
  if (_db) return _db;
  if (Date.now() < _databaseUnavailableUntil) return null;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[Database] DATABASE_URL is not configured");
    return null;
  }

  if (!_connectionPromise) {
    _connectionPromise = connectDatabase(databaseUrl).then((database) => {
      _db = database;
      return database;
    });
  }

  try {
    return await _connectionPromise;
  } finally {
    _connectionPromise = null;
  }
}

/** Used by the production readiness endpoint and deployment smoke checks. */
export async function isDatabaseReady(): Promise<boolean> {
  const db = await getDb();
  if (!db) return emergency.isEmergencyStoreReady();

  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown query error";
    console.error("[Database] Readiness check failed:", message);
    _db = null;
    return false;
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────
import { ENV } from "./_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    await emergency.upsertUser(user);
    return;
  }

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

export async function getUserByOpenId(openId: string): Promise<DbUser | undefined> {
  const db = await getDb();
  if (!db) return emergency.getUserByOpenId(openId);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
export async function getPricing(): Promise<DbPricing | null> {
  const db = await getDb();
  if (!db) return emergency.getPricing();
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
  if (!db) {
    await emergency.updatePricing(data);
    return;
  }
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
export async function getBlockedDates(): Promise<DbAvailabilityBlock[]> {
  const db = await getDb();
  if (!db) return emergency.getBlockedDates();
  return db.select().from(availabilityBlocks);
}

export async function addBlockedDate(blockDate: string, reason?: string) {
  const db = await getDb();
  if (!db) {
    await emergency.addBlockedDate(blockDate, reason);
    return;
  }
  // blockDate is YYYY-MM-DD; convert to Date for drizzle
  const dateObj = new Date(blockDate + "T12:00:00Z");
  await db.insert(availabilityBlocks).values({ blockDate: dateObj, reason });
}

export async function removeBlockedDate(id: number) {
  const db = await getDb();
  if (!db) {
    await emergency.removeBlockedDate(id);
    return;
  }
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
}

export async function getApprovedBookingDates(): Promise<Array<{ startDate: Date; endDate: Date }>> {
  const db = await getDb();
  if (!db) return emergency.getApprovedBookingDates();
  return db
    .select({ startDate: bookings.startDate, endDate: bookings.endDate })
    .from(bookings)
    .where(eq(bookings.bookingStatus, "approved"));
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export async function createBooking(data: InsertBooking): Promise<DbBooking | undefined> {
  const db = await getDb();
  if (!db) return emergency.createBooking(data);
  await db.insert(bookings).values(data);
  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingRef, data.bookingRef!))
    .limit(1);
  return result[0];
}

export async function getBookingByRef(bookingRef: string): Promise<DbBooking | null> {
  const db = await getDb();
  if (!db) return emergency.getBookingByRef(bookingRef);
  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingRef, bookingRef))
    .limit(1);
  return result[0] ?? null;
}

export async function getBookingById(id: number): Promise<DbBooking | null> {
  const db = await getDb();
  if (!db) return emergency.getBookingById(id);
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllBookings(): Promise<DbBooking[]> {
  const db = await getDb();
  if (!db) return emergency.getAllBookings();
  return db.select().from(bookings).orderBy(bookings.createdAt);
}

export async function updateBookingStatus(
  id: number,
  bookingStatus: string,
  opts?: { adminNotes?: string; rejectionReason?: string }
) {
  const db = await getDb();
  if (!db) {
    await emergency.updateBookingStatus(id, bookingStatus, opts);
    return;
  }
  await db
    .update(bookings)
    .set({ bookingStatus: bookingStatus as any, ...opts })
    .where(eq(bookings.id, id));
}

/** Permanently delete a booking and related records (admin cleanup for test entries). */
export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) {
    await emergency.deleteBooking(id);
    return;
  }
  await db.delete(bookingMessages).where(eq(bookingMessages.bookingId, id));
  await db.delete(documents).where(eq(documents.bookingId, id));
  await db.delete(waiverSignatures).where(eq(waiverSignatures.bookingId, id));
  await db.delete(inspectionChecklists).where(eq(inspectionChecklists.bookingId, id));
  await db.delete(inspectionPhotos).where(eq(inspectionPhotos.bookingId, id));
  await db.delete(smsNotifications).where(eq(smsNotifications.bookingId, id));
  await db.delete(bookings).where(eq(bookings.id, id));
}

export async function updateDocumentStatus(id: number, documentStatus: string) {
  const db = await getDb();
  if (!db) {
    await emergency.updateDocumentStatus(id, documentStatus);
    return;
  }
  await db
    .update(bookings)
    .set({ documentStatus: documentStatus as any })
    .where(eq(bookings.id, id));
}

export async function updateBookingStripe(
  bookingRef: string,
  stripeSessionId: string,
  stripePaymentIntentId?: string,
  amountPaid?: number
) {
  const db = await getDb();
  if (!db) {
    await emergency.updateBookingStripe(bookingRef, stripeSessionId, stripePaymentIntentId, amountPaid);
    return;
  }
  const updateData: Record<string, unknown> = {
    stripeSessionId,
    stripePaymentIntentId: stripePaymentIntentId ?? null,
    bookingStatus: "submitted",
    paidAt: new Date(),
  };
  if (amountPaid !== undefined) {
    // Read the current totalAmount so we can preserve it as originalAmount if a discount was applied.
    const existing = await db
      .select({ totalAmount: bookings.totalAmount })
      .from(bookings)
      .where(eq(bookings.bookingRef, bookingRef))
      .limit(1);
    const currentTotal = existing[0]?.totalAmount;
    const paidFormatted = (amountPaid / 100).toFixed(2);
    // Only record originalAmount when the paid amount differs (coupon/discount was used)
    /*
    if (currentTotal && parseFloat(currentTotal.toString()) !== parseFloat(paidFormatted)) {
      updateData.originalAmount = parseFloat(currentTotal.toString()).toFixed(2);
    }
    */
    updateData.totalAmount = paidFormatted;
  }
  await db
    .update(bookings)
    .set(updateData as any)
    .where(eq(bookings.bookingRef, bookingRef));
}

// ─── Documents ────────────────────────────────────────────────────────────────
export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) {
    await emergency.createDocument(data);
    return;
  }
  await db.insert(documents).values(data);
}

export async function getDocumentsByBookingId(bookingId: number): Promise<DbDocument[]> {
  const db = await getDb();
  if (!db) return emergency.getDocumentsByBookingId(bookingId);
  return db.select().from(documents).where(eq(documents.bookingId, bookingId));
}

// ─── Waiver Signatures ────────────────────────────────────────────────────────
export async function createWaiverSignature(data: InsertWaiverSignature) {
  const db = await getDb();
  if (!db) {
    await emergency.createWaiverSignature(data);
    return;
  }
  await db.insert(waiverSignatures).values(data);
}

export async function getWaiverByBookingId(bookingId: number): Promise<DbWaiverSignature | null> {
  const db = await getDb();
  if (!db) return emergency.getWaiverByBookingId(bookingId);
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
  if (!db) {
    await emergency.createMessage(data);
    return;
  }
  await db.insert(bookingMessages).values(data);
}

export async function getMessagesByBookingId(bookingId: number): Promise<DbBookingMessage[]> {
  const db = await getDb();
  if (!db) return emergency.getMessagesByBookingId(bookingId);
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
  if (!db) {
    await emergency.markMessagesRead(bookingId, readerRole);
    return;
  }
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

export async function getUnreadCountForAdmin(): Promise<Record<number, number>> {
  // Returns map of bookingId -> unread count (messages from guests not yet read by admin)
  const db = await getDb();
  if (!db) return emergency.getUnreadCountForAdmin();
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
export async function getInspectionByBookingId(bookingId: number): Promise<DbInspectionChecklist | null> {
  const db = await getDb();
  if (!db) return emergency.getInspectionByBookingId(bookingId);
  const result = await db
    .select()
    .from(inspectionChecklists)
    .where(eq(inspectionChecklists.bookingId, bookingId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertInspection(data: InsertInspectionChecklist) {
  const db = await getDb();
  if (!db) {
    await emergency.upsertInspection(data);
    return;
  }
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

// ─── SMS Notifications ─────────────────────────────────────────────────────────
export async function createSmsNotification(data: InsertSmsNotification) {
  const db = await getDb();
  if (!db) {
    await emergency.createSmsNotification(data);
    return;
  }
  await db.insert(smsNotifications).values(data);
}

export async function getSmsNotificationsByBooking(bookingId: number): Promise<DbSmsNotification[]> {
  const db = await getDb();
  if (!db) return emergency.getSmsNotificationsByBooking(bookingId);
  return db
    .select()
    .from(smsNotifications)
    .where(eq(smsNotifications.bookingId, bookingId));
}

// ─── Inspection Photos ─────────────────────────────────────────────────────────
export async function createInspectionPhoto(data: InsertInspectionPhoto) {
  const db = await getDb();
  if (!db) {
    await emergency.createInspectionPhoto(data);
    return;
  }
  await db.insert(inspectionPhotos).values(data);
}

export async function getInspectionPhotosByBooking(bookingId: number): Promise<DbInspectionPhoto[]> {
  const db = await getDb();
  if (!db) return emergency.getInspectionPhotosByBooking(bookingId);
  return db
    .select()
    .from(inspectionPhotos)
    .where(eq(inspectionPhotos.bookingId, bookingId));
}

// ─── Revenue Report ────────────────────────────────────────────────────────────
export async function getMonthlyRevenue(year: number, month: number) {
  const db = await getDb();
  if (!db) return emergency.getMonthlyRevenue(year, month);
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const result = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.startDate, startDate),
        lte(bookings.endDate, endDate),
        eq(bookings.bookingStatus, "approved")
      )
    );
  
  const totalRevenue = result.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);
  
  return {
    totalRevenue,
    totalBookings: result.length,
    bookings: result,
  };
}
