import {
  bigint,
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Pricing ────────────────────────────────────────────────────────────────
export const pricing = mysqlTable("pricing", {
  id: int("id").autoincrement().primaryKey(),
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull().default("89.00"),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cartName: varchar("cartName", { length: 128 }).notNull().default("Breezy Golf Cart"),
  cartDescription: text("cartDescription"),
  cartImageUrl: text("cartImageUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pricing = typeof pricing.$inferSelect;

// ─── Availability Blocks ─────────────────────────────────────────────────────
export const availabilityBlocks = mysqlTable("availability_blocks", {
  id: int("id").autoincrement().primaryKey(),
  blockDate: date("blockDate").notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AvailabilityBlock = typeof availabilityBlocks.$inferSelect;

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingRef: varchar("bookingRef", { length: 16 }).notNull().unique(),
  // Guest info
  guestName: varchar("guestName", { length: 128 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 32 }).notNull(),
  airbnbBookingName: varchar("airbnbBookingName", { length: 128 }).notNull(),
  // Dates
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  totalDays: int("totalDays").notNull(),
  // Pricing snapshot
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  // Status
  bookingStatus: mysqlEnum("bookingStatus", [
    "pending_payment",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "completed",
    "cancelled",
  ])
    .notNull()
    .default("pending_payment"),
  documentStatus: mysqlEnum("documentStatus", [
    "pending",
    "received",
    "needs_update",
    "approved",
  ])
    .notNull()
    .default("pending"),
  // Admin notes
  adminNotes: text("adminNotes"),
  rejectionReason: text("rejectionReason"),
  // Stripe
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Documents ───────────────────────────────────────────────────────────────
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  documentType: mysqlEnum("documentType", ["drivers_license", "proof_of_insurance"]).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 256 }),
  mimeType: varchar("mimeType", { length: 64 }),
  fileSize: bigint("fileSize", { mode: "number" }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ─── Waiver Signatures ───────────────────────────────────────────────────────
export const waiverSignatures = mysqlTable("waiver_signatures", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  legalName: varchar("legalName", { length: 256 }).notNull(),
  agreedToTerms: boolean("agreedToTerms").notNull().default(false),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  signedAt: timestamp("signedAt").defaultNow().notNull(),
});

export type WaiverSignature = typeof waiverSignatures.$inferSelect;
export type InsertWaiverSignature = typeof waiverSignatures.$inferInsert;
