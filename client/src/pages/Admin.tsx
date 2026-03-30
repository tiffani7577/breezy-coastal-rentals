import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  Waves,
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Download,
  ChevronRight,
  Plus,
  Trash2,
  DollarSign,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Pending Payment", color: "oklch(0.55 0.14 60)", bg: "oklch(0.96 0.04 80)" },
  submitted: { label: "Submitted", color: "oklch(0.48 0.18 232)", bg: "oklch(0.93 0.04 215)" },
  under_review: { label: "Under Review", color: "oklch(0.55 0.14 60)", bg: "oklch(0.96 0.04 80)" },
  approved: { label: "Approved", color: "oklch(0.45 0.15 175)", bg: "oklch(0.95 0.04 175)" },
  rejected: { label: "Rejected", color: "oklch(0.55 0.22 25)", bg: "oklch(0.96 0.04 25)" },
  completed: { label: "Completed", color: "oklch(0.45 0.15 175)", bg: "oklch(0.95 0.04 175)" },
  cancelled: { label: "Cancelled", color: "oklch(0.55 0.04 230)", bg: "oklch(0.93 0.01 220)" },
};

type AdminTab = "bookings" | "calendar" | "settings";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>("bookings");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Booking detail state
  const [newStatus, setNewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Calendar state
  const [blockDate, setBlockDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");

  // Settings state
  const [dailyRate, setDailyRate] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [cartName, setCartName] = useState("");
  const [cartDesc, setCartDesc] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Data
  const { data: bookingsList, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery();
  const { data: bookingDetail, refetch: refetchDetail } = trpc.admin.getBookingDetail.useQuery(
    { id: selectedBookingId! },
    { enabled: !!selectedBookingId }
  );
  const { data: availData, refetch: refetchAvail } = trpc.availability.getBlockedDates.useQuery();
  const { data: pricingData, refetch: refetchPricing } = trpc.pricing.get.useQuery();

  const updateStatus = trpc.admin.updateBookingStatus.useMutation();
  const addBlock = trpc.availability.addBlock.useMutation();
  const removeBlock = trpc.availability.removeBlock.useMutation();
  const updatePricing = trpc.pricing.update.useMutation();

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "oklch(0.99 0.005 220)" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "oklch(0.93 0.04 215)" }}>
            <Waves className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mb-6">Sign in to manage your golf cart rental business.</p>
          <Button
            className="w-full h-12 rounded-xl"
            style={{ background: "oklch(0.48 0.18 232)", color: "white", border: "none" }}
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="font-semibold text-foreground">Access Denied</p>
          <p className="text-sm text-muted-foreground mt-1">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  const filteredBookings = (bookingsList ?? []).filter(
    (b) => statusFilter === "all" || b.bookingStatus === statusFilter
  );

  const handleUpdateStatus = async () => {
    if (!selectedBookingId || !newStatus) return;
    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({
        id: selectedBookingId,
        status: newStatus as any,
        adminNotes: adminNotes || undefined,
        rejectionReason: rejectionReason || undefined,
      });
      toast.success("Booking status updated");
      refetchBookings();
      refetchDetail();
      setNewStatus("");
      setRejectionReason("");
      setAdminNotes("");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddBlock = async () => {
    if (!blockDate) return;
    try {
      await addBlock.mutateAsync({
        date: format(blockDate, "yyyy-MM-dd"),
        reason: blockReason || undefined,
      });
      toast.success("Date blocked");
      refetchAvail();
      setBlockDate(undefined);
      setBlockReason("");
    } catch {
      toast.error("Failed to block date");
    }
  };

  const handleRemoveBlock = async (id: number) => {
    try {
      await removeBlock.mutateAsync({ id });
      toast.success("Date unblocked");
      refetchAvail();
    } catch {
      toast.error("Failed to remove block");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updatePricing.mutateAsync({
        dailyRate: dailyRate || undefined,
        deliveryFee: deliveryFee || undefined,
        cartName: cartName || undefined,
        cartDescription: cartDesc || undefined,
      });
      toast.success("Settings saved");
      refetchPricing();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const booking = bookingDetail?.booking;
  const docs = bookingDetail?.documents ?? [];
  const waiver = bookingDetail?.waiver;

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.97 0.008 220)" }}>
      {/* Sidebar */}
      <div
        className="w-64 flex-shrink-0 hidden md:flex flex-col"
        style={{ background: "oklch(0.12 0.06 240)", minHeight: "100vh" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5" style={{ color: "oklch(0.62 0.15 215)" }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "17px", color: "white" }}>
              Breezy Admin
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {user.name ?? user.email}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "bookings" as AdminTab, icon: LayoutDashboard, label: "Bookings" },
            { id: "calendar" as AdminTab, icon: Calendar, label: "Availability" },
            { id: "settings" as AdminTab, icon: Settings, label: "Settings" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: tab === id ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === id ? "white" : "rgba(255,255,255,0.5)",
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex" style={{ background: "oklch(0.12 0.06 240)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { id: "bookings" as AdminTab, icon: LayoutDashboard, label: "Bookings" },
          { id: "calendar" as AdminTab, icon: Calendar, label: "Availability" },
          { id: "settings" as AdminTab, icon: Settings, label: "Settings" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3"
            style={{ color: tab === id ? "white" : "rgba(255,255,255,0.4)" }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        {/* ── Bookings Tab ─────────────────────────────────────── */}
        {tab === "bookings" && (
          <div className="flex h-full">
            {/* Booking list */}
            <div
              className="w-full md:w-80 flex-shrink-0 border-r overflow-y-auto"
              style={{ borderColor: "oklch(0.90 0.015 220)", background: "white", maxHeight: "100vh" }}
            >
              <div className="p-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: "oklch(0.90 0.015 220)" }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Bookings
                  </h2>
                  <button onClick={() => refetchBookings()} className="text-muted-foreground hover:text-foreground">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 rounded-lg text-sm px-2 border"
                  style={{ borderColor: "oklch(0.88 0.015 220)", background: "oklch(0.99 0.004 220)" }}
                >
                  <option value="all">All Bookings</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                {filteredBookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">No bookings found</p>
                  </div>
                ) : (
                  filteredBookings.map((b) => {
                    const cfg = STATUS_CONFIG[b.bookingStatus] ?? STATUS_CONFIG.submitted;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className="w-full p-4 text-left border-b hover:bg-accent/30 transition-colors"
                        style={{
                          borderColor: "oklch(0.93 0.01 220)",
                          background: selectedBookingId === b.id ? "oklch(0.95 0.025 220)" : "transparent",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{b.guestName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{b.bookingRef}</p>
                          </div>
                          <div
                            className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs font-semibold text-primary mt-0.5">${b.totalAmount}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Booking detail */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "100vh" }}>
              {!selectedBookingId ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <LayoutDashboard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a booking to view details</p>
                  </div>
                </div>
              ) : booking ? (
                <div className="max-w-2xl space-y-5">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {booking.guestName}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">{booking.bookingRef}</p>
                  </div>

                  {/* Guest info */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: "oklch(0.93 0.01 220)", background: "oklch(0.98 0.005 220)" }}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guest Information</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { icon: User, label: "Name", value: booking.guestName },
                        { icon: Mail, label: "Email", value: booking.guestEmail },
                        { icon: Phone, label: "Phone", value: booking.guestPhone },
                        { icon: FileText, label: "Airbnb Name", value: booking.airbnbBookingName },
                        { icon: Calendar, label: "Dates", value: `${format(new Date(booking.startDate), "MMM d")} – ${format(new Date(booking.endDate), "MMM d, yyyy")} (${booking.totalDays} days)` },
                        { icon: DollarSign, label: "Total", value: `$${booking.totalAmount}` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex-1 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="text-sm font-medium text-foreground">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: "oklch(0.93 0.01 220)", background: "oklch(0.98 0.005 220)" }}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status Management</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex gap-3 flex-wrap">
                        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "pending_payment" && k !== "cancelled").map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setNewStatus(key)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={{
                              background: newStatus === key ? cfg.color : cfg.bg,
                              color: newStatus === key ? "white" : cfg.color,
                              border: `1px solid ${cfg.color}`,
                            }}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                      {newStatus === "rejected" && (
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1 block">Rejection Reason</Label>
                          <Textarea
                            placeholder="Reason for rejection (sent to guest)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="rounded-xl text-sm"
                            rows={2}
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-xs font-semibold text-foreground mb-1 block">Admin Notes (internal)</Label>
                        <Textarea
                          placeholder="Internal notes..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="rounded-xl text-sm"
                          rows={2}
                        />
                      </div>
                      <Button
                        onClick={handleUpdateStatus}
                        disabled={!newStatus || isUpdating}
                        className="w-full h-10 rounded-xl text-sm font-semibold"
                        style={{ background: "oklch(0.48 0.18 232)", color: "white", border: "none" }}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Update Status
                      </Button>
                    </div>
                  </div>

                  {/* Documents */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: "oklch(0.93 0.01 220)", background: "oklch(0.98 0.005 220)" }}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {docs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                      ) : (
                        docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: "oklch(0.97 0.008 220)", border: "1px solid oklch(0.90 0.015 220)" }}
                          >
                            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{doc.fileName ?? doc.documentType}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {doc.documentType.replace("_", " ")} · {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-semibold text-primary"
                            >
                              <Download className="w-3.5 h-3.5" />
                              View
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Waiver */}
                  {waiver && (
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
                    >
                      <div className="p-4 border-b" style={{ borderColor: "oklch(0.93 0.01 220)", background: "oklch(0.98 0.005 220)" }}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Waiver Signature</p>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Signed Name</span>
                          <span className="font-semibold italic" style={{ fontFamily: "'Playfair Display', serif" }}>{waiver.legalName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Signed At</span>
                          <span className="font-medium">{format(new Date(waiver.signedAt), "MMM d, yyyy h:mm a")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">IP Address</span>
                          <span className="font-medium font-mono text-xs">{waiver.ipAddress ?? "—"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Agreed</span>
                          <span className={waiver.agreedToTerms ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {waiver.agreedToTerms ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Calendar Tab ─────────────────────────────────────── */}
        {tab === "calendar" && (
          <div className="p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Availability Calendar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-4 bg-white"
                style={{ border: "1px solid oklch(0.90 0.015 220)" }}
              >
                <p className="text-sm font-semibold text-foreground mb-3">Block a Date</p>
                <DayPicker
                  mode="single"
                  selected={blockDate}
                  onSelect={setBlockDate}
                  disabled={[{ before: new Date() }]}
                  className="w-full"
                />
                <div className="mt-3 space-y-2">
                  <Input
                    placeholder="Reason (optional)"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="h-10 rounded-xl text-sm"
                  />
                  <Button
                    onClick={handleAddBlock}
                    disabled={!blockDate}
                    className="w-full h-10 rounded-xl text-sm"
                    style={{ background: "oklch(0.48 0.18 232)", color: "white", border: "none" }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Block Date
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Blocked Dates</p>
                <div className="space-y-2">
                  {(availData?.blocks ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No dates blocked.</p>
                  ) : (
                    availData?.blocks.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white"
                        style={{ border: "1px solid oklch(0.90 0.015 220)" }}
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {format(new Date(b.blockDate), "MMM d, yyyy")}
                          </p>
                          {b.reason && <p className="text-xs text-muted-foreground">{b.reason}</p>}
                        </div>
                        <button
                          onClick={() => handleRemoveBlock(b.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: "oklch(0.96 0.04 25)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.22 25)" }} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-sm font-semibold text-foreground mt-5 mb-3">Approved Bookings</p>
                <div className="space-y-2">
                  {(availData?.approvedRanges ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No approved bookings.</p>
                  ) : (
                    availData?.approvedRanges.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl"
                        style={{ background: "oklch(0.95 0.04 175)", border: "1px solid oklch(0.88 0.06 175)" }}
                      >
                        <p className="text-sm font-semibold" style={{ color: "oklch(0.35 0.12 175)" }}>
                          {format(new Date(r.startDate), "MMM d")} – {format(new Date(r.endDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Tab ─────────────────────────────────────── */}
        {tab === "settings" && (
          <div className="p-6 max-w-lg">
            <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cart & Pricing Settings
            </h2>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid oklch(0.90 0.015 220)", background: "white" }}
            >
              <div className="p-4 border-b" style={{ borderColor: "oklch(0.93 0.01 220)", background: "oklch(0.98 0.005 220)" }}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Settings</p>
                {pricingData && (
                  <p className="text-sm text-foreground mt-1">
                    ${pricingData.dailyRate}/day · {pricingData.cartName}
                  </p>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">Daily Rate ($)</Label>
                    <Input
                      type="number"
                      placeholder={pricingData?.dailyRate ?? "89.00"}
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">Delivery Fee ($)</Label>
                    <Input
                      type="number"
                      placeholder={pricingData?.deliveryFee ?? "0.00"}
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">Cart Name</Label>
                  <Input
                    placeholder={pricingData?.cartName ?? "Breezy Golf Cart"}
                    value={cartName}
                    onChange={(e) => setCartName(e.target.value)}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">Cart Description</Label>
                  <Textarea
                    placeholder={pricingData?.cartDescription ?? "Describe the golf cart..."}
                    value={cartDesc}
                    onChange={(e) => setCartDesc(e.target.value)}
                    className="rounded-xl text-sm"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full h-10 rounded-xl text-sm font-semibold"
                  style={{ background: "oklch(0.48 0.18 232)", color: "white", border: "none" }}
                >
                  {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
