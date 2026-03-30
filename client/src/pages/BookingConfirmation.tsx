import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Waves, Check, Clock, ChevronRight, Loader2, Calendar, User, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

export default function BookingConfirmation() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref") ?? "";
  const sessionId = params.get("session_id") ?? "";
  const [confirmed, setConfirmed] = useState(false);

  const confirmPayment = trpc.bookings.confirmPayment.useMutation();
  const { data, isLoading } = trpc.bookings.getByRef.useQuery(
    { ref },
    { enabled: !!ref && confirmed }
  );

  useEffect(() => {
    if (ref && sessionId && !confirmed) {
      confirmPayment.mutateAsync({ bookingRef: ref, sessionId }).then(() => {
        setConfirmed(true);
      }).catch(console.error);
    }
  }, [ref, sessionId]);

  if (!ref) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid booking link.</p>
          <Link href="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!confirmed || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.93 0.04 215)" }}
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="font-semibold text-foreground">Confirming your payment...</p>
          <p className="text-sm text-muted-foreground mt-1">Just a moment</p>
        </div>
      </div>
    );
  }

  const booking = data?.booking;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.99 0.005 220)" }}>
      {/* Header */}
      <div
        className="px-4 py-4"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid oklch(0.93 0.01 220)" }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "16px" }}>
            Breezy
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Success badge */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, oklch(0.62 0.15 175) 0%, oklch(0.52 0.18 175) 100%)" }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1
            className="text-2xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Booking Submitted!
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Your payment was received. We're reviewing your documents and will confirm shortly.
          </p>
        </div>

        {/* Booking ref card */}
        <div
          className="rounded-2xl p-5 mb-5 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)",
          }}
        >
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Booking Reference</p>
          <p
            className="text-white font-bold text-3xl tracking-widest"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {ref}
          </p>
          <p className="text-white/60 text-xs mt-2">Save this for your records</p>
        </div>

        {/* Booking details */}
        {booking && (
          <div
            className="rounded-2xl overflow-hidden mb-5"
            style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
          >
            <div className="p-4" style={{ borderBottom: "1px solid oklch(0.93 0.01 220)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rental Details</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Rental Period</p>
                  <p className="text-sm font-semibold text-foreground">
                    {format(new Date(booking.startDate), "MMM d")} – {format(new Date(booking.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Guest</p>
                  <p className="text-sm font-semibold text-foreground">{booking.guestName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Confirmation sent to</p>
                  <p className="text-sm font-semibold text-foreground">{booking.guestEmail}</p>
                </div>
              </div>
              <div className="h-px" style={{ background: "oklch(0.93 0.01 220)" }} />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="font-bold text-lg text-primary">${booking.totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status timeline */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "oklch(0.97 0.01 220)", border: "1px solid oklch(0.90 0.015 220)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">What Happens Next</p>
          <div className="space-y-4">
            {[
              { label: "Booking submitted", desc: "Payment received — you're all set", done: true },
              { label: "Document review", desc: "We'll review your license and insurance", done: false, active: true },
              { label: "Approval notification", desc: "You'll receive an email once approved", done: false },
              { label: "Enjoy your ride!", desc: "Cart will be ready at the property", done: false },
            ].map(({ label, desc, done, active }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: done
                      ? "oklch(0.62 0.15 175)"
                      : active
                      ? "oklch(0.48 0.18 232)"
                      : "oklch(0.90 0.01 220)",
                  }}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : active ? (
                    <Clock className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href={`/booking/status?ref=${ref}`}>
          <Button
            className="w-full h-14 rounded-2xl text-base font-semibold"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)",
              color: "white",
              border: "none",
            }}
          >
            View Booking Status
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full mt-2 h-12 rounded-2xl text-muted-foreground">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
