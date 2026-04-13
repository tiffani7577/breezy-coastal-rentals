/**
 * Creates flat-rate Stripe promo codes for Breezy Coastal Rentals.
 * Run: node scripts/create-promo-codes.mjs
 *
 * SeaShell5 = $700 flat (5-night stay)
 * SeaShell6 = $800 flat (6-night stay)
 * SeaShell7 = $900 flat (7-night stay)
 *
 * Strategy: We create Stripe coupons with a fixed amount_off that brings
 * the total down to the flat rate. Since the cart is $160/day + 7% tax,
 * we create "amount_off" coupons that discount to the flat rate.
 * However, Stripe promo codes can't set a fixed final price directly.
 *
 * Better approach: Create coupons with a percentage discount that the
 * admin applies manually, OR use a fixed-amount coupon that discounts
 * from the computed total. Since the total varies by dates, we use
 * a different strategy: create a special Stripe Price for each flat rate
 * and override the line item when the promo code is detected server-side.
 *
 * For simplicity with allow_promotion_codes: true on Stripe Checkout,
 * we create coupons with a fixed amount_off equal to the difference
 * from the base price for that number of nights.
 *
 * 5 nights: $160 * 5 = $800 + 7% tax = $856. Discount to $700 = $156 off
 * 6 nights: $160 * 6 = $960 + 7% tax = $1027.20. Discount to $800 = $227.20 off
 * 7 nights: $160 * 7 = $1120 + 7% tax = $1198.40. Discount to $900 = $298.40 off
 *
 * NOTE: Since guests may pick different date ranges, the cleanest approach
 * is to create these as Stripe coupons with a fixed amount_off and
 * note that they are intended for specific night counts.
 */

import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const promoCodes = [
  {
    code: "SEASHELL5",
    name: "5-Night Flat Rate",
    // 5 nights: base $800 + 7% tax = $856. Flat rate $700. Discount = $156
    amountOff: 15600, // in cents
    nights: 5,
    flatRate: 700,
  },
  {
    code: "SEASHELL6",
    name: "6-Night Flat Rate",
    // 6 nights: base $960 + 7% tax = $1027.20. Flat rate $800. Discount = $227.20
    amountOff: 22720, // in cents
    nights: 6,
    flatRate: 800,
  },
  {
    code: "SEASHELL7",
    name: "7-Night Flat Rate",
    // 7 nights: base $1120 + 7% tax = $1198.40. Flat rate $900. Discount = $298.40
    amountOff: 29840, // in cents
    nights: 7,
    flatRate: 900,
  },
];

async function createPromoCodes() {
  for (const promo of promoCodes) {
    try {
      // Create coupon first
      const coupon = await stripe.coupons.create({
        name: promo.name,
        amount_off: promo.amountOff,
        currency: "usd",
        duration: "once",
      });

      // Create promotion code linked to coupon
      const promoCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: promo.code,
      });

      console.log(`✅ Created: ${promo.code} → $${promo.flatRate} flat rate (${promo.nights} nights) | Coupon: ${coupon.id} | PromoCode: ${promoCode.id}`);
    } catch (err) {
      if (err.code === "resource_already_exists") {
        console.log(`⚠️  ${promo.code} already exists — skipping`);
      } else {
        console.error(`❌ Error creating ${promo.code}:`, err.message);
      }
    }
  }
}

createPromoCodes();
