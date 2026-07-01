import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  addBlockedDate,
  createBooking,
  createDocument,
  createInspectionPhoto,
  createMessage,
  createSmsNotification,
  createWaiverSignature,
  deleteBooking,
  getAllBookings,
  getApprovedBookingDates,
  getBlockedDates,
  getBookingById,
  getBookingByRef,
  getDocumentsByBookingId,
  getInspectionByBookingId,
  getInspectionPhotosByBooking,
  getMessagesByBookingId,
  getMonthlyRevenue,
  getPricing,
  getSmsNotificationsByBooking,
  getUnreadCountForAdmin,
  getUserByOpenId,
  getWaiverByBookingId,
  markMessagesRead,
  removeBlockedDate,
  updateBookingStatus,
  updateBookingStripe,
  updateDocumentStatus,
  updatePricing,
  upsertInspection,
  upsertUser,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { sendEmail } from "./email";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { pageContentSchema } from "../shared/pageContent";
import {
  deployPageContent,
  loadDraftPageContent,
  loadLivePageContent,
  saveDraftPageContent,
} from "./pageContentStore";

// ─── Admin guard ─────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Stripe client ────────────────────────────────────────────────────────────
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
  // Using a more standard API version to avoid potential "dahlia" version issues if not supported
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    adminLogin: publicProcedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { adminEmail, adminPassword } = ENV;
        if (!adminEmail || !adminPassword) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Admin credentials not configured" });
        }
        if (input.email !== adminEmail || input.password !== adminPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        // Ensure admin user exists in DB
        const ADMIN_OPEN_ID = "admin-local";
        await upsertUser({
          openId: ADMIN_OPEN_ID,
          name: "Admin",
          email: adminEmail,
          role: "admin",
          lastSignedIn: new Date(),
        });
        const adminUser = await getUserByOpenId(ADMIN_OPEN_ID);
        if (!adminUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not connect to the database. Please try again in a moment.",
          });
        }
        const { sdk } = await import("./_core/sdk");
        const { ONE_YEAR_MS } = await import("@shared/const");
        const sessionAppId = ENV.appId || "breezy-coastal-rentals";
        const sessionToken = await sdk.signSession(
          { openId: ADMIN_OPEN_ID, appId: sessionAppId, name: "Admin" },
          { expiresInMs: ONE_YEAR_MS }
        );
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true as const, user: adminUser };
      }),
  }),

  // ─── Pricing ───────────────────────────────────────────────────────────────
  pricing: router({
    get: publicProcedure.query(async () => {
      return getPricing();
    }),
    update: adminProcedure
      .input(
        z.object({
          dailyRate: z.string().optional(),
          deliveryFee: z.string().optional(),
          cartName: z.string().optional(),
          cartDescription: z.string().optional(),
          cartImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updatePricing(input);
        return { success: true };
      }),
  }),

  // ─── Availability ──────────────────────────────────────────────────────────
  availability: router({
    getBlockedDates: publicProcedure.query(async () => {
      const blocks = await getBlockedDates();
      const approved = await getApprovedBookingDates();
      return { blocks, approvedRanges: approved };
    }),
    addBlock: adminProcedure
      .input(z.object({ date: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        await addBlockedDate(input.date, input.reason);
        return { success: true };
      }),
    removeBlock: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await removeBlockedDate(input.id);
        return { success: true };
      }),
  }),

  // ─── Bookings ──────────────────────────────────────────────────────────────
  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          guestName: z.string().min(2),
          guestEmail: z.string().email(),
          guestPhone: z.string().min(10),
          airbnbBookingName: z.string().optional().default(""),
          startDate: z.string(),
          endDate: z.string(),
          totalDays: z.number().min(1),
          dailyRate: z.string(),
          deliveryFee: z.string(),
          totalAmount: z.string(),
          waiverLegalName: z.string().min(2),
          waiverAgreed: z.boolean(),
          waiverIp: z.string().optional(),
          waiverUserAgent: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const bookingRef = nanoid(10).toUpperCase();
        const booking = await createBooking({
          bookingRef,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          airbnbBookingName: input.airbnbBookingName ?? "",
          startDate: new Date(input.startDate + "T12:00:00Z") as any,
          endDate: new Date(input.endDate + "T12:00:00Z") as any,
          totalDays: input.totalDays,
          dailyRate: input.dailyRate,
          deliveryFee: input.deliveryFee,
          totalAmount: input.totalAmount,
          bookingStatus: "pending_payment",
          documentStatus: "pending",
        });

        // Save waiver signature
        await createWaiverSignature({
          bookingId: booking!.id,
          legalName: input.waiverLegalName,
          agreedToTerms: input.waiverAgreed,
          ipAddress: input.waiverIp,
          userAgent: input.waiverUserAgent,
        });

        return { bookingRef, bookingId: booking!.id };
      }),

    getByRef: publicProcedure
      .input(z.object({ ref: z.string() }))
      .query(async ({ input }) => {
        const booking = await getBookingByRef(input.ref);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        const docs = await getDocumentsByBookingId(booking.id);
        const waiver = await getWaiverByBookingId(booking.id);
        return { booking, documents: docs, waiver };
      }),

    createCheckout: publicProcedure
      .input(
        z.object({
          bookingRef: z.string(),
          origin: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const booking = await getBookingByRef(input.bookingRef);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Breezy Coastal Rentals — Golf Cart Rental`,
                  description: `${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""} — ${booking.startDate} to ${booking.endDate}`,
                },
                unit_amount: Math.round(parseFloat(booking.totalAmount) * 100),
              },
              quantity: 1,
            },
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Refundable Security Deposit",
                  description: "$300 refundable deposit — returned after cart is inspected at end of rental. Admin releases hold via Stripe dashboard.",
                },
                unit_amount: 30000,
              },
              quantity: 1,
            },
          ],
          allow_promotion_codes: true,
          metadata: { bookingRef: input.bookingRef },
          success_url: `${input.origin}/booking/confirmation?ref=${input.bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/booking?step=5&ref=${input.bookingRef}`,
        });

        return { url: session.url, sessionId: session.id };
      }),

    confirmPayment: publicProcedure
      .input(z.object({ bookingRef: z.string(), sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const booking = await getBookingByRef(input.bookingRef);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });

        if (booking.bookingStatus === "pending_payment") {
          const stripe = getStripe();
          const session = await stripe.checkout.sessions.retrieve(input.sessionId);
          if (session.payment_status === "paid") {
            await updateBookingStripe(
              input.bookingRef,
              input.sessionId,
              session.payment_intent as string,
              session.amount_total ?? undefined
            );
            // Send emails
            const updatedBooking = await getBookingByRef(input.bookingRef);
            if (updatedBooking) {
              await sendEmail({
                type: "guest_confirmation",
                booking: updatedBooking,
              }).catch(console.error);
              await sendEmail({
                type: "admin_new_booking",
                booking: updatedBooking,
              }).catch(console.error);
            }
          }
        }
        const updated = await getBookingByRef(input.bookingRef);
        return { booking: updated };
      }),
  }),

  // ─── Documents ─────────────────────────────────────────────────────────────
  documents: router({
    upload: publicProcedure
      .input(
        z.object({
          bookingId: z.number(),
          documentType: z.enum(["drivers_license", "proof_of_insurance"]),
          fileName: z.string(),
          mimeType: z.string(),
          fileSize: z.number(),
          fileBase64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const maxSize = 10 * 1024 * 1024;
        if (input.fileSize > maxSize) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "File too large (max 10MB)" });
        }

        const allowed = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowed.includes(input.mimeType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid file type" });
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
          fileSize: input.fileSize,
        });

        // Update document status to received
        await updateDocumentStatus(input.bookingId, "received");

        return { url, fileKey };
      }),
  }),

  // ─── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    getAllBookings: adminProcedure.query(async () => {
      return getAllBookings();
    }),

    getBookingDetail: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const booking = await getBookingById(input.id);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        const docs = await getDocumentsByBookingId(booking.id);
        const waiver = await getWaiverByBookingId(booking.id);
        return { booking, documents: docs, waiver };
      }),

    removeBooking: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const booking = await getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }
        if (booking.bookingStatus === "approved" || booking.bookingStatus === "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "This booking was already approved. You cannot remove it — use Reject or Mark as Completed instead.",
          });
        }
        await deleteBooking(input.id);
        return { success: true as const };
      }),

    updateBookingStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["submitted", "under_review", "approved", "rejected", "completed", "cancelled"]),
          adminNotes: z.string().optional(),
          rejectionReason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateBookingStatus(input.id, input.status, {
          adminNotes: input.adminNotes,
          rejectionReason: input.rejectionReason,
        });
        const booking = await getBookingById(input.id);
        if (booking) {
          if (input.status === "approved") {
            await sendEmail({ type: "guest_approved", booking }).catch(console.error);
          } else if (input.status === "rejected") {
            await sendEmail({
              type: "guest_rejected",
              booking,
              reason: input.rejectionReason,
            }).catch(console.error);
          }
        }
        return { success: true };
      }),

    updateDocumentStatus: adminProcedure
      .input(z.object({ bookingId: z.number(), status: z.enum(["pending", "received", "needs_update", "approved"]) }))
      .mutation(async ({ input }) => {
        await updateDocumentStatus(input.bookingId, input.status);
        return { success: true };
      }),

    getBookingDetailWithMessages: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const booking = await getBookingById(input.id);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        const docs = await getDocumentsByBookingId(booking.id);
        const waiver = await getWaiverByBookingId(booking.id);
        const messages = await getMessagesByBookingId(booking.id);
        // Mark guest messages as read since admin is viewing
        await markMessagesRead(booking.id, "admin");
        return { booking, documents: docs, waiver, messages };
      }),

    sendMessage: adminProcedure
      .input(z.object({ bookingId: z.number(), content: z.string().min(1).max(2000) }))
      .mutation(async ({ input, ctx }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        await createMessage({
          bookingId: input.bookingId,
          senderRole: "admin",
          senderName: ctx.user.name ?? "Breezy Admin",
          content: input.content,
        });
        // Email the guest
        await sendEmail({
          type: "message_from_admin",
          booking,
          messageContent: input.content,
        }).catch(console.error);
        return { success: true };
      }),

    getUnreadCounts: adminProcedure.query(async () => {
      return getUnreadCountForAdmin();
    }),

    // ─ Inspection Checklist ───────────────────────────────────────────────────────────────────
    getInspection: adminProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return getInspectionByBookingId(input.bookingId);
      }),

    saveInspection: adminProcedure
      .input(z.object({
        bookingId: z.number(),
        batteryCharged: z.boolean(),
        tiresInflated: z.boolean(),
        brakesWorking: z.boolean(),
        steeringWorking: z.boolean(),
        signalLightsWorking: z.boolean(),
        brakeLightsWorking: z.boolean(),
        headlightsWorking: z.boolean(),
        bodyFrameOk: z.boolean(),
        seatbeltsOk: z.boolean(),
        cleanAndReady: z.boolean(),
        notes: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await upsertInspection({
          ...input,
          completedBy: ctx.user.name ?? "Admin",
          completedAt: new Date(),
        });
        return { success: true };
      }),

    // ─ Page Editor ─────────────────────────────────────────────────────────────────────────
    pageEditorLoad: adminProcedure.query(async () => {
      const [live, draft] = await Promise.all([loadLivePageContent(), loadDraftPageContent()]);
      return { live, draft };
    }),

    pageEditorSaveDraft: adminProcedure
      .input(pageContentSchema)
      .mutation(async ({ input }) => {
        const result = await saveDraftPageContent(input);
        return { success: true as const, ...result };
      }),

    pageEditorDeploy: adminProcedure
      .input(pageContentSchema)
      .mutation(async ({ input }) => {
        const result = await deployPageContent(input);
        return { success: true as const, ...result };
      }),

    pageEditorUploadImage: adminProcedure
      .input(
        z.object({
          fileName: z.string(),
          mimeType: z.string(),
          fileBase64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `page-content/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),

    // ─ Cart Image Upload ────────────────────────────────────────────────────────────────────
    uploadCartImage: adminProcedure
      .input(z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileBase64: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `cart-images/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await updatePricing({ cartImageUrl: url });
        return { url };
      }),

    // ─── Inspection Photos ────────────────────────────────────────────────────────
    uploadInspectionPhoto: adminProcedure
      .input(
        z.object({
          bookingId: z.number(),
          photoType: z.enum(["before", "after"]),
          fileName: z.string(),
          mimeType: z.string(),
          fileBase64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const fileKey = `inspection/${input.bookingId}/${input.photoType}-${nanoid(8)}.jpg`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await createInspectionPhoto({
          bookingId: input.bookingId,
          photoType: input.photoType,
          photoUrl: url,
          fileKey,
        });
        return { url, fileKey };
      }),

    getInspectionPhotos: adminProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return getInspectionPhotosByBooking(input.bookingId);
      }),

    // ─── SMS Notifications ────────────────────────────────────────────────────────
    sendSmsNotification: adminProcedure
      .input(
        z.object({
          bookingId: z.number(),
          phoneNumber: z.string(),
          notificationType: z.enum(["approval_confirmation", "reminder_24h"]),
          messageContent: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await createSmsNotification({
          bookingId: input.bookingId,
          phoneNumber: input.phoneNumber,
          notificationType: input.notificationType,
          messageContent: input.messageContent,
          status: "pending",
        });
        return { success: true };
      }),

    getSmsNotifications: adminProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return getSmsNotificationsByBooking(input.bookingId);
      }),

    // ─── Revenue Report ───────────────────────────────────────────────────────────
    getMonthlyReport: adminProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .query(async ({ input }) => {
        return getMonthlyRevenue(input.year, input.month);
      }),

    // ─── Update Promo Codes ───────────────────────────────────────────────────────────
    updatePromos: adminProcedure
      .input(z.object({
        codes: z.array(z.object({
          name: z.string().min(1),
          percent: z.number().min(1).max(100),
          days: z.number().int().min(1).optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        const stripe = getStripe();

        try {
          const results = [];

          for (const promo of input.codes) {
            if (!promo.name) continue;

            let coupon;
            try {
              // Check if a coupon with this ID already exists
              try {
                coupon = await stripe.coupons.retrieve(promo.name);
                // If the existing coupon has a different percent_off or days, we must delete and recreate
                // (Stripe does not allow updating percent_off on an existing coupon)
                const existingDays = coupon.metadata?.days ? parseInt(coupon.metadata.days) : undefined;
                const daysChanged = promo.days !== existingDays;
                if (coupon.percent_off !== promo.percent || daysChanged) {
                  // Deactivate any active promotion codes first
                  const existingCodes = await stripe.promotionCodes.list({
                    coupon: coupon.id,
                    active: true,
                    limit: 100,
                  });
                  for (const pc of existingCodes.data) {
                    await stripe.promotionCodes.update(pc.id, { active: false });
                  }
                  await stripe.coupons.del(coupon.id);
                  coupon = await stripe.coupons.create({
                    id: promo.name,
                    percent_off: promo.percent,
                    duration: 'forever',
                    metadata: promo.days ? { days: String(promo.days) } : {},
                  });
                }
              } catch (err: any) {
                if (err.status !== 404) throw err;
                // Not found — create fresh
                coupon = await stripe.coupons.create({
                  id: promo.name,
                  percent_off: promo.percent,
                  duration: 'forever',
                  metadata: promo.days ? { days: String(promo.days) } : {},
                });
              }
            } catch (e: any) {
              console.error(`Error handling coupon ${promo.name}:`, e);
              throw new Error(`Stripe Coupon Error (${promo.name}): ${e.message}`);
            }

            // Ensure a promotion code exists for this coupon
            if (coupon) {
              try {
                const promoCodes = await stripe.promotionCodes.list({
                  coupon: coupon.id,
                  code: promo.name,
                  active: true,
                  limit: 1,
                });
                if (promoCodes.data.length === 0) {
                  await stripe.promotionCodes.create({
                    promotion: { type: 'coupon', coupon: coupon.id },
                    code: promo.name,
                  });
                }
              } catch (e: any) {
                console.error(`Error handling promo code for ${promo.name}:`, e);
              }
              results.push(coupon);
            }
          }

          return { success: true, coupons: results };
        } catch (error: any) {
          console.error('Error updating promos:', error);
          const message = error?.message || 'Failed to update promo codes';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
        }
      }),

    // ─── List Active Promo Codes ──────────────────────────────────────────────────
    getPromoCodes: adminProcedure
      .query(async () => {
        const stripe = getStripe();
        try {
          // Fetch all active promotion codes (up to 100)
          const promoCodes = await stripe.promotionCodes.list({
            active: true,
            limit: 100,
          });
          // Also fetch the associated coupons so we can show percent_off
          const results = await Promise.all(
            promoCodes.data.map(async (pc) => {
              let percentOff: number | null = null;
              let amountOff: number | null = null;
              try {
                const couponRef = pc.promotion?.coupon;
                const couponId = typeof couponRef === 'string' ? couponRef : (couponRef as any)?.id;
                if (couponId) {
                  const coupon = await stripe.coupons.retrieve(couponId);
                  percentOff = coupon.percent_off ?? null;
                  amountOff = coupon.amount_off ?? null;
                }
              } catch {}
              let days: number | null = null;
              try {
                const couponRef2 = pc.promotion?.coupon;
                const couponId2 = typeof couponRef2 === 'string' ? couponRef2 : (couponRef2 as any)?.id;
                if (couponId2) {
                  const c2 = await stripe.coupons.retrieve(couponId2);
                  days = c2.metadata?.days ? parseInt(c2.metadata.days) : null;
                }
              } catch {}
              return {
                id: pc.id,
                code: pc.code,
                active: pc.active,
                percentOff,
                amountOff,
                days,
                timesRedeemed: pc.times_redeemed,
                expiresAt: pc.expires_at ?? null,
              };
            })
          );
          return results;
        } catch (error: any) {
          console.error('Error fetching promo codes:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error?.message || 'Failed to fetch promo codes' });
        }
      }),

    // ─── Deactivate a Promo Code ──────────────────────────────────────────────────
    deactivatePromoCode: adminProcedure
      .input(z.object({ promoCodeId: z.string() }))
      .mutation(async ({ input }) => {
        const stripe = getStripe();
        try {
          await stripe.promotionCodes.update(input.promoCodeId, { active: false });
          return { success: true };
        } catch (error: any) {
          console.error('Error deactivating promo code:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error?.message || 'Failed to deactivate promo code' });
        }
      }),
  }),

  // ─── Guest Messaging (public, by booking ref) ──────────────────────────────────
  messages: router({
    getByRef: publicProcedure
      .input(z.object({ ref: z.string() }))
      .query(async ({ input }) => {
        const booking = await getBookingByRef(input.ref);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        const messages = await getMessagesByBookingId(booking.id);
        // Mark admin messages as read since guest is viewing
        await markMessagesRead(booking.id, "guest");
        return { messages, guestName: booking.guestName };
      }),

    sendByRef: publicProcedure
      .input(z.object({ ref: z.string(), content: z.string().min(1).max(2000) }))
      .mutation(async ({ input }) => {
        const booking = await getBookingByRef(input.ref);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        await createMessage({
          bookingId: booking.id,
          senderRole: "guest",
          senderName: booking.guestName,
          content: input.content,
        });
        // Notify admin
        await sendEmail({
          type: "message_from_guest",
          booking,
          messageContent: input.content,
        }).catch(console.error);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
