var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
  date
} from "drizzle-orm/mysql-core";
var users, pricing, availabilityBlocks, bookings, documents, waiverSignatures, bookingMessages, inspectionChecklists, smsNotifications, inspectionPhotos;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    pricing = mysqlTable("pricing", {
      id: int("id").autoincrement().primaryKey(),
      dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull().default("160.00"),
      deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
      cartName: varchar("cartName", { length: 128 }).notNull().default("Breezy Golf Cart"),
      cartDescription: text("cartDescription"),
      cartImageUrl: text("cartImageUrl"),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    availabilityBlocks = mysqlTable("availability_blocks", {
      id: int("id").autoincrement().primaryKey(),
      blockDate: date("blockDate").notNull(),
      reason: varchar("reason", { length: 255 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    bookings = mysqlTable("bookings", {
      id: int("id").autoincrement().primaryKey(),
      bookingRef: varchar("bookingRef", { length: 16 }).notNull().unique(),
      // Guest info
      guestName: varchar("guestName", { length: 128 }).notNull(),
      guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
      guestPhone: varchar("guestPhone", { length: 32 }).notNull(),
      airbnbBookingName: varchar("airbnbBookingName", { length: 128 }),
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
        "cancelled"
      ]).notNull().default("pending_payment"),
      documentStatus: mysqlEnum("documentStatus", [
        "pending",
        "received",
        "needs_update",
        "approved"
      ]).notNull().default("pending"),
      // Admin notes
      adminNotes: text("adminNotes"),
      rejectionReason: text("rejectionReason"),
      // Stripe
      stripeSessionId: varchar("stripeSessionId", { length: 256 }),
      stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
      // Timestamps
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      paidAt: timestamp("paidAt")
    });
    documents = mysqlTable("documents", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      documentType: mysqlEnum("documentType", ["drivers_license", "proof_of_insurance"]).notNull(),
      fileKey: varchar("fileKey", { length: 512 }).notNull(),
      fileUrl: text("fileUrl").notNull(),
      fileName: varchar("fileName", { length: 256 }),
      mimeType: varchar("mimeType", { length: 64 }),
      fileSize: bigint("fileSize", { mode: "number" }),
      uploadedAt: timestamp("uploadedAt").defaultNow().notNull()
    });
    waiverSignatures = mysqlTable("waiver_signatures", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      legalName: varchar("legalName", { length: 256 }).notNull(),
      agreedToTerms: boolean("agreedToTerms").notNull().default(false),
      ipAddress: varchar("ipAddress", { length: 64 }),
      userAgent: text("userAgent"),
      signedAt: timestamp("signedAt").defaultNow().notNull()
    });
    bookingMessages = mysqlTable("booking_messages", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      senderRole: mysqlEnum("senderRole", ["admin", "guest"]).notNull(),
      senderName: varchar("senderName", { length: 128 }).notNull(),
      content: text("content").notNull(),
      isRead: boolean("isRead").notNull().default(false),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    inspectionChecklists = mysqlTable("inspection_checklists", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull().unique(),
      // one checklist per booking
      completedBy: varchar("completedBy", { length: 128 }).notNull(),
      // Individual checklist items (true = passed)
      batteryCharged: boolean("batteryCharged").notNull().default(false),
      tiresInflated: boolean("tiresInflated").notNull().default(false),
      brakesWorking: boolean("brakesWorking").notNull().default(false),
      steeringWorking: boolean("steeringWorking").notNull().default(false),
      signalLightsWorking: boolean("signalLightsWorking").notNull().default(false),
      brakeLightsWorking: boolean("brakeLightsWorking").notNull().default(false),
      headlightsWorking: boolean("headlightsWorking").notNull().default(false),
      bodyFrameOk: boolean("bodyFrameOk").notNull().default(false),
      seatbeltsOk: boolean("seatbeltsOk").notNull().default(false),
      cleanAndReady: boolean("cleanAndReady").notNull().default(false),
      notes: text("notes"),
      completedAt: timestamp("completedAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    smsNotifications = mysqlTable("sms_notifications", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      notificationType: mysqlEnum("notificationType", ["approval_confirmation", "reminder_24h"]).notNull(),
      phoneNumber: varchar("phoneNumber", { length: 32 }).notNull(),
      messageContent: text("messageContent").notNull(),
      sentAt: timestamp("sentAt").defaultNow().notNull(),
      status: mysqlEnum("status", ["pending", "sent", "failed"]).notNull().default("pending"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    inspectionPhotos = mysqlTable("inspection_photos", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      photoType: mysqlEnum("photoType", ["before", "after"]).notNull(),
      photoUrl: text("photoUrl").notNull(),
      fileKey: varchar("fileKey", { length: 255 }).notNull(),
      uploadedAt: timestamp("uploadedAt").defaultNow().notNull()
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
import { and, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
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
    await db.update(pricing).set(data).where(eq(pricing.id, existing[0].id));
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
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
}
async function getApprovedBookingDates() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ startDate: bookings.startDate, endDate: bookings.endDate }).from(bookings).where(eq(bookings.bookingStatus, "approved"));
}
async function createBooking(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(bookings).values(data);
  const result = await db.select().from(bookings).where(eq(bookings.bookingRef, data.bookingRef)).limit(1);
  return result[0];
}
async function getBookingByRef(bookingRef) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.bookingRef, bookingRef)).limit(1);
  return result[0] ?? null;
}
async function getBookingById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
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
  await db.update(bookings).set({ bookingStatus, ...opts }).where(eq(bookings.id, id));
}
async function updateDocumentStatus(id, documentStatus) {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({ documentStatus }).where(eq(bookings.id, id));
}
async function updateBookingStripe(bookingRef, stripeSessionId, stripePaymentIntentId) {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({
    stripeSessionId,
    stripePaymentIntentId: stripePaymentIntentId ?? null,
    bookingStatus: "submitted",
    paidAt: /* @__PURE__ */ new Date()
  }).where(eq(bookings.bookingRef, bookingRef));
}
async function createDocument(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(documents).values(data);
}
async function getDocumentsByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.bookingId, bookingId));
}
async function createWaiverSignature(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(waiverSignatures).values(data);
}
async function getWaiverByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(waiverSignatures).where(eq(waiverSignatures.bookingId, bookingId)).limit(1);
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
  return db.select().from(bookingMessages).where(eq(bookingMessages.bookingId, bookingId)).orderBy(bookingMessages.createdAt);
}
async function markMessagesRead(bookingId, readerRole) {
  const senderRole = readerRole === "admin" ? "guest" : "admin";
  const db = await getDb();
  if (!db) return;
  await db.update(bookingMessages).set({ isRead: true }).where(
    and(
      eq(bookingMessages.bookingId, bookingId),
      eq(bookingMessages.senderRole, senderRole),
      eq(bookingMessages.isRead, false)
    )
  );
}
async function getUnreadCountForAdmin() {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(bookingMessages).where(and(eq(bookingMessages.senderRole, "guest"), eq(bookingMessages.isRead, false)));
  const counts = {};
  for (const row of rows) {
    counts[row.bookingId] = (counts[row.bookingId] ?? 0) + 1;
  }
  return counts;
}
async function getInspectionByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(inspectionChecklists).where(eq(inspectionChecklists.bookingId, bookingId)).limit(1);
  return result[0] ?? null;
}
async function upsertInspection(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(inspectionChecklists).where(eq(inspectionChecklists.bookingId, data.bookingId)).limit(1);
  if (existing.length > 0) {
    await db.update(inspectionChecklists).set({ ...data }).where(eq(inspectionChecklists.bookingId, data.bookingId));
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
  return db.select().from(smsNotifications).where(eq(smsNotifications.bookingId, bookingId));
}
async function createInspectionPhoto(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(inspectionPhotos).values(data);
}
async function getInspectionPhotosByBooking(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inspectionPhotos).where(eq(inspectionPhotos.bookingId, bookingId));
}
async function getMonthlyRevenue(year, month) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalBookings: 0, bookings: [] };
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const result = await db.select().from(bookings).where(
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
    bookings: result
  };
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
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
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, OAuthService, createOAuthHttpClient, SDKServer, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
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
    createOAuthHttpClient = () => axios.create({
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
        const parsed = parseCookieHeader(cookieHeader);
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
        return new SignJWT({
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
          const { payload } = await jwtVerify(cookieValue, secretKey, {
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
import { Resend } from "resend";
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[Email] RESEND_API_KEY not set \u2014 skipping email send");
    return null;
  }
  return new Resend(key);
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
var FROM, ADMIN_EMAIL, APP_URL;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    FROM = "Breezy Coastal Rentals <onboarding@resend.dev>";
    ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@breezycoastalrentals.com";
    APP_URL = process.env.APP_URL ?? "https://breezycoastalrentals.com";
  }
});

// api/index.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

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
init_db();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { nanoid } from "nanoid";
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
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
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
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
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
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
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
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
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/storage.ts
import { put } from "@vercel/blob";
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = normalizeKey(relKey);
  let buffer;
  if (typeof data === "string") {
    buffer = Buffer.from(data, "base64");
  } else {
    buffer = Buffer.from(data);
  }
  const blob = await put(key, buffer, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
  return { key, url: blob.url };
}

// server/routers.ts
init_email();
init_env();
import Stripe from "stripe";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
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
    adminLogin: publicProcedure.input(z2.object({ email: z2.string(), password: z2.string() })).mutation(async ({ ctx, input }) => {
      const { adminEmail, adminPassword } = ENV;
      if (!adminEmail || !adminPassword) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Admin credentials not configured" });
      }
      if (input.email !== adminEmail || input.password !== adminPassword) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid email or password" });
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
      z2.object({
        dailyRate: z2.string().optional(),
        deliveryFee: z2.string().optional(),
        cartName: z2.string().optional(),
        cartDescription: z2.string().optional(),
        cartImageUrl: z2.string().optional()
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
    addBlock: adminProcedure2.input(z2.object({ date: z2.string(), reason: z2.string().optional() })).mutation(async ({ input }) => {
      await addBlockedDate(input.date, input.reason);
      return { success: true };
    }),
    removeBlock: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await removeBlockedDate(input.id);
      return { success: true };
    })
  }),
  // ─── Bookings ──────────────────────────────────────────────────────────────
  bookings: router({
    create: publicProcedure.input(
      z2.object({
        guestName: z2.string().min(2),
        guestEmail: z2.string().email(),
        guestPhone: z2.string().min(10),
        airbnbBookingName: z2.string().optional().default(""),
        startDate: z2.string(),
        endDate: z2.string(),
        totalDays: z2.number().min(1),
        dailyRate: z2.string(),
        deliveryFee: z2.string(),
        totalAmount: z2.string(),
        waiverLegalName: z2.string().min(2),
        waiverAgreed: z2.boolean(),
        waiverIp: z2.string().optional(),
        waiverUserAgent: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const bookingRef = nanoid(10).toUpperCase();
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
    getByRef: publicProcedure.input(z2.object({ ref: z2.string() })).query(async ({ input }) => {
      const booking = await getBookingByRef(input.ref);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
      const docs = await getDocumentsByBookingId(booking.id);
      const waiver = await getWaiverByBookingId(booking.id);
      return { booking, documents: docs, waiver };
    }),
    createCheckout: publicProcedure.input(
      z2.object({
        bookingRef: z2.string(),
        origin: z2.string()
      })
    ).mutation(async ({ input }) => {
      const booking = await getBookingByRef(input.bookingRef);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
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
    confirmPayment: publicProcedure.input(z2.object({ bookingRef: z2.string(), sessionId: z2.string() })).mutation(async ({ input }) => {
      const booking = await getBookingByRef(input.bookingRef);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
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
      z2.object({
        bookingId: z2.number(),
        documentType: z2.enum(["drivers_license", "proof_of_insurance"]),
        fileName: z2.string(),
        mimeType: z2.string(),
        fileSize: z2.number(),
        fileBase64: z2.string()
      })
    ).mutation(async ({ input }) => {
      const maxSize = 10 * 1024 * 1024;
      if (input.fileSize > maxSize) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "File too large (max 10MB)" });
      }
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(input.mimeType)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Invalid file type" });
      }
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `documents/${input.bookingId}/${input.documentType}-${nanoid(8)}.${ext}`;
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
    getBookingDetail: adminProcedure2.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const booking = await getBookingById(input.id);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
      const docs = await getDocumentsByBookingId(booking.id);
      const waiver = await getWaiverByBookingId(booking.id);
      return { booking, documents: docs, waiver };
    }),
    updateBookingStatus: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        status: z2.enum(["submitted", "under_review", "approved", "rejected", "completed", "cancelled"]),
        adminNotes: z2.string().optional(),
        rejectionReason: z2.string().optional()
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
    updateDocumentStatus: adminProcedure2.input(z2.object({ bookingId: z2.number(), status: z2.enum(["pending", "received", "needs_update", "approved"]) })).mutation(async ({ input }) => {
      await updateDocumentStatus(input.bookingId, input.status);
      return { success: true };
    }),
    getBookingDetailWithMessages: adminProcedure2.input(z2.object({ id: z2.number() })).query(async ({ input, ctx }) => {
      const booking = await getBookingById(input.id);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
      const docs = await getDocumentsByBookingId(booking.id);
      const waiver = await getWaiverByBookingId(booking.id);
      const messages = await getMessagesByBookingId(booking.id);
      await markMessagesRead(booking.id, "admin");
      return { booking, documents: docs, waiver, messages };
    }),
    sendMessage: adminProcedure2.input(z2.object({ bookingId: z2.number(), content: z2.string().min(1).max(2e3) })).mutation(async ({ input, ctx }) => {
      const booking = await getBookingById(input.bookingId);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
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
    getInspection: adminProcedure2.input(z2.object({ bookingId: z2.number() })).query(async ({ input }) => {
      return getInspectionByBookingId(input.bookingId);
    }),
    saveInspection: adminProcedure2.input(z2.object({
      bookingId: z2.number(),
      batteryCharged: z2.boolean(),
      tiresInflated: z2.boolean(),
      brakesWorking: z2.boolean(),
      steeringWorking: z2.boolean(),
      signalLightsWorking: z2.boolean(),
      brakeLightsWorking: z2.boolean(),
      headlightsWorking: z2.boolean(),
      bodyFrameOk: z2.boolean(),
      seatbeltsOk: z2.boolean(),
      cleanAndReady: z2.boolean(),
      notes: z2.string().max(1e3).optional()
    })).mutation(async ({ input, ctx }) => {
      await upsertInspection({
        ...input,
        completedBy: ctx.user.name ?? "Admin",
        completedAt: /* @__PURE__ */ new Date()
      });
      return { success: true };
    }),
    // ─ Cart Image Upload ────────────────────────────────────────────────────────────────────
    uploadCartImage: adminProcedure2.input(z2.object({
      fileName: z2.string(),
      mimeType: z2.string(),
      fileBase64: z2.string()
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `cart-images/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await updatePricing({ cartImageUrl: url });
      return { url };
    }),
    // ─── Inspection Photos ────────────────────────────────────────────────────────
    uploadInspectionPhoto: adminProcedure2.input(
      z2.object({
        bookingId: z2.number(),
        photoType: z2.enum(["before", "after"]),
        fileName: z2.string(),
        mimeType: z2.string(),
        fileBase64: z2.string()
      })
    ).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `inspection/${input.bookingId}/${input.photoType}-${nanoid(8)}.jpg`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      await createInspectionPhoto({
        bookingId: input.bookingId,
        photoType: input.photoType,
        photoUrl: url,
        fileKey
      });
      return { url, fileKey };
    }),
    getInspectionPhotos: adminProcedure2.input(z2.object({ bookingId: z2.number() })).query(async ({ input }) => {
      return getInspectionPhotosByBooking(input.bookingId);
    }),
    // ─── SMS Notifications ────────────────────────────────────────────────────────
    sendSmsNotification: adminProcedure2.input(
      z2.object({
        bookingId: z2.number(),
        phoneNumber: z2.string(),
        notificationType: z2.enum(["approval_confirmation", "reminder_24h"]),
        messageContent: z2.string()
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
    getSmsNotifications: adminProcedure2.input(z2.object({ bookingId: z2.number() })).query(async ({ input }) => {
      return getSmsNotificationsByBooking(input.bookingId);
    }),
    // ─── Revenue Report ───────────────────────────────────────────────────────────
    getMonthlyReport: adminProcedure2.input(z2.object({ year: z2.number(), month: z2.number() })).query(async ({ input }) => {
      return getMonthlyRevenue(input.year, input.month);
    }),
    // ─── Update Promo Codes ───────────────────────────────────────────────────────────
    updatePromos: adminProcedure2.input(z2.object({
      promo7: z2.object({ name: z2.string(), price: z2.number() }),
      promo6: z2.object({ name: z2.string(), price: z2.number() }),
      promo5: z2.object({ name: z2.string(), price: z2.number() })
    })).mutation(async ({ input }) => {
      const stripe = new Stripe(ENV.stripeSecretKey);
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
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update promo codes" });
      }
    })
  }),
  // ─── Guest Messaging (public, by booking ref) ──────────────────────────────────
  messages: router({
    getByRef: publicProcedure.input(z2.object({ ref: z2.string() })).query(async ({ input }) => {
      const booking = await getBookingByRef(input.ref);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
      const messages = await getMessagesByBookingId(booking.id);
      await markMessagesRead(booking.id, "guest");
      return { messages, guestName: booking.guestName };
    }),
    sendByRef: publicProcedure.input(z2.object({ ref: z2.string(), content: z2.string().min(1).max(2e3) })).mutation(async ({ input }) => {
      const booking = await getBookingByRef(input.ref);
      if (!booking) throw new TRPCError3({ code: "NOT_FOUND" });
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
var app = express();
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var index_default = app;
export {
  index_default as default
};
