import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  Clock,
  Check,
  X,
  AlertCircle,
  Search,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending_payment: { label: "Pending Payment", color: "oklch(0.55 0.14 60)", bg: "oklch(0.96 0.04 80)", icon: Clock },
  submitted: { label: "Submitted", color: "oklch(0.48 0.18 232)", bg: "oklch(0.93 0.04 215)", icon: Clock },
  under_review: { label: "Under Review", color: "oklch(0.55 0.14 60)", bg: "oklch(0.96 0.04 80)", icon: Clock },
  approved: { label: "Approved", color: "oklch(0.45 0.15 175)", bg: "oklch(0.95 0.04 175)", icon: Check },
  rejected: { label: "Rejected", color: "oklch(0.55 0.22 25)", bg: "oklch(0.96 0.04 25)", icon: X },
  completed: { label: "Completed", color: "oklch(0.45 0.15 175)", bg: "oklch(0.95 0.04 175)", icon: Check },
  cancelled: { label: "Cancelled", color: "oklch(0.55 0.04 230)", bg: "oklch(0.93 0.01 220)", icon: X },
};

const DOC_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "oklch(0.55 0.14 60)", bg: "oklch(0.96 0.04 80)" },
  received: { label: "Received", color: "oklch(0.48 0.18 232)", bg: "oklch(0.93 0.04 215)" },
  needs_update: { label: "Needs Update", color: "oklch(0.55 0.22 25)", bg: "oklch(0.96 0.04 25)" },
  approved: { label: "Approved", color: "oklch(0.45 0.15 175)", bg: "oklch(0.95 0.04 175)" },
};

export default function BookingStatus() {
  const params = new URLSearchParams(window.location.search);
  const initialRef = params.get("ref") ?? "";
  const [searchRef, setSearchRef] = useState(initialRef);
  const [activeRef, setActiveRef] = useState(initialRef);

  const { data, isLoading, error } = trpc.bookings.getByRef.useQuery(
    { ref: activeRef },
    { enabled: !!activeRef }
  );

  const booking = data?.booking;
  const statusCfg = booking ? STATUS_CONFIG[booking.bookingStatus] ?? STATUS_CONFIG.submitted : null;
  const docCfg = booking ? DOC_STATUS_CONFIG[booking.documentStatus] ?? DOC_STATUS_CONFIG.pending : null;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.99 0.005 220)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-4"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid oklch(0.93 0.01 220)" }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.96 0.01 220)" }}>
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <Waves className="w-5 h-5 text-primary" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "16px" }}>
              Booking Status
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-2">Enter your booking reference</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. ABC123XYZ"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              className="h-12 rounded-xl text-base flex-1"
              style={{ border: "1px solid oklch(0.88 0.015 220)" }}
            />
            <Button
              className="h-12 px-4 rounded-xl"
              style={{ background: "oklch(0.48 0.18 232)", color: "white", border: "none" }}
              onClick={() => setActiveRef(searchRef)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "oklch(0.93 0.04 215)" }}>
              <Clock className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground text-sm">Loading your booking...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-5 text-center" style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.90 0.04 25)" }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.55 0.22 25)" }} />
            <p className="font-semibold text-foreground">Booking not found</p>
            <p className="text-sm text-muted-foreground mt-1">Check your reference number and try again.</p>
          </div>
        )}

        {booking && statusCfg && docCfg && (
          <div className="space-y-4">
            {/* Status card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
            >
              <div
                className="p-5"
                style={{ background: `linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)` }}
              >
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Booking Reference</p>
                <p className="text-white font-bold text-2xl tracking-widest mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {booking.bookingRef}
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Booking Status</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: statusCfg.bg, color: statusCfg.color }}
                      >
                        <statusCfg.icon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Documents</p>
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: docCfg.bg, color: docCfg.color }}
                    >
                      {docCfg.label}
                    </div>
                  </div>
                </div>

                {booking.bookingStatus === "rejected" && booking.rejectionReason && (
                  <div
                    className="rounded-xl p-3 mb-4"
                    style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.90 0.04 25)" }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.55 0.22 25)" }}>Rejection Reason</p>
                    <p className="text-sm text-foreground">{booking.rejectionReason}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rental Period</p>
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(booking.startDate), "MMM d")} – {format(new Date(booking.endDate), "MMM d, yyyy")}
                        <span className="text-muted-foreground font-normal ml-1">({booking.totalDays} days)</span>
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
                      <p className="text-xs text-muted-foreground">Email</p>
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
            </div>

            {/* Status messages */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "oklch(0.97 0.01 220)", border: "1px solid oklch(0.90 0.015 220)" }}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Status Updates</p>
              <div className="space-y-3">
                {[
                  {
                    label: "Booking submitted",
                    done: true,
                    desc: `Submitted on ${format(new Date(booking.createdAt), "MMM d, yyyy")}`,
                  },
                  {
                    label: "Documents received",
                    done: ["received", "approved"].includes(booking.documentStatus),
                    desc: booking.documentStatus === "needs_update" ? "Action required — please re-upload" : "License and insurance uploaded",
                  },
                  {
                    label: "Booking approved",
                    done: ["approved", "completed"].includes(booking.bookingStatus),
                    desc: booking.bookingStatus === "rejected" ? "Booking was not approved" : "Awaiting admin review",
                    rejected: booking.bookingStatus === "rejected",
                  },
                  {
                    label: "Rental complete",
                    done: booking.bookingStatus === "completed",
                    desc: "Enjoy your ride!",
                  },
                ].map(({ label, done, desc, rejected }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: rejected
                          ? "oklch(0.55 0.22 25)"
                          : done
                          ? "oklch(0.62 0.15 175)"
                          : "oklch(0.90 0.01 220)",
                      }}
                    >
                      {rejected ? (
                        <X className="w-3.5 h-3.5 text-white" />
                      ) : done ? (
                        <Check className="w-3.5 h-3.5 text-white" />
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
          </div>
        )}

        {!activeRef && !isLoading && (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.93 0.04 215)" }}
            >
              <Search className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Enter your booking reference</p>
            <p className="text-sm text-muted-foreground mt-1">
              Find it in your confirmation email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
