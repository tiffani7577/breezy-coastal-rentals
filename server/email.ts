import { Resend } from "resend";
import type { Booking } from "../drizzle/schema";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email send");
    return null;
  }
  return new Resend(key);
}

// Using Resend shared sender until domain DNS is verified.
// Switch back to: "Breezy Coastal Rentals <bookings@breezycoastalrentals.com>" after Resend domain verification.
const FROM = "Breezy Coastal Rentals <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@breezycoastalrentals.com";
const APP_URL = process.env.APP_URL ?? "https://breezycoastalrentals.com";

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

type EmailPayload =
  | { type: "guest_confirmation"; booking: Booking }
  | { type: "guest_approved"; booking: Booking }
  | { type: "guest_rejected"; booking: Booking; reason?: string }
  | { type: "admin_new_booking"; booking: Booking }
  | { type: "message_from_admin"; booking: Booking; messageContent: string }
  | { type: "message_from_guest"; booking: Booking; messageContent: string };

export async function sendEmail(payload: EmailPayload) {
  const resend = getResend();
  if (!resend) return;

  const { type, booking } = payload;

  const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e;`;
  const headerBg = `background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);`;

  const wrapHtml = (title: string, body: string) => `
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
            <p style="margin:0;font-size:12px;color:#94a3b8;font-family:sans-serif;">Cape Canaveral, FL · BreezyCoastalRentals.com</p>
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
      ${booking.originalAmount && parseFloat(booking.originalAmount.toString()) !== parseFloat(booking.totalAmount.toString()) ? `
      <tr>
        <td style="font-size:13px;color:#64748b;padding-bottom:4px;font-family:sans-serif;">Original Price</td>
        <td style="font-size:13px;color:#94a3b8;text-align:right;text-decoration:line-through;font-family:sans-serif;">$${parseFloat(booking.originalAmount.toString()).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#16a34a;padding-bottom:4px;font-family:sans-serif;">Discount Applied</td>
        <td style="font-size:13px;color:#16a34a;text-align:right;font-family:sans-serif;">-$${(parseFloat(booking.originalAmount.toString()) - parseFloat(booking.totalAmount.toString())).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;font-family:sans-serif;font-weight:600;">Total Paid</td>
        <td style="font-size:13px;font-weight:700;color:#0284c7;text-align:right;font-family:sans-serif;">$${booking.totalAmount}</td>
      </tr>
      ` : `
      <tr>
        <td style="font-size:13px;color:#64748b;font-family:sans-serif;">Total Paid</td>
        <td style="font-size:13px;font-weight:700;color:#0284c7;text-align:right;font-family:sans-serif;">$${booking.totalAmount}</td>
      </tr>
      `}
    </table>
  </td></tr>
</table>`;

  if (type === "guest_confirmation") {
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Your Breezy Golf Cart is Reserved! 🏖️ — Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "Booking Received!",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">Your golf cart rental has been submitted and we're reviewing your documents. You'll hear from us shortly!</p>
        ${bookingCard}
        <p style="font-size:14px;color:#64748b;line-height:1.6;font-family:sans-serif;">We'll notify you once your booking is approved. In the meantime, check your booking status anytime:</p>
        <a href="${APP_URL}/booking/status?ref=${booking.bookingRef}" style="display:inline-block;margin-top:16px;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">View Booking Status</a>`
      ),
    });
  } else if (type === "guest_approved") {
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Your Golf Cart is Approved! 🎉 — Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "You're All Set! 🌴",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">Great news — your golf cart rental has been <strong style="color:#16a34a;">approved!</strong> The cart will be ready for you at the property.</p>
        ${bookingCard}
        <p style="font-size:14px;color:#64748b;line-height:1.6;font-family:sans-serif;">Enjoy exploring Cape Canaveral! 🏖️ The beach is just a short ride away.</p>`
      ),
    });
  } else if (type === "guest_rejected") {
    const reason = (payload as any).reason;
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Booking Update — Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "Booking Update",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">Unfortunately, we were unable to approve your golf cart rental booking.</p>
        ${reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:16px 0;"><p style="margin:0;font-size:14px;color:#dc2626;font-family:sans-serif;"><strong>Reason:</strong> ${reason}</p></div>` : ""}
        ${bookingCard}
        <p style="font-size:14px;color:#64748b;line-height:1.6;font-family:sans-serif;">A refund has been initiated and will appear on your statement within 5–10 business days. Please contact us if you have any questions.</p>`
      ),
    });
  } else if (type === "admin_new_booking") {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Booking: ${booking.guestName} — Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "New Booking Submitted",
        `<p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;font-family:sans-serif;">A new golf cart rental booking has been submitted and is awaiting your review.</p>
        ${bookingCard}
        <table width="100%" style="margin-bottom:16px;">
          <tr><td style="font-size:13px;color:#64748b;padding-bottom:6px;font-family:sans-serif;">Guest</td><td style="font-size:13px;font-weight:600;color:#1e293b;text-align:right;font-family:sans-serif;">${booking.guestName}</td></tr>
          <tr><td style="font-size:13px;color:#64748b;padding-bottom:6px;font-family:sans-serif;">Email</td><td style="font-size:13px;color:#1e293b;text-align:right;font-family:sans-serif;">${booking.guestEmail}</td></tr>
          <tr><td style="font-size:13px;color:#64748b;font-family:sans-serif;">Phone</td><td style="font-size:13px;color:#1e293b;text-align:right;font-family:sans-serif;">${booking.guestPhone}</td></tr>
        </table>
        <a href="${APP_URL}/admin" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">Review in Dashboard →</a>`
      ),
    });
  } else if (type === "message_from_admin") {
    const msg = (payload as any).messageContent as string;
    await resend.emails.send({
      from: FROM,
      to: booking.guestEmail,
      subject: `Message from Breezy — Ref #${booking.bookingRef}`,
      html: wrapHtml(
        "You have a message from Breezy",
        `<p style="font-size:16px;margin:0 0 8px;font-family:sans-serif;">Hi ${booking.guestName},</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 16px;font-family:sans-serif;">You received a message about your golf cart rental:</p>
        <div style="background:#f0f9ff;border-left:4px solid #0284c7;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.6;font-family:sans-serif;">${msg}</p>
        </div>
        <a href="${APP_URL}/booking/status?ref=${booking.bookingRef}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">Reply in Your Booking →</a>`
      ),
    });
  } else if (type === "message_from_guest") {
    const msg = (payload as any).messageContent as string;
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Message from ${booking.guestName} — Ref #${booking.bookingRef}`,
      html: wrapHtml(
        `Message from ${booking.guestName}`,
        `<p style="font-size:14px;color:#64748b;margin:0 0 16px;font-family:sans-serif;">A guest sent you a message about their booking:</p>
        <div style="background:#f0f9ff;border-left:4px solid #0284c7;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.6;font-family:sans-serif;">${msg}</p>
        </div>
        ${bookingCard}
        <a href="${APP_URL}/admin" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;font-family:sans-serif;">Reply in Dashboard →</a>`
      ),
    });
  }
}
