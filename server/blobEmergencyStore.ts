import { get, put, type HeadBlobResult } from "@vercel/blob";
import type {
  InsertBooking,
  InsertBookingMessage,
  InsertDocument,
  InsertInspectionChecklist,
  InsertInspectionPhoto,
  InsertSmsNotification,
  InsertUser,
  InsertWaiverSignature,
} from "../drizzle/schema";

const STATE_PATH = "breezy-coastal-rentals/private/emergency-database-v1.json";
const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN;

type RecordWithId = Record<string, any> & { id: number };

type EmergencyState = {
  version: 1;
  emergencyMode: true;
  nextIds: Record<string, number>;
  users: RecordWithId[];
  pricing: RecordWithId | null;
  availabilityBlocks: RecordWithId[];
  bookings: RecordWithId[];
  documents: RecordWithId[];
  waivers: RecordWithId[];
  messages: RecordWithId[];
  inspections: RecordWithId[];
  smsNotifications: RecordWithId[];
  inspectionPhotos: RecordWithId[];
};

type LoadedState = { state: EmergencyState; etag?: string; exists: boolean };

let writeQueue: Promise<unknown> = Promise.resolve();

const dateFields = new Set([
  "createdAt",
  "updatedAt",
  "lastSignedIn",
  "blockDate",
  "startDate",
  "endDate",
  "paidAt",
  "uploadedAt",
  "signedAt",
  "completedAt",
  "sentAt",
]);

function clone<T>(value: T): T {
  return structuredClone(value);
}

function hydrateDate(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

function hydrateRecord(record: Record<string, any>): Record<string, any> {
  const hydrated = { ...record };
  dateFields.forEach((field) => {
    if (hydrated[field] !== null && hydrated[field] !== undefined) hydrated[field] = hydrateDate(hydrated[field]);
  });
  return hydrated;
}

export function createDefaultEmergencyState(): EmergencyState {
  return {
    version: 1,
    emergencyMode: true,
    nextIds: {
      users: 1,
      availabilityBlocks: 1,
      bookings: 1,
      documents: 1,
      waivers: 1,
      messages: 1,
      inspections: 1,
      smsNotifications: 1,
      inspectionPhotos: 1,
    },
    users: [],
    pricing: {
      id: 1,
      dailyRate: "160.00",
      deliveryFee: "0.00",
      cartName: "Breezy Golf Cart",
      cartDescription: null,
      cartImageUrl: null,
      updatedAt: new Date(),
    },
    availabilityBlocks: [],
    bookings: [],
    documents: [],
    waivers: [],
    messages: [],
    inspections: [],
    smsNotifications: [],
    inspectionPhotos: [],
  };
}

function hydrateState(raw: any): EmergencyState {
  const base = createDefaultEmergencyState();
  const state: EmergencyState = {
    ...base,
    ...raw,
    nextIds: { ...base.nextIds, ...(raw?.nextIds ?? {}) },
    pricing: raw?.pricing ? hydrateRecord(raw.pricing) : base.pricing,
  };

  for (const key of [
    "users",
    "availabilityBlocks",
    "bookings",
    "documents",
    "waivers",
    "messages",
    "inspections",
    "smsNotifications",
    "inspectionPhotos",
  ] as const) {
    state[key] = (Array.isArray(raw?.[key]) ? raw[key].map(hydrateRecord) : []) as RecordWithId[];
  }

  return state;
}

async function readState(): Promise<LoadedState> {
  const token = TOKEN();
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  const response = await get(STATE_PATH, { access: "private", token, useCache: false });
  if (!response || response.statusCode === 304 || !response.stream) {
    return { state: createDefaultEmergencyState(), exists: false };
  }

  const text = await new Response(response.stream).text();
  return {
    state: hydrateState(JSON.parse(text)),
    etag: response.blob.etag,
    exists: true,
  };
}

async function writeState(state: EmergencyState, etag?: string): Promise<HeadBlobResult | void> {
  const token = TOKEN();
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  return put(STATE_PATH, JSON.stringify(state), {
    access: "private",
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(etag ? { ifMatch: etag } : {}),
    contentType: "application/json",
  }).then(() => undefined);
}

function isPreconditionFailure(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { name?: string }).name === "BlobPreconditionFailedError";
}

async function mutate<T>(mutator: (state: EmergencyState) => T): Promise<T> {
  const operation = writeQueue.then(async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const loaded = await readState();
      const result = mutator(loaded.state);
      try {
        await writeState(loaded.state, loaded.etag);
        return result;
      } catch (error) {
        if (!isPreconditionFailure(error) || attempt === 3) throw error;
      }
    }
    throw new Error("Unable to persist emergency database state");
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}

function nextId(state: EmergencyState, table: keyof EmergencyState["nextIds"]): number {
  const id = state.nextIds[table] ?? 1;
  state.nextIds[table] = id + 1;
  return id;
}

/** True only after the emergency database has actually been initialized. */
export async function isEmergencyStoreActive(): Promise<boolean> {
  if (!TOKEN()) return false;
  try {
    const loaded = await readState();
    return loaded.exists && loaded.state.emergencyMode === true;
  } catch (error) {
    console.error("[Blob emergency store] Unable to check state:", error instanceof Error ? error.message : error);
    return false;
  }
}

/** Validates that the private Blob store is reachable without exposing its content. */
export async function isEmergencyStoreReady(): Promise<boolean> {
  if (!TOKEN()) return false;
  try {
    await readState();
    return true;
  } catch (error) {
    console.error("[Blob emergency store] Readiness check failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function upsertUser(user: InsertUser) {
  return mutate((state) => {
    const current = state.users.find((item) => item.openId === user.openId);
    const now = new Date();
    if (current) {
      Object.assign(current, user, { updatedAt: now, lastSignedIn: user.lastSignedIn ?? now });
      return clone(current);
    }
    const record = {
      id: nextId(state, "users"),
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn ?? now,
    };
    state.users.push(record);
    return clone(record);
  });
}

export async function getUserByOpenId(openId: string) {
  const { state } = await readState();
  const user = state.users.find((item) => item.openId === openId);
  return user ? clone(user) : undefined;
}

export async function getPricing() {
  const { state } = await readState();
  return state.pricing ? clone(state.pricing) : null;
}

export async function updatePricing(data: Record<string, unknown>) {
  return mutate((state) => {
    state.pricing = {
      ...(state.pricing ?? createDefaultEmergencyState().pricing!),
      ...data,
      id: 1,
      updatedAt: new Date(),
    };
    return clone(state.pricing);
  });
}

export async function getBlockedDates() {
  const { state } = await readState();
  return clone(state.availabilityBlocks);
}

export async function addBlockedDate(blockDate: string, reason?: string) {
  return mutate((state) => {
    const record = { id: nextId(state, "availabilityBlocks"), blockDate: new Date(`${blockDate}T12:00:00Z`), reason: reason ?? null, createdAt: new Date() };
    state.availabilityBlocks.push(record);
    return clone(record);
  });
}

export async function removeBlockedDate(id: number) {
  return mutate((state) => {
    state.availabilityBlocks = state.availabilityBlocks.filter((item) => item.id !== id);
  });
}

export async function getApprovedBookingDates() {
  const { state } = await readState();
  return clone(state.bookings.filter((item) => item.bookingStatus === "approved").map(({ startDate, endDate }) => ({ startDate, endDate })));
}

export async function createBooking(data: InsertBooking) {
  return mutate((state) => {
    const now = new Date();
    const record = {
      id: nextId(state, "bookings"),
      ...data,
      bookingStatus: data.bookingStatus ?? "pending_payment",
      documentStatus: data.documentStatus ?? "pending",
      airbnbBookingName: data.airbnbBookingName ?? null,
      adminNotes: null,
      rejectionReason: null,
      stripeSessionId: null,
      stripePaymentIntentId: null,
      createdAt: now,
      updatedAt: now,
      paidAt: null,
    };
    state.bookings.push(record);
    return clone(record);
  });
}

export async function getBookingByRef(bookingRef: string) {
  const { state } = await readState();
  const booking = state.bookings.find((item) => item.bookingRef === bookingRef);
  return booking ? clone(booking) : null;
}

export async function getBookingById(id: number) {
  const { state } = await readState();
  const booking = state.bookings.find((item) => item.id === id);
  return booking ? clone(booking) : null;
}

export async function getAllBookings() {
  const { state } = await readState();
  return clone([...state.bookings].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
}

export async function updateBookingStatus(id: number, bookingStatus: string, opts?: { adminNotes?: string; rejectionReason?: string }) {
  return mutate((state) => {
    const booking = state.bookings.find((item) => item.id === id);
    if (booking) Object.assign(booking, { bookingStatus, ...opts, updatedAt: new Date() });
  });
}

export async function deleteBooking(id: number) {
  return mutate((state) => {
    state.bookings = state.bookings.filter((item) => item.id !== id);
    state.documents = state.documents.filter((item) => item.bookingId !== id);
    state.waivers = state.waivers.filter((item) => item.bookingId !== id);
    state.messages = state.messages.filter((item) => item.bookingId !== id);
    state.inspections = state.inspections.filter((item) => item.bookingId !== id);
    state.inspectionPhotos = state.inspectionPhotos.filter((item) => item.bookingId !== id);
    state.smsNotifications = state.smsNotifications.filter((item) => item.bookingId !== id);
  });
}

export async function updateDocumentStatus(id: number, documentStatus: string) {
  return mutate((state) => {
    const booking = state.bookings.find((item) => item.id === id);
    if (booking) Object.assign(booking, { documentStatus, updatedAt: new Date() });
  });
}

export async function updateBookingStripe(bookingRef: string, stripeSessionId: string, stripePaymentIntentId?: string, amountPaid?: number) {
  return mutate((state) => {
    const booking = state.bookings.find((item) => item.bookingRef === bookingRef);
    if (booking) Object.assign(booking, {
      stripeSessionId,
      stripePaymentIntentId: stripePaymentIntentId ?? null,
      bookingStatus: "submitted",
      paidAt: new Date(),
      totalAmount: amountPaid === undefined ? booking.totalAmount : (amountPaid / 100).toFixed(2),
      updatedAt: new Date(),
    });
  });
}

export async function createDocument(data: InsertDocument) {
  return mutate((state) => {
    state.documents.push({ id: nextId(state, "documents"), ...data, uploadedAt: new Date() });
  });
}

export async function getDocumentsByBookingId(bookingId: number) {
  const { state } = await readState();
  return clone(state.documents.filter((item) => item.bookingId === bookingId));
}

export async function createWaiverSignature(data: InsertWaiverSignature) {
  return mutate((state) => {
    state.waivers.push({ id: nextId(state, "waivers"), ...data, agreedToTerms: data.agreedToTerms ?? false, signedAt: new Date() });
  });
}

export async function getWaiverByBookingId(bookingId: number) {
  const { state } = await readState();
  const waiver = state.waivers.find((item) => item.bookingId === bookingId);
  return waiver ? clone(waiver) : null;
}

export async function createMessage(data: InsertBookingMessage) {
  return mutate((state) => {
    state.messages.push({ id: nextId(state, "messages"), ...data, isRead: data.isRead ?? false, createdAt: new Date() });
  });
}

export async function getMessagesByBookingId(bookingId: number) {
  const { state } = await readState();
  return clone(state.messages.filter((item) => item.bookingId === bookingId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
}

export async function markMessagesRead(bookingId: number, readerRole: "admin" | "guest") {
  return mutate((state) => {
    const senderRole = readerRole === "admin" ? "guest" : "admin";
    state.messages.filter((item) => item.bookingId === bookingId && item.senderRole === senderRole).forEach((item) => { item.isRead = true; });
  });
}

export async function getUnreadCountForAdmin() {
  const { state } = await readState();
  const counts: Record<number, number> = {};
  state.messages.filter((item) => item.senderRole === "guest" && !item.isRead).forEach((item) => { counts[item.bookingId] = (counts[item.bookingId] ?? 0) + 1; });
  return counts;
}

export async function getInspectionByBookingId(bookingId: number) {
  const { state } = await readState();
  const inspection = state.inspections.find((item) => item.bookingId === bookingId);
  return inspection ? clone(inspection) : null;
}

export async function upsertInspection(data: InsertInspectionChecklist) {
  return mutate((state) => {
    const now = new Date();
    const existing = state.inspections.find((item) => item.bookingId === data.bookingId);
    if (existing) Object.assign(existing, data, { updatedAt: now });
    else state.inspections.push({ id: nextId(state, "inspections"), ...data, completedAt: data.completedAt ?? now, updatedAt: now });
  });
}

export async function createSmsNotification(data: InsertSmsNotification) {
  return mutate((state) => {
    state.smsNotifications.push({ id: nextId(state, "smsNotifications"), ...data, status: data.status ?? "pending", sentAt: data.sentAt ?? new Date(), createdAt: new Date() });
  });
}

export async function getSmsNotificationsByBooking(bookingId: number) {
  const { state } = await readState();
  return clone(state.smsNotifications.filter((item) => item.bookingId === bookingId));
}

export async function createInspectionPhoto(data: InsertInspectionPhoto) {
  return mutate((state) => {
    state.inspectionPhotos.push({ id: nextId(state, "inspectionPhotos"), ...data, uploadedAt: new Date() });
  });
}

export async function getInspectionPhotosByBooking(bookingId: number) {
  const { state } = await readState();
  return clone(state.inspectionPhotos.filter((item) => item.bookingId === bookingId));
}

export async function getMonthlyRevenue(year: number, month: number) {
  const { state } = await readState();
  const bookings = state.bookings.filter((booking) => {
    const start = new Date(booking.startDate);
    return booking.bookingStatus === "approved" && start.getUTCFullYear() === year && start.getUTCMonth() + 1 === month;
  });
  return { totalRevenue: bookings.reduce((total, booking) => total + Number(booking.totalAmount), 0), totalBookings: bookings.length, bookings: clone(bookings) };
}
