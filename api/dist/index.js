"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/const.ts
var const_exports = {};
__export(const_exports, {
  AXIOS_TIMEOUT_MS: () => AXIOS_TIMEOUT_MS,
  COOKIE_NAME: () => COOKIE_NAME,
  NOT_ADMIN_ERR_MSG: () => NOT_ADMIN_ERR_MSG,
  ONE_YEAR_MS: () => ONE_YEAR_MS,
  UNAUTHED_ERR_MSG: () => UNAUTHED_ERR_MSG
});
var COOKIE_NAME, ONE_YEAR_MS, AXIOS_TIMEOUT_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    AXIOS_TIMEOUT_MS = 3e4;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
  }
});

// drizzle/schema.ts
var import_mysql_core, users, pricing, availabilityBlocks, bookings, documents, waiverSignatures, bookingMessages, inspectionChecklists, smsNotifications, inspectionPhotos;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    import_mysql_core = require("drizzle-orm/mysql-core");
    users = (0, import_mysql_core.mysqlTable)("users", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      openId: (0, import_mysql_core.varchar)("openId", { length: 64 }).notNull().unique(),
      name: (0, import_mysql_core.text)("name"),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }),
      loginMethod: (0, import_mysql_core.varchar)("loginMethod", { length: 64 }),
      role: (0, import_mysql_core.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: (0, import_mysql_core.timestamp)("lastSignedIn").defaultNow().notNull()
    });
    pricing = (0, import_mysql_core.mysqlTable)("pricing", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      dailyRate: (0, import_mysql_core.decimal)("dailyRate", { precision: 10, scale: 2 }).notNull().default("160.00"),
      deliveryFee: (0, import_mysql_core.decimal)("deliveryFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
      cartName: (0, import_mysql_core.varchar)("cartName", { length: 128 }).notNull().default("Breezy Golf Cart"),
      cartDescription: (0, import_mysql_core.text)("cartDescription"),
      cartImageUrl: (0, import_mysql_core.text)("cartImageUrl"),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    availabilityBlocks = (0, import_mysql_core.mysqlTable)("availability_blocks", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      blockDate: (0, import_mysql_core.date)("blockDate").notNull(),
      reason: (0, import_mysql_core.varchar)("reason", { length: 255 }),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    bookings = (0, import_mysql_core.mysqlTable)("bookings", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingRef: (0, import_mysql_core.varchar)("bookingRef", { length: 16 }).notNull().unique(),
      // Guest info
      guestName: (0, import_mysql_core.varchar)("guestName", { length: 128 }).notNull(),
      guestEmail: (0, import_mysql_core.varchar)("guestEmail", { length: 320 }).notNull(),
      guestPhone: (0, import_mysql_core.varchar)("guestPhone", { length: 32 }).notNull(),
      airbnbBookingName: (0, import_mysql_core.varchar)("airbnbBookingName", { length: 128 }),
      // Dates
      startDate: (0, import_mysql_core.date)("startDate").notNull(),
      endDate: (0, import_mysql_core.date)("endDate").notNull(),
      totalDays: (0, import_mysql_core.int)("totalDays").notNull(),
      // Pricing snapshot
      dailyRate: (0, import_mysql_core.decimal)("dailyRate", { precision: 10, scale: 2 }).notNull(),
      deliveryFee: (0, import_mysql_core.decimal)("deliveryFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
      totalAmount: (0, import_mysql_core.decimal)("totalAmount", { precision: 10, scale: 2 }).notNull(),
      // Status
      bookingStatus: (0, import_mysql_core.mysqlEnum)("bookingStatus", [
        "pending_payment",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "completed",
        "cancelled"
      ]).notNull().default("pending_payment"),
      documentStatus: (0, import_mysql_core.mysqlEnum)("documentStatus", [
        "pending",
        "received",
        "needs_update",
        "approved"
      ]).notNull().default("pending"),
      // Admin notes
      adminNotes: (0, import_mysql_core.text)("adminNotes"),
      rejectionReason: (0, import_mysql_core.text)("rejectionReason"),
      // Stripe
      stripeSessionId: (0, import_mysql_core.varchar)("stripeSessionId", { length: 256 }),
      stripePaymentIntentId: (0, import_mysql_core.varchar)("stripePaymentIntentId", { length: 256 }),
      // Timestamps
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
      paidAt: (0, import_mysql_core.timestamp)("paidAt")
    });
    documents = (0, import_mysql_core.mysqlTable)("documents", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingId: (0, import_mysql_core.int)("bookingId").notNull(),
      documentType: (0, import_mysql_core.mysqlEnum)("documentType", ["drivers_license", "proof_of_insurance"]).notNull(),
      fileKey: (0, import_mysql_core.varchar)("fileKey", { length: 512 }).notNull(),
      fileUrl: (0, import_mysql_core.text)("fileUrl").notNull(),
      fileName: (0, import_mysql_core.varchar)("fileName", { length: 256 }),
      mimeType: (0, import_mysql_core.varchar)("mimeType", { length: 64 }),
      fileSize: (0, import_mysql_core.bigint)("fileSize", { mode: "number" }),
      uploadedAt: (0, import_mysql_core.timestamp)("uploadedAt").defaultNow().notNull()
    });
    waiverSignatures = (0, import_mysql_core.mysqlTable)("waiver_signatures", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingId: (0, import_mysql_core.int)("bookingId").notNull(),
      legalName: (0, import_mysql_core.varchar)("legalName", { length: 256 }).notNull(),
      agreedToTerms: (0, import_mysql_core.boolean)("agreedToTerms").notNull().default(false),
      ipAddress: (0, import_mysql_core.varchar)("ipAddress", { length: 64 }),
      userAgent: (0, import_mysql_core.text)("userAgent"),
      signedAt: (0, import_mysql_core.timestamp)("signedAt").defaultNow().notNull()
    });
    bookingMessages = (0, import_mysql_core.mysqlTable)("booking_messages", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingId: (0, import_mysql_core.int)("bookingId").notNull(),
      senderRole: (0, import_mysql_core.mysqlEnum)("senderRole", ["admin", "guest"]).notNull(),
      senderName: (0, import_mysql_core.varchar)("senderName", { length: 128 }).notNull(),
      content: (0, import_mysql_core.text)("content").notNull(),
      isRead: (0, import_mysql_core.boolean)("isRead").notNull().default(false),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    inspectionChecklists = (0, import_mysql_core.mysqlTable)("inspection_checklists", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingId: (0, import_mysql_core.int)("bookingId").notNull().unique(),
      // one checklist per booking
      completedBy: (0, import_mysql_core.varchar)("completedBy", { length: 128 }).notNull(),
      // Individual checklist items (true = passed)
      batteryCharged: (0, import_mysql_core.boolean)("batteryCharged").notNull().default(false),
      tiresInflated: (0, import_mysql_core.boolean)("tiresInflated").notNull().default(false),
      brakesWorking: (0, import_mysql_core.boolean)("brakesWorking").notNull().default(false),
      steeringWorking: (0, import_mysql_core.boolean)("steeringWorking").notNull().default(false),
      signalLightsWorking: (0, import_mysql_core.boolean)("signalLightsWorking").notNull().default(false),
      brakeLightsWorking: (0, import_mysql_core.boolean)("brakeLightsWorking").notNull().default(false),
      headlightsWorking: (0, import_mysql_core.boolean)("headlightsWorking").notNull().default(false),
      bodyFrameOk: (0, import_mysql_core.boolean)("bodyFrameOk").notNull().default(false),
      seatbeltsOk: (0, import_mysql_core.boolean)("seatbeltsOk").notNull().default(false),
      cleanAndReady: (0, import_mysql_core.boolean)("cleanAndReady").notNull().default(false),
      notes: (0, import_mysql_core.text)("notes"),
      completedAt: (0, import_mysql_core.timestamp)("completedAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    smsNotifications = (0, import_mysql_core.mysqlTable)("sms_notifications", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingId: (0, import_mysql_core.int)("bookingId").notNull(),
      notificationType: (0, import_mysql_core.mysqlEnum)("notificationType", ["approval_confirmation", "reminder_24h"]).notNull(),
      phoneNumber: (0, import_mysql_core.varchar)("phoneNumber", { length: 32 }).notNull(),
      messageContent: (0, import_mysql_core.text)("messageContent").notNull(),
      sentAt: (0, import_mysql_core.timestamp)("sentAt").defaultNow().notNull(),
      status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "sent", "failed"]).notNull().default("pending"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    inspectionPhotos = (0, import_mysql_core.mysqlTable)("inspection_photos", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      bookingId: (0, import_mysql_core.int)("bookingId").notNull(),
      photoType: (0, import_mysql_core.mysqlEnum)("photoType", ["before", "after"]).notNull(),
      photoUrl: (0, import_mysql_core.text)("photoUrl").notNull(),
      fileKey: (0, import_mysql_core.varchar)("fileKey", { length: 255 }).notNull(),
      uploadedAt: (0, import_mysql_core.timestamp)("uploadedAt").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      adminEmail: process.env.ADMIN_EMAIL ?? "",
      adminPassword: process.env.ADMIN_PASSWORD ?? "",
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addBlockedDate: () => addBlockedDate,
  createBooking: () => createBooking,
  createDocument: () => createDocument,
  createInspectionPhoto: () => createInspectionPhoto,
  createMessage: () => createMessage,
  createSmsNotification: () => createSmsNotification,
  createWaiverSignature: () => createWaiverSignature,
  getAllBookings: () => getAllBookings,
  getApprovedBookingDates: () => getApprovedBookingDates,
  getBlockedDates: () => getBlockedDates,
  getBookingById: () => getBookingById,
  getBookingByRef: () => getBookingByRef,
  getDb: () => getDb,
  getDocumentsByBookingId: () => getDocumentsByBookingId,
  getInspectionByBookingId: () => getInspectionByBookingId,
  getInspectionPhotosByBooking: () => getInspectionPhotosByBooking,
  getMessagesByBookingId: () => getMessagesByBookingId,
  getMonthlyRevenue: () => getMonthlyRevenue,
  getPricing: () => getPricing,
  getSmsNotificationsByBooking: () => getSmsNotificationsByBooking,
  getUnreadCountForAdmin: () => getUnreadCountForAdmin,
  getUserByOpenId: () => getUserByOpenId,
  getWaiverByBookingId: () => getWaiverByBookingId,
  markMessagesRead: () => markMessagesRead,
  removeBlockedDate: () => removeBlockedDate,
  updateBookingStatus: () => updateBookingStatus,
  updateBookingStripe: () => updateBookingStripe,
  updateDocumentStatus: () => updateDocumentStatus,
  updatePricing: () => updatePricing,
  upsertInspection: () => upsertInspection,
  upsertUser: () => upsertUser
});
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = (0, import_mysql2.drizzle)(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  const assignNullable = (field) => {
    const value = user[field];
    if (value === void 0) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPricing() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pricing).limit(1);
  return result[0] ?? null;
}
async function updatePricing(data) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(pricing).limit(1);
  if (existing.length === 0) {
    await db.insert(pricing).values({
      dailyRate: data.dailyRate ?? "170.00",
      deliveryFee: data.deliveryFee ?? "0.00",
      cartName: data.cartName ?? "Breezy Golf Cart",
      cartDescription: data.cartDescription ?? null,
      cartImageUrl: data.cartImageUrl ?? null
    });
  } else {
    await db.update(pricing).set(data).where((0, import_drizzle_orm.eq)(pricing.id, existing[0].id));
  }
}
async function getBlockedDates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(availabilityBlocks);
}
async function addBlockedDate(blockDate, reason) {
  const db = await getDb();
  if (!db) return;
  const dateObj = /* @__PURE__ */ new Date(blockDate + "T12:00:00Z");
  await db.insert(availabilityBlocks).values({ blockDate: dateObj, reason });
}
async function removeBlockedDate(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(availabilityBlocks).where((0, import_drizzle_orm.eq)(availabilityBlocks.id, id));
}
async function getApprovedBookingDates() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ startDate: bookings.startDate, endDate: bookings.endDate }).from(bookings).where((0, import_drizzle_orm.eq)(bookings.bookingStatus, "approved"));
}
async function createBooking(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(bookings).values(data);
  const result = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.bookingRef, data.bookingRef)).limit(1);
  return result[0];
}
async function getBookingByRef(bookingRef) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.bookingRef, bookingRef)).limit(1);
  return result[0] ?? null;
}
async function getBookingById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.id, id)).limit(1);
  return result[0] ?? null;
}
async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(bookings.createdAt);
}
async function updateBookingStatus(id, bookingStatus, opts) {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({ bookingStatus, ...opts }).where((0, import_drizzle_orm.eq)(bookings.id, id));
}
async function updateDocumentStatus(id, documentStatus) {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({ documentStatus }).where((0, import_drizzle_orm.eq)(bookings.id, id));
}
async function updateBookingStripe(bookingRef, stripeSessionId, stripePaymentIntentId) {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({
    stripeSessionId,
    stripePaymentIntentId: stripePaymentIntentId ?? null,
    bookingStatus: "submitted",
    paidAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm.eq)(bookings.bookingRef, bookingRef));
}
async function createDocument(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(documents).values(data);
}
async function getDocumentsByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where((0, import_drizzle_orm.eq)(documents.bookingId, bookingId));
}
async function createWaiverSignature(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(waiverSignatures).values(data);
}
async function getWaiverByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(waiverSignatures).where((0, import_drizzle_orm.eq)(waiverSignatures.bookingId, bookingId)).limit(1);
  return result[0] ?? null;
}
async function createMessage(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(bookingMessages).values(data);
}
async function getMessagesByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookingMessages).where((0, import_drizzle_orm.eq)(bookingMessages.bookingId, bookingId)).orderBy(bookingMessages.createdAt);
}
async function markMessagesRead(bookingId, readerRole) {
  const senderRole = readerRole === "admin" ? "guest" : "admin";
  const db = await getDb();
  if (!db) return;
  await db.update(bookingMessages).set({ isRead: true }).where(
    (0, import_drizzle_orm.and)(
      (0, import_drizzle_orm.eq)(bookingMessages.bookingId, bookingId),
      (0, import_drizzle_orm.eq)(bookingMessages.senderRole, senderRole),
      (0, import_drizzle_orm.eq)(bookingMessages.isRead, false)
    )
  );
}
async function getUnreadCountForAdmin() {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(bookingMessages).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(bookingMessages.senderRole, "guest"), (0, import_drizzle_orm.eq)(bookingMessages.isRead, false)));
  const counts = {};
  for (const row of rows) {
    counts[row.bookingId] = (counts[row.bookingId] ?? 0) + 1;
  }
  return counts;
}
async function getInspectionByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(inspectionChecklists).where((0, import_drizzle_orm.eq)(inspectionChecklists.bookingId, bookingId)).limit(1);
  return result[0] ?? null;
}
async function upsertInspection(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(inspectionChecklists).where((0, import_drizzle_orm.eq)(inspectionChecklists.bookingId, data.bookingId)).limit(1);
  if (existing.length > 0) {
    await db.update(inspectionChecklists).set({ ...data }).where((0, import_drizzle_orm.eq)(inspectionChecklists.bookingId, data.bookingId));
  } else {
    await db.insert(inspectionChecklists).values(data);
  }
}
async function createSmsNotification(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(smsNotifications).values(data);
}
async function getSmsNotificationsByBooking(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(smsNotifications).where((0, import_drizzle_orm.eq)(smsNotifications.bookingId, bookingId));
}
async function createInspectionPhoto(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(inspectionPhotos).values(data);
}
async function getInspectionPhotosByBooking(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inspectionPhotos).where((0, import_drizzle_orm.eq)(inspectionPhotos.bookingId, bookingId));
}
async function getMonthlyRevenue(year, month) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalBookings: 0, bookings: [] };
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const result = await db.select().from(bookings).where(
    (0, import_drizzle_orm.and)(
      (0, import_drizzle_orm.gte)(bookings.startDate, startDate),
      (0, import_drizzle_orm.lte)(bookings.endDate, endDate),
      (0, import_drizzle_orm.eq)(bookings.bookingStatus, "approved")
    )
  );
  const totalRevenue = result.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);
  return {
    totalRevenue,
    totalBookings: result.length,
    bookings: result
  };
}
var import_drizzle_orm, import_mysql2, _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_mysql2 = require("drizzle-orm/mysql2");
    init_schema();
    init_env();
    _db = null;
  }
});

// shared/_core/errors.ts
var HttpError, ForbiddenError;
var init_errors = __esm({
  "shared/_core/errors.ts"() {
    "use strict";
    HttpError = class extends Error {
      constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
      }
    };
    ForbiddenError = (msg) => new HttpError(403, msg);
  }
});

// server/_core/sdk.ts
var sdk_exports = {};
__export(sdk_exports, {
  sdk: () => sdk
});
var import_axios, import_cookie, import_jose, isNonEmptyString, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, OAuthService, createOAuthHttpClient, SDKServer, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    import_axios = __toESM(require("axios"), 1);
    import_cookie = require("cookie");
    import_jose = require("jose");
    init_db();
    init_env();
    isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
    EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
    GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
    GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
    OAuthService = class {
      constructor(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
          console.error(
            "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
          );
        }
      }
      decodeState(state) {
        const redirectUri = atob(state);
        return redirectUri;
      }
      async getTokenByCode(code, state) {
        const payload = {
          clientId: ENV.appId,
          grantType: "authorization_code",
          code,
          redirectUri: this.decodeState(state)
        };
        const { data } = await this.client.post(
          EXCHANGE_TOKEN_PATH,
          payload
        );
        return data;
      }
      async getUserInfoByToken(token) {
        const { data } = await this.client.post(
          GET_USER_INFO_PATH,
          {
            accessToken: token.accessToken
          }
        );
        return data;
      }
    };
    createOAuthHttpClient = () => import_axios.default.create({
      baseURL: ENV.oAuthServerUrl,
      timeout: AXIOS_TIMEOUT_MS
    });
    SDKServer = class {
      client;
      oauthService;
      constructor(client = createOAuthHttpClient()) {
        this.client = client;
        this.oauthService = new OAuthService(this.client);
      }
      deriveLoginMethod(platforms, fallback) {
        if (fallback && fallback.length > 0) return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0) return null;
        const set = new Set(
          platforms.filter((p) => typeof p === "string")
        );
        if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
          return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
        const first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
      }
      /**
       * Exchange OAuth authorization code for access token
       * @example
       * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
       */
      async exchangeCodeForToken(code, state) {
        return this.oauthService.getTokenByCode(code, state);
      }
      /**
       * Get user information using access token
       * @example
       * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
       */
      async getUserInfo(accessToken) {
        const data = await this.oauthService.getUserInfoByToken({
          accessToken
        });
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = (0, import_cookie.parse)(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        const secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
      }
      /**
       * Create a session token for a Manus user openId
       * @example
       * const sessionToken = await sdk.createSessionToken(userInfo.openId);
       */
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            appId: ENV.appId,
            name: options.name || ""
          },
          options
        );
      }
      async signSession(payload, options = {}) {
        const issuedAt = Date.now();
        const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
        const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
        const secretKey = this.getSessionSecret();
        return new import_jose.SignJWT({
          openId: payload.openId,
          appId: payload.appId,
          name: payload.name
        }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
      }
      async verifySession(cookieValue) {
        if (!cookieValue) {
          console.warn("[Auth] Missing session cookie");
          return null;
        }
        try {
          const secretKey = this.getSessionSecret();
          const { payload } = await (0, import_jose.jwtVerify)(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          const { openId, appId, name } = payload;
          if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            appId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async getUserInfoWithJwt(jwtToken) {
        const payload = {
          jwtToken,
          projectId: ENV.appId
        };
        const { data } = await this.client.post(
          GET_USER_INFO_WITH_JWT_PATH,
          payload
        );
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      async authenticateRequest(req) {
        const cookies = this.parseCookies(req.headers.cookie);
        const sessionCookie = cookies.get(COOKIE_NAME);
        const session = await this.verifySession(sessionCookie);
        if (!session) {
          throw ForbiddenError("Invalid session cookie");
        }
        const sessionUserId = session.openId;
        const signedInAt = /* @__PURE__ */ new Date();
        let user = await getUserByOpenId(sessionUserId);
        if (!user) {
          try {
            const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
            await upsertUser({
              openId: userInfo.openId,
              name: userInfo.name || null,
              email: userInfo.email ?? null,
              loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
              lastSignedIn: signedInAt
            });
            user = await getUserByOpenId(userInfo.openId);
          } catch (error) {
            console.error("[Auth] Failed to sync user from OAuth:", error);
            throw ForbiddenError("Failed to sync user info");
          }
        }
        if (!user) {
          throw ForbiddenError("User not found");
        }
        await upsertUser({
          openId: user.openId,
          lastSignedIn: signedInAt
        });
        return user;
      }
    };
    sdk = new SDKServer();
  }
});

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendEmail: () => sendEmail
});
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[Email] RESEND_API_KEY not set \u2014 skipping email send");
    return null;
  }
  return new import_resend.Resend(key);
}
function formatDate(d) {
  if (!d) return "\u2014";
  const date2 = typeof d === "string" ? new Date(d) : d;
  return date2.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}
async function sendEmail(payload) {
  const resend = getResend();
  if (!resend) return;
  const { type, booking } = payload;
  const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e;`;
  const headerBg = `background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);`;
  const wrapHtml = (title, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f9ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="${headerBg}padding:32px 32px 24px;">
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:sans-serif;">Breezy Coastal Rentals</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;font-family:sans-serif;">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;${baseStyle}">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-family:sans-serif;">Cape Canaveral, FL \xB7 BreezyCoastalRentals.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const bookingCard = `
<table width="100%" style="background:#f0f9ff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #bae6fd;">
  <tr><td style="font-family:sans-serif;">
    <p style="margin:0 0 8px;font-size:12px;color:#0284c7;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0c4a6e;letter-spacing:2px;">${booking.bookingRef}</p>
    <table width="100%">
      <tr>
        <td style="font-size:13px;color:#64748b;padding-bottom:6px;font-family:sans-serif;">Check-in</td>
        <td style="font-size:13px;font-weight:600;color:#1e293b;padding-bottom:6px;text-align:right;font-family:sans-serif;">${formatDate(booking.startDate)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding-bottom:6px;font-family:sans-serif;">Check-out</td>
        <td style="font-size:13px;font-weight:600;color:#1e293b;padding-bottom:6px;text-align:right;font-family:sans-serif;">${formatDate(booking.endDate)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;font-family:sans-serif;">Total Paid</td>
        <td style="font-size:13px;font-weight:700;color:#0284c7;text-align:right;font-family:sans-serif;">$${booking.totalAmount}</td>
      </tr>
    </table>
  </td></tr>
</table>`;
  if (type === "guest_confirmation") {
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Your Breezy Golf Cart is Reserved! \u{1F3D6}\uFE0F \u2014 Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "Booking Received!",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">Your golf cart rental has been submitted and we're reviewing your documents. You'll hear from us shortly!</p>
        ${bookingCard}
        <p style="font-size:14px;color:#64748b;line-height:1.6;font-family:sans-serif;">We'll notify you once your booking is approved. In the meantime, check your booking status anytime:</p>
        <a href="${APP_URL}/booking/status?ref=${booking.bookingRef}" style="display:inline-block;margin-top:16px;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">View Booking Status</a>`
      )
    });
  } else if (type === "guest_approved") {
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Your Golf Cart is Approved! \u{1F389} \u2014 Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "You're All Set! \u{1F334}",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">Great news \u2014 your golf cart rental has been <strong style="color:#16a34a;">approved!</strong> The cart will be ready for you at the property.</p>
        ${bookingCard}
        <p style="font-size:14px;color:#64748b;line-height:1.6;font-family:sans-serif;">Enjoy exploring Cape Canaveral! \u{1F3D6}\uFE0F The beach is just a short ride away.</p>`
      )
    });
  } else if (type === "guest_rejected") {
    const reason = payload.reason;
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Booking Update \u2014 Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "Booking Update",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">Unfortunately, we were unable to approve your golf cart rental booking.</p>
        ${reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:16px 0;"><p style="margin:0;font-size:14px;color:#dc2626;font-family:sans-serif;"><strong>Reason:</strong> ${reason}</p></div>` : ""}
        ${bookingCard}
        <p style="font-size:14px;color:#64748b;line-height:1.6;font-family:sans-serif;">A refund has been initiated and will appear on your statement within 5\u201310 business days. Please contact us if you have any questions.</p>`
      )
    });
  } else if (type === "admin_new_booking") {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Booking: ${booking.guestName} \u2014 Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "New Booking Submitted",
        `<p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">A new golf cart rental booking has been submitted and is awaiting your review.</p>
        ${bookingCard}
        <table width="100%" style="margin-bottom:16px;">
          <tr><td style="font-size:13px;color:#64748b;padding-bottom:6px;font-family:sans-serif;">Guest</td><td style="font-size:13px;font-weight:600;color:#1e293b;text-align:right;font-family:sans-serif;">${booking.guestName}</td></tr>
          <tr><td style="font-size:13px;color:#64748b;padding-bottom:6px;font-family:sans-serif;">Email</td><td style="font-size:13px;color:#1e293b;text-align:right;font-family:sans-serif;">${booking.guestEmail}</td></tr>
          <tr><td style="font-size:13px;color:#64748b;font-family:sans-serif;">Phone</td><td style="font-size:13px;color:#1e293b;text-align:right;font-family:sans-serif;">${booking.guestPhone}</td></tr>
        </table>
        <a href="${APP_URL}/admin" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">Review in Dashboard \u2192</a>`
      )
    });
  } else if (type === "message_from_admin") {
    const msg = payload.messageContent;
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Message from Breezy \u2014 Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "You have a message from Breezy",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 16px;font-family:sans-serif;">You received a message about your golf cart rental:</p>
        <div style="background:#f0f9ff;border-left:4px solid #0284c7;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.6;font-family:sans-serif;">${msg}</p>
        </div>
        <a href="${APP_URL}/booking/status?ref=${booking.bookingRef}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">Reply in Your Booking \u2192</a>`
      )
    });
  } else if (type === "message_from_guest") {
    const msg = payload.messageContent;
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Message from ${booking.guestName} \u2014 Ref #${booking.bookingRef}`,
      html: wrapHtml(
        `Message from ${booking.guestName}`,
        `<p style="font-size:14px;color:#64748b;margin:0 0 16px;font-family:sans-serif;">A guest sent you a message about their booking:</p>
        <div style="background:#f0f9ff;border-left:4px solid #0284c7;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.6;font-family:sans-serif;">${msg}</p>
        </div>
        ${bookingCard}
        <a href="${APP_URL}/admin" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">Reply in Dashboard \u2192</a>`
      )
    });
  }
}
var import_resend, FROM, ADMIN_EMAIL, APP_URL;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    import_resend = require("resend");
    FROM = "Breezy Coastal Rentals <onboarding@resend.dev>";
    ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@breezycoastalrentals.com";
    APP_URL = process.env.APP_URL ?? "https://breezycoastalrentals.com";
  }
});

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_express2 = require("@trpc/server/adapters/express");

// server/_core/oauth.ts
init_const();
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/oauth.ts
init_sdk();
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
init_const();
var import_server3 = require("@trpc/server");
var import_nanoid = require("nanoid");
var import_zod2 = require("zod");
init_db();

// server/_core/systemRouter.ts
var import_zod = require("zod");

// server/_core/notification.ts
var import_server = require("@trpc/server");
init_env();
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
init_const();
var import_server2 = require("@trpc/server");
var import_superjson = __toESM(require("superjson"), 1);
var t = import_server2.initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new import_server2.TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new import_server2.TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    import_zod.z.object({
      timestamp: import_zod.z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    import_zod.z.object({
      title: import_zod.z.string().min(1, "title is required"),
      content: import_zod.z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/storage.ts
init_env();
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers.ts
init_email();
var import_stripe = __toESM(require("stripe"), 1);
init_env();
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new import_server3.TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
  return new import_stripe.default(key, { apiVersion: "2026-03-25.dahlia" });
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    adminLogin: publicProcedure.input(import_zod2.z.object({ email: import_zod2.z.string(), password: import_zod2.z.string() })).mutation(async ({ ctx, input }) => {
      const { adminEmail, adminPassword } = ENV;
      if (!adminEmail || !adminPassword) {
        throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Admin credentials not configured" });
      }
      if (input.email !== adminEmail || input.password !== adminPassword) {
        throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      const ADMIN_OPEN_ID = "admin-local";
      await upsertUser({
        openId: ADMIN_OPEN_ID,
        name: "Admin",
        email: adminEmail,
        role: "admin",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const { sdk: sdk2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
      const { ONE_YEAR_MS: ONE_YEAR_MS2 } = await Promise.resolve().then(() => (init_const(), const_exports));
      const sessionToken = await sdk2.signSession(
        { openId: ADMIN_OPEN_ID, appId: ENV.appId, name: "Admin" },
        { expiresInMs: ONE_YEAR_MS2 }
      );
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS2 });
      return { success: true };
    })
  }),
  // ─── Pricing ───────────────────────────────────────────────────────────────
  pricing: router({
    get: publicProcedure.query(async () => {
      return getPricing();
    }),
    update: adminProcedure2.input(
      import_zod2.z.object({
        dailyRate: import_zod2.z.string().optional(),
        deliveryFee: import_zod2.z.string().optional(),
        cartName: import_zod2.z.string().optional(),
        cartDescription: import_zod2.z.string().optional(),
        cartImageUrl: import_zod2.z.string().optional()
      })
    ).mutation(async ({ input }) => {
      await updatePricing(input);
      return { success: true };
    })
  }),
  // ─── Availability ──────────────────────────────────────────────────────────
  availability: router({
    getBlockedDates: publicProcedure.query(async () => {
      const blocks = await getBlockedDates();
      const approved = await getApprovedBookingDates();
      return { blocks, approvedRanges: approved };
    }),
    addBlock: adminProcedure2.input(import_zod2.z.object({ date: import_zod2.z.string(), reason: import_zod2.z.string().optional() })).mutation(async ({ input }) => {
      await addBlockedDate(input.date, input.reason);
      return { success: true };
    }),
    removeBlock: adminProcedure2.input(import_zod2.z.object({ id: import_zod2.z.number() })).mutation(async ({ input }) => {
      await removeBlockedDate(input.id);
      return { success: true };
    })
  }),
  // ─── Bookings ──────────────────────────────────────────────────────────────
  bookings: router({
    create: publicProcedure.input(
      import_zod2.z.object({
        guestName: import_zod2.z.string().min(2),
        guestEmail: import_zod2.z.string().email(),
        guestPhone: import_zod2.z.string().min(10),
        airbnbBookingName: import_zod2.z.string().optional().default(""),
        startDate: import_zod2.z.string(),
        endDate: import_zod2.z.string(),
        totalDays: import_zod2.z.number().min(1),
        dailyRate: import_zod2.z.string(),
        deliveryFee: import_zod2.z.string(),
        totalAmount: import_zod2.z.string(),
        waiverLegalName: import_zod2.z.string().min(2),
        waiverAgreed: import_zod2.z.boolean(),
        waiverIp: import_zod2.z.string().optional(),
        waiverUserAgent: import_zod2.z.string().optional()
      })
    ).mutation(async ({ input }) => {
      const bookingRef = (0, import_nanoid.nanoid)(10).toUpperCase();
      const booking = await createBooking({
        bookingRef,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        airbnbBookingName: input.airbnbBookingName ?? "",
        startDate: /* @__PURE__ */ new Date(input.startDate + "T12:00:00Z"),
        endDate: /* @__PURE__ */ new Date(input.endDate + "T12:00:00Z"),
        totalDays: input.totalDays,
        dailyRate: input.dailyRate,
        deliveryFee: input.deliveryFee,
        totalAmount: input.totalAmount,
        bookingStatus: "pending_payment",
        documentStatus: "pending"
      });
      await createWaiverSignature({
        bookingId: booking.id,
        legalName: input.waiverLegalName,
        agreedToTerms: input.waiverAgreed,
        ipAddress: input.waiverIp,
        userAgent: input.waiverUserAgent
      });
      return { bookingRef, bookingId: booking.id };
    }),
    getByRef: publicProcedure.input(import_zod2.z.object({ ref: import_zod2.z.string() })).query(async ({ input }) => {
      const booking = await getBookingByRef(input.ref);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      const docs = await getDocumentsByBookingId(booking.id);
      const waiver = await getWaiverByBookingId(booking.id);
      return { booking, documents: docs, waiver };
    }),
    createCheckout: publicProcedure.input(
      import_zod2.z.object({
        bookingRef: import_zod2.z.string(),
        origin: import_zod2.z.string()
      })
    ).mutation(async ({ input }) => {
      const booking = await getBookingByRef(input.bookingRef);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Breezy Coastal Rentals \u2014 Golf Cart Rental`,
                description: `${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""} \u2014 ${booking.startDate} to ${booking.endDate}`
              },
              unit_amount: Math.round(parseFloat(booking.totalAmount) * 100)
            },
            quantity: 1
          },
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Refundable Security Deposit",
                description: "$300 refundable deposit \u2014 returned after cart is inspected at end of rental. Admin releases hold via Stripe dashboard."
              },
              unit_amount: 3e4
            },
            quantity: 1
          }
        ],
        allow_promotion_codes: true,
        metadata: { bookingRef: input.bookingRef },
        success_url: `${input.origin}/booking/confirmation?ref=${input.bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/booking?step=5&ref=${input.bookingRef}`
      });
      return { url: session.url, sessionId: session.id };
    }),
    confirmPayment: publicProcedure.input(import_zod2.z.object({ bookingRef: import_zod2.z.string(), sessionId: import_zod2.z.string() })).mutation(async ({ input }) => {
      const booking = await getBookingByRef(input.bookingRef);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      if (booking.bookingStatus === "pending_payment") {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        if (session.payment_status === "paid") {
          await updateBookingStripe(
            input.bookingRef,
            input.sessionId,
            session.payment_intent
          );
          const updatedBooking = await getBookingByRef(input.bookingRef);
          if (updatedBooking) {
            await sendEmail({
              type: "guest_confirmation",
              booking: updatedBooking
            }).catch(console.error);
            await sendEmail({
              type: "admin_new_booking",
              booking: updatedBooking
            }).catch(console.error);
          }
        }
      }
      const updated = await getBookingByRef(input.bookingRef);
      return { booking: updated };
    })
  }),
  // ─── Documents ─────────────────────────────────────────────────────────────
  documents: router({
    upload: publicProcedure.input(
      import_zod2.z.object({
        bookingId: import_zod2.z.number(),
        documentType: import_zod2.z.enum(["drivers_license", "proof_of_insurance"]),
        fileName: import_zod2.z.string(),
        mimeType: import_zod2.z.string(),
        fileSize: import_zod2.z.number(),
        fileBase64: import_zod2.z.string()
      })
    ).mutation(async ({ input }) => {
      const maxSize = 10 * 1024 * 1024;
      if (input.fileSize > maxSize) {
        throw new import_server3.TRPCError({ code: "BAD_REQUEST", message: "File too large (max 10MB)" });
      }
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(input.mimeType)) {
        throw new import_server3.TRPCError({ code: "BAD_REQUEST", message: "Invalid file type" });
      }
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `documents/${input.bookingId}/${input.documentType}-${(0, import_nanoid.nanoid)(8)}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      await createDocument({
        bookingId: input.bookingId,
        documentType: input.documentType,
        fileKey,
        fileUrl: url,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize
      });
      await updateDocumentStatus(input.bookingId, "received");
      return { url, fileKey };
    })
  }),
  // ─── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    getAllBookings: adminProcedure2.query(async () => {
      return getAllBookings();
    }),
    getBookingDetail: adminProcedure2.input(import_zod2.z.object({ id: import_zod2.z.number() })).query(async ({ input }) => {
      const booking = await getBookingById(input.id);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      const docs = await getDocumentsByBookingId(booking.id);
      const waiver = await getWaiverByBookingId(booking.id);
      return { booking, documents: docs, waiver };
    }),
    updateBookingStatus: adminProcedure2.input(
      import_zod2.z.object({
        id: import_zod2.z.number(),
        status: import_zod2.z.enum(["submitted", "under_review", "approved", "rejected", "completed", "cancelled"]),
        adminNotes: import_zod2.z.string().optional(),
        rejectionReason: import_zod2.z.string().optional()
      })
    ).mutation(async ({ input }) => {
      await updateBookingStatus(input.id, input.status, {
        adminNotes: input.adminNotes,
        rejectionReason: input.rejectionReason
      });
      const booking = await getBookingById(input.id);
      if (booking) {
        if (input.status === "approved") {
          await sendEmail({ type: "guest_approved", booking }).catch(console.error);
        } else if (input.status === "rejected") {
          await sendEmail({
            type: "guest_rejected",
            booking,
            reason: input.rejectionReason
          }).catch(console.error);
        }
      }
      return { success: true };
    }),
    updateDocumentStatus: adminProcedure2.input(import_zod2.z.object({ bookingId: import_zod2.z.number(), status: import_zod2.z.enum(["pending", "received", "needs_update", "approved"]) })).mutation(async ({ input }) => {
      await updateDocumentStatus(input.bookingId, input.status);
      return { success: true };
    }),
    getBookingDetailWithMessages: adminProcedure2.input(import_zod2.z.object({ id: import_zod2.z.number() })).query(async ({ input, ctx }) => {
      const booking = await getBookingById(input.id);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      const docs = await getDocumentsByBookingId(booking.id);
      const waiver = await getWaiverByBookingId(booking.id);
      const messages = await getMessagesByBookingId(booking.id);
      await markMessagesRead(booking.id, "admin");
      return { booking, documents: docs, waiver, messages };
    }),
    sendMessage: adminProcedure2.input(import_zod2.z.object({ bookingId: import_zod2.z.number(), content: import_zod2.z.string().min(1).max(2e3) })).mutation(async ({ input, ctx }) => {
      const booking = await getBookingById(input.bookingId);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      await createMessage({
        bookingId: input.bookingId,
        senderRole: "admin",
        senderName: ctx.user.name ?? "Breezy Admin",
        content: input.content
      });
      await sendEmail({
        type: "message_from_admin",
        booking,
        messageContent: input.content
      }).catch(console.error);
      return { success: true };
    }),
    getUnreadCounts: adminProcedure2.query(async () => {
      return getUnreadCountForAdmin();
    }),
    // ─ Inspection Checklist ───────────────────────────────────────────────────────────────────
    getInspection: adminProcedure2.input(import_zod2.z.object({ bookingId: import_zod2.z.number() })).query(async ({ input }) => {
      return getInspectionByBookingId(input.bookingId);
    }),
    saveInspection: adminProcedure2.input(import_zod2.z.object({
      bookingId: import_zod2.z.number(),
      batteryCharged: import_zod2.z.boolean(),
      tiresInflated: import_zod2.z.boolean(),
      brakesWorking: import_zod2.z.boolean(),
      steeringWorking: import_zod2.z.boolean(),
      signalLightsWorking: import_zod2.z.boolean(),
      brakeLightsWorking: import_zod2.z.boolean(),
      headlightsWorking: import_zod2.z.boolean(),
      bodyFrameOk: import_zod2.z.boolean(),
      seatbeltsOk: import_zod2.z.boolean(),
      cleanAndReady: import_zod2.z.boolean(),
      notes: import_zod2.z.string().max(1e3).optional()
    })).mutation(async ({ input, ctx }) => {
      await upsertInspection({
        ...input,
        completedBy: ctx.user.name ?? "Admin",
        completedAt: /* @__PURE__ */ new Date()
      });
      return { success: true };
    }),
    // ─ Cart Image Upload ────────────────────────────────────────────────────────────────────
    uploadCartImage: adminProcedure2.input(import_zod2.z.object({
      fileName: import_zod2.z.string(),
      mimeType: import_zod2.z.string(),
      fileBase64: import_zod2.z.string()
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `cart-images/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await updatePricing({ cartImageUrl: url });
      return { url };
    }),
    // ─── Inspection Photos ────────────────────────────────────────────────────────
    uploadInspectionPhoto: adminProcedure2.input(
      import_zod2.z.object({
        bookingId: import_zod2.z.number(),
        photoType: import_zod2.z.enum(["before", "after"]),
        fileName: import_zod2.z.string(),
        mimeType: import_zod2.z.string(),
        fileBase64: import_zod2.z.string()
      })
    ).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `inspection/${input.bookingId}/${input.photoType}-${(0, import_nanoid.nanoid)(8)}.jpg`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      await createInspectionPhoto({
        bookingId: input.bookingId,
        photoType: input.photoType,
        photoUrl: url,
        fileKey
      });
      return { url, fileKey };
    }),
    getInspectionPhotos: adminProcedure2.input(import_zod2.z.object({ bookingId: import_zod2.z.number() })).query(async ({ input }) => {
      return getInspectionPhotosByBooking(input.bookingId);
    }),
    // ─── SMS Notifications ────────────────────────────────────────────────────────
    sendSmsNotification: adminProcedure2.input(
      import_zod2.z.object({
        bookingId: import_zod2.z.number(),
        phoneNumber: import_zod2.z.string(),
        notificationType: import_zod2.z.enum(["approval_confirmation", "reminder_24h"]),
        messageContent: import_zod2.z.string()
      })
    ).mutation(async ({ input }) => {
      await createSmsNotification({
        bookingId: input.bookingId,
        phoneNumber: input.phoneNumber,
        notificationType: input.notificationType,
        messageContent: input.messageContent,
        status: "pending"
      });
      return { success: true };
    }),
    getSmsNotifications: adminProcedure2.input(import_zod2.z.object({ bookingId: import_zod2.z.number() })).query(async ({ input }) => {
      return getSmsNotificationsByBooking(input.bookingId);
    }),
    // ─── Revenue Report ───────────────────────────────────────────────────────────
    getMonthlyReport: adminProcedure2.input(import_zod2.z.object({ year: import_zod2.z.number(), month: import_zod2.z.number() })).query(async ({ input }) => {
      return getMonthlyRevenue(input.year, input.month);
    }),
    // ─── Update Promo Codes ───────────────────────────────────────────────────────────
    updatePromos: adminProcedure2.input(import_zod2.z.object({
      promo7: import_zod2.z.object({ name: import_zod2.z.string(), price: import_zod2.z.number() }),
      promo6: import_zod2.z.object({ name: import_zod2.z.string(), price: import_zod2.z.number() }),
      promo5: import_zod2.z.object({ name: import_zod2.z.string(), price: import_zod2.z.number() })
    })).mutation(async ({ input }) => {
      const stripe = new import_stripe.default(ENV.stripeSecretKey);
      try {
        const results = [];
        const promos = [
          { name: input.promo7.name, price: input.promo7.price },
          { name: input.promo6.name, price: input.promo6.price },
          { name: input.promo5.name, price: input.promo5.price }
        ];
        for (const promo of promos) {
          try {
            const coupon = await stripe.coupons.create({
              id: promo.name,
              amount_off: promo.price * 100,
              currency: "usd",
              duration: "repeating",
              duration_in_months: 1
            });
            results.push(coupon);
          } catch (e) {
            if (e.code !== "resource_already_exists") throw e;
          }
        }
        return { success: true, coupons: results };
      } catch (error) {
        console.error("Error updating promos:", error);
        throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update promo codes" });
      }
    })
  }),
  // ─── Guest Messaging (public, by booking ref) ──────────────────────────────────
  messages: router({
    getByRef: publicProcedure.input(import_zod2.z.object({ ref: import_zod2.z.string() })).query(async ({ input }) => {
      const booking = await getBookingByRef(input.ref);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      const messages = await getMessagesByBookingId(booking.id);
      await markMessagesRead(booking.id, "guest");
      return { messages, guestName: booking.guestName };
    }),
    sendByRef: publicProcedure.input(import_zod2.z.object({ ref: import_zod2.z.string(), content: import_zod2.z.string().min(1).max(2e3) })).mutation(async ({ input }) => {
      const booking = await getBookingByRef(input.ref);
      if (!booking) throw new import_server3.TRPCError({ code: "NOT_FOUND" });
      await createMessage({
        bookingId: booking.id,
        senderRole: "guest",
        senderName: booking.guestName,
        content: input.content
      });
      await sendEmail({
        type: "message_from_guest",
        booking,
        messageContent: input.content
      }).catch(console.error);
      return { success: true };
    })
  })
});

// server/_core/context.ts
init_sdk();
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/index.ts
var app = (0, import_express.default)();
app.post("/api/stripe/webhook", import_express.default.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !sig) {
    res.status(400).send("Webhook secret not configured");
    return;
  }
  let event;
  try {
    const Stripe2 = (await import("stripe")).default;
    const stripe = new Stripe2(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-03-25.dahlia" });
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected");
    res.json({ verified: true });
    return;
  }
  console.log("[Webhook] Event received:", event.type, event.id);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingRef = session.metadata?.bookingRef;
    if (bookingRef && session.payment_status === "paid") {
      try {
        const { updateBookingStripe: updateBookingStripe2, getBookingByRef: getBookingByRef2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        const booking = await getBookingByRef2(bookingRef);
        if (booking && booking.bookingStatus === "pending_payment") {
          await updateBookingStripe2(bookingRef, session.id, session.payment_intent);
          const updated = await getBookingByRef2(bookingRef);
          if (updated) {
            await sendEmail2({ type: "guest_confirmation", booking: updated }).catch(console.error);
            await sendEmail2({ type: "admin_new_booking", booking: updated }).catch(console.error);
          }
        }
      } catch (err) {
        console.error("[Webhook] Failed to process checkout.session.completed:", err);
      }
    }
  }
  res.json({ received: true });
});
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  (0, import_express2.createExpressMiddleware)({
    router: appRouter,
    createContext
  })
);
var index_default = app;
