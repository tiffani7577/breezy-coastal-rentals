import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

// Stripe webhook MUST be registered before express.json() to get raw body
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !sig) {
    res.status(400).send("Webhook secret not configured");
    return;
  }
  let event: any;
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-03-25.dahlia" as any });
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
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
    const session = event.data.object as any;
    const bookingRef = session.metadata?.bookingRef;
    if (bookingRef && session.payment_status === "paid") {
      try {
        const { updateBookingStripe, getBookingByRef } = await import("../server/db");
        const { sendEmail } = await import("../server/email");
        const booking = await getBookingByRef(bookingRef);
        if (booking && booking.bookingStatus === "pending_payment") {
          await updateBookingStripe(bookingRef, session.id, session.payment_intent);
          const updated = await getBookingByRef(bookingRef);
          if (updated) {
            await sendEmail({ type: "guest_confirmation", booking: updated }).catch(console.error);
            await sendEmail({ type: "admin_new_booking", booking: updated }).catch(console.error);
          }
        }
      } catch (err) {
        console.error("[Webhook] Failed to process checkout.session.completed:", err);
      }
    }
  }
  res.json({ received: true });
});

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth routes
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
