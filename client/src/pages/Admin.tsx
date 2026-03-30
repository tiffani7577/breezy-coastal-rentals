import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  Waves,
  LogOut,
  Check,
  X,
  Clock,
  FileText,
  Download,
  ChevronLeft,
  Plus,
  Trash2,
  DollarSign,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  MessageCircle,
  Send,
  Calendar,
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  pending_payment:  { label: "Waiting for Payment", emoji: "💳", color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  submitted:        { label: "New — Needs Review",  emoji: "🆕", color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  under_review:     { label: "Under Review",         emoji: "🔍", color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  approved:         { label: "Approved ✓",           emoji: "✅", color: "#166534", bg: "#dcfce7", border: "#86efac" },
  rejected:         { label: "Rejected",             emoji: "❌", color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
  completed:        { label: "Completed",            emoji: "🏁", color: "#374151", bg: "#f3f4f6", border: "#d1d5db" },
  cancelled:        { label: "Cancelled",            emoji: "🚫", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
};

type AdminView = "list" | "detail" | "calendar" | "settings";

// ─── Message Thread Component ─────────────────────────────────────────────────
function MessageThread({ bookingId, guestName }: { bookingId: number; guestName: string }) {
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = trpc.admin.getBookingDetailWithMessages.useQuery({ id: bookingId });
  const sendMsg = trpc.admin.sendMessage.useMutation({
    onSuccess: () => {
      setNewMsg("");
      refetch();
    },
    onError: () => toast.error("Could not send message. Please try again."),
  });

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    sendMsg.mutate({ bookingId, content: newMsg.trim() });
  };

  return (
    <div className="flex flex-col" style={{ height: "420px" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
        <MessageCircle className="w-5 h-5" style={{ color: "#0284c7" }} />
        <div>
          <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>Messages with {guestName}</p>
          <p className="text-gray-500" style={{ fontSize: "13px" }}>Messages are emailed to the guest automatically</p>
        </div>
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#f0f9ff" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-10 h-10 mb-3" style={{ color: "#93c5fd" }} />
            <p className="font-semibold text-gray-600" style={{ fontSize: "15px" }}>No messages yet</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>Type a message below to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.senderRole === "admin";
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    maxWidth: "80%",
                    background: isAdmin ? "#0284c7" : "white",
                    color: isAdmin ? "white" : "#1e293b",
                    border: isAdmin ? "none" : "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <p style={{ fontSize: "15px", lineHeight: "1.5", margin: 0 }}>{msg.content}</p>
                  <p style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7, textAlign: isAdmin ? "right" : "left" }}>
                    {isAdmin ? "You" : guestName} · {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-3 items-end" style={{ borderColor: "#e5e7eb", background: "white" }}>
        <Textarea
          placeholder="Type your message to the guest here…"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          className="flex-1 rounded-xl resize-none"
          style={{ fontSize: "15px", minHeight: "52px", maxHeight: "120px" }}
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={!newMsg.trim() || sendMsg.isPending}
          className="h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: "#0284c7", color: "white", border: "none" }}
        >
          {sendMsg.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}

// ─── Booking Detail View ──────────────────────────────────────────────────────
function BookingDetail({ bookingId, onBack }: { bookingId: number; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"info" | "messages" | "docs">("info");
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const { data, refetch } = trpc.admin.getBookingDetailWithMessages.useQuery({ id: bookingId });
  const updateStatus = trpc.admin.updateBookingStatus.useMutation();
  const utils = trpc.useUtils();

  const booking = data?.booking;
  const docs = data?.documents ?? [];
  const waiver = data?.waiver;
  const messages = data?.messages ?? [];
  const unreadCount = messages.filter(m => m.senderRole === "guest" && !m.isRead).length;

  const handleStatus = async (status: string, reason?: string) => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({ id: booking.id, status: status as any, rejectionReason: reason });
      toast.success(
        status === "approved" ? "✅ Booking approved! Guest has been notified." :
        status === "rejected" ? "❌ Booking rejected. Guest has been notified." :
        "Status updated successfully."
      );
      refetch();
      utils.admin.getAllBookings.invalidate();
      setShowRejectInput(false);
      setRejectionReason("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0284c7" }} />
      </div>
    );
  }

  const cfg = STATUS_CONFIG[booking.bookingStatus] ?? STATUS_CONFIG.submitted;
  const isSubmitted = booking.bookingStatus === "submitted" || booking.bookingStatus === "under_review";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-5 font-semibold"
        style={{ color: "#0284c7", fontSize: "16px" }}
      >
        <ChevronLeft className="w-5 h-5" />
        Back to All Bookings
      </button>

      {/* Guest name + status */}
      <div className="mb-5">
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}>
          {booking.guestName}
        </h1>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: "15px" }}
        >
          <span>{cfg.emoji}</span> {cfg.label}
        </div>
      </div>

      {/* Big action buttons — shown only for bookings that need a decision */}
      {isSubmitted && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: "#fef9ee", border: "2px solid #fde68a" }}>
          <p className="font-bold text-gray-800 mb-4" style={{ fontSize: "17px" }}>
            👋 This booking needs your decision
          </p>
          {!showRejectInput ? (
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatus("approved")}
                disabled={isUpdating}
                className="flex-1 h-14 rounded-xl font-bold text-white"
                style={{ background: "#16a34a", border: "none", fontSize: "16px" }}
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                Approve Booking
              </Button>
              <Button
                onClick={() => setShowRejectInput(true)}
                disabled={isUpdating}
                variant="outline"
                className="flex-1 h-14 rounded-xl font-bold"
                style={{ borderColor: "#ef4444", color: "#ef4444", fontSize: "16px" }}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject Booking
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="font-semibold text-gray-700" style={{ fontSize: "15px" }}>
                Why are you rejecting this booking? (optional — will be sent to guest)
              </Label>
              <Textarea
                placeholder="e.g. Documents could not be verified. Please contact us."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="rounded-xl"
                style={{ fontSize: "15px" }}
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleStatus("rejected", rejectionReason || undefined)}
                  disabled={isUpdating}
                  className="flex-1 h-12 rounded-xl font-bold text-white"
                  style={{ background: "#ef4444", border: "none", fontSize: "15px" }}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Rejection
                </Button>
                <Button
                  onClick={() => { setShowRejectInput(false); setRejectionReason(""); }}
                  variant="outline"
                  className="h-12 px-5 rounded-xl font-semibold"
                  style={{ fontSize: "15px" }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mark as completed button for approved bookings */}
      {booking.bookingStatus === "approved" && (
        <div className="mb-5">
          <Button
            onClick={() => handleStatus("completed")}
            disabled={isUpdating}
            variant="outline"
            className="h-12 rounded-xl font-semibold"
            style={{ borderColor: "#6b7280", color: "#6b7280", fontSize: "15px" }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Completed
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: "#e5e7eb" }}>
        {[
          { id: "info" as const, label: "Guest Info", icon: User },
          { id: "messages" as const, label: `Messages${unreadCount > 0 ? ` (${unreadCount} new)` : ""}`, icon: MessageCircle },
          { id: "docs" as const, label: "Documents", icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-3 font-semibold transition-colors"
            style={{
              fontSize: "15px",
              color: activeTab === id ? "#0284c7" : "#6b7280",
              borderBottom: activeTab === id ? "2px solid #0284c7" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Guest Info */}
      {activeTab === "info" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb", background: "white" }}>
          {[
            { icon: User, label: "Full Name", value: booking.guestName },
            { icon: Mail, label: "Email Address", value: booking.guestEmail },
            { icon: Phone, label: "Phone Number", value: booking.guestPhone },
            { icon: FileText, label: "Airbnb Booking Name", value: booking.airbnbBookingName },
            { icon: Calendar, label: "Rental Dates", value: `${format(new Date(booking.startDate), "MMMM d")} – ${format(new Date(booking.endDate), "MMMM d, yyyy")} (${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""})` },
            { icon: DollarSign, label: "Total Paid", value: `$${booking.totalAmount}` },
          ].map(({ icon: Icon, label, value }, i, arr) => (
            <div
              key={label}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dbeafe" }}>
                <Icon className="w-5 h-5" style={{ color: "#0284c7" }} />
              </div>
              <div className="flex-1">
                <p className="text-gray-500" style={{ fontSize: "13px" }}>{label}</p>
                <p className="font-semibold text-gray-900" style={{ fontSize: "16px" }}>{value}</p>
              </div>
            </div>
          ))}
          {waiver && (
            <div
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderTop: "1px solid #f1f5f9", background: "#f0fdf4" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#bbf7d0" }}>
                <Check className="w-5 h-5" style={{ color: "#16a34a" }} />
              </div>
              <div className="flex-1">
                <p className="text-gray-500" style={{ fontSize: "13px" }}>Waiver Signed</p>
                <p className="font-semibold text-gray-900" style={{ fontSize: "16px" }}>
                  {waiver.legalName} · {format(new Date(waiver.signedAt), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === "messages" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
          <MessageThread bookingId={bookingId} guestName={booking.guestName} />
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === "docs" && (
        <div className="space-y-3">
          {docs.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
              <p className="font-semibold text-gray-500" style={{ fontSize: "16px" }}>No documents uploaded yet</p>
            </div>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "white", border: "1px solid #e5e7eb" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dbeafe" }}>
                  <FileText className="w-6 h-6" style={{ color: "#0284c7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>
                    {doc.documentType === "drivers_license" ? "Driver's License" : "Proof of Insurance"}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: "13px" }}>
                    {doc.fileName ?? "Document"} · Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
                  style={{ background: "#dbeafe", color: "#0284c7", fontSize: "14px", textDecoration: "none" }}
                >
                  <Eye className="w-4 h-4" />
                  View
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [view, setView] = useState<AdminView>("list");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calendar state
  const [blockDate, setBlockDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");

  // Settings state
  const [dailyRate, setDailyRate] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [cartName, setCartName] = useState("");
  const [cartDesc, setCartDesc] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const { data: bookingsList, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery();
  const { data: unreadCounts } = trpc.admin.getUnreadCounts.useQuery();
  const { data: availData, refetch: refetchAvail } = trpc.availability.getBlockedDates.useQuery();
  const { data: pricingData, refetch: refetchPricing } = trpc.pricing.get.useQuery();

  const addBlock = trpc.availability.addBlock.useMutation();
  const removeBlock = trpc.availability.removeBlock.useMutation();
  const updatePricing = trpc.pricing.update.useMutation();

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#0284c7" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#f0f9ff" }}>
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "#0284c7" }}>
            <Waves className="w-10 h-10 text-white" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}>
            Breezy Admin
          </h1>
          <p className="text-gray-500 mb-8" style={{ fontSize: "16px" }}>Sign in to manage your bookings</p>
          <Button
            className="w-full h-14 rounded-2xl font-bold text-white"
            style={{ background: "#0284c7", border: "none", fontSize: "17px" }}
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "#ef4444" }} />
          <p className="font-bold text-gray-900" style={{ fontSize: "20px" }}>Access Denied</p>
          <p className="text-gray-500 mt-2" style={{ fontSize: "16px" }}>You don't have admin access.</p>
        </div>
      </div>
    );
  }

  const filteredBookings = (bookingsList ?? [])
    .filter((b) => statusFilter === "all" || b.bookingStatus === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalUnread = Object.values(unreadCounts ?? {}).reduce((a, b) => a + b, 0);
  const newBookings = (bookingsList ?? []).filter(b => b.bookingStatus === "submitted").length;

  const handleAddBlock = async () => {
    if (!blockDate) return;
    try {
      await addBlock.mutateAsync({ date: format(blockDate, "yyyy-MM-dd"), reason: blockReason || undefined });
      toast.success("Date blocked successfully");
      refetchAvail();
      setBlockDate(undefined);
      setBlockReason("");
    } catch {
      toast.error("Could not block date. Please try again.");
    }
  };

  const handleRemoveBlock = async (id: number) => {
    try {
      await removeBlock.mutateAsync({ id });
      toast.success("Date unblocked");
      refetchAvail();
    } catch {
      toast.error("Could not unblock date. Please try again.");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updatePricing.mutateAsync({ dailyRate: dailyRate || undefined, deliveryFee: deliveryFee || undefined, cartName: cartName || undefined, cartDescription: cartDesc || undefined });
      toast.success("Settings saved!");
      refetchPricing();
      setDailyRate(""); setDeliveryFee(""); setCartName(""); setCartDesc("");
    } catch {
      toast.error("Could not save settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Top navigation bar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background: "#0c4a6e", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <Waves className="w-6 h-6 text-white" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "20px", color: "white" }}>
            Breezy Admin
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
          style={{ background: "rgba(255,255,255,0.12)", color: "white", fontSize: "14px" }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Bottom tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: "white", borderTop: "1px solid #e5e7eb", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}
      >
        {[
          { id: "list" as AdminView, icon: User, label: "Bookings", badge: newBookings > 0 ? newBookings : 0 },
          { id: "calendar" as AdminView, icon: Calendar, label: "Calendar", badge: 0 },
          { id: "settings" as AdminView, icon: Settings, label: "Settings", badge: 0 },
        ].map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => { setView(id); setSelectedBookingId(null); }}
            className="flex-1 flex flex-col items-center gap-1 py-3 relative"
            style={{ color: view === id && selectedBookingId === null ? "#0284c7" : "#9ca3af" }}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge > 0 && (
                <span
                  className="absolute -top-1 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "#ef4444", fontSize: "10px" }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="pb-24">

        {/* ── Booking Detail ──────────────────────────────────────────── */}
        {selectedBookingId && (
          <BookingDetail
            bookingId={selectedBookingId}
            onBack={() => setSelectedBookingId(null)}
          />
        )}

        {/* ── Bookings List ───────────────────────────────────────────── */}
        {!selectedBookingId && view === "list" && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
                Your Bookings
              </h1>
              <button
                onClick={() => refetchBookings()}
                className="p-2 rounded-xl"
                style={{ background: "#dbeafe", color: "#0284c7" }}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Summary chips */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {newBookings > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold" style={{ background: "#dbeafe", color: "#1e40af", fontSize: "13px" }}>
                  🆕 {newBookings} new booking{newBookings > 1 ? "s" : ""} to review
                </div>
              )}
              {totalUnread > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold" style={{ background: "#fef3c7", color: "#92400e", fontSize: "13px" }}>
                  💬 {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 rounded-xl px-4 border font-semibold"
                style={{ borderColor: "#e5e7eb", background: "white", fontSize: "15px", color: "#374151" }}
              >
                <option value="all">Show All Bookings</option>
                <option value="submitted">New — Needs Review</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Booking cards */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                  <p className="font-semibold text-gray-400" style={{ fontSize: "17px" }}>No bookings found</p>
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const cfg = STATUS_CONFIG[b.bookingStatus] ?? STATUS_CONFIG.submitted;
                  const unread = (unreadCounts ?? {})[b.id] ?? 0;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className="w-full text-left rounded-2xl p-5 transition-all"
                      style={{
                        background: "white",
                        border: `1px solid ${b.bookingStatus === "submitted" ? "#93c5fd" : "#e5e7eb"}`,
                        boxShadow: b.bookingStatus === "submitted" ? "0 0 0 3px rgba(147,197,253,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a" }}>{b.guestName}</p>
                          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "2px" }}>
                            {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")} · {b.totalDays} day{b.totalDays > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div
                          className="flex-shrink-0 px-3 py-1.5 rounded-full font-bold"
                          style={{ background: cfg.bg, color: cfg.color, fontSize: "13px", border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.emoji} {cfg.label}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#0284c7" }}>${b.totalAmount}</p>
                        <div className="flex items-center gap-2">
                          {unread > 0 && (
                            <span
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full font-bold"
                              style={{ background: "#fef3c7", color: "#92400e", fontSize: "12px" }}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {unread} new
                            </span>
                          )}
                          <span style={{ fontSize: "14px", color: "#9ca3af" }}>Tap to open →</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Calendar Tab ────────────────────────────────────────────── */}
        {!selectedBookingId && view === "calendar" && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
              Block Dates
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontSize: "15px" }}>
              Use this to mark dates when the cart is not available (maintenance, personal use, etc.)
            </p>

            <div className="rounded-2xl p-5 mb-5" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <p className="font-bold text-gray-800 mb-3" style={{ fontSize: "16px" }}>Pick a date to block:</p>
              <DayPicker
                mode="single"
                selected={blockDate}
                onSelect={setBlockDate}
                disabled={[{ before: new Date() }]}
                className="w-full"
              />
              <Input
                placeholder="Reason (optional) — e.g. Maintenance"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="h-12 rounded-xl mt-3"
                style={{ fontSize: "15px" }}
              />
              <Button
                onClick={handleAddBlock}
                disabled={!blockDate}
                className="w-full h-13 rounded-xl font-bold text-white mt-3"
                style={{ background: "#0284c7", border: "none", fontSize: "16px", height: "52px" }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Block This Date
              </Button>
            </div>

            <div>
              <p className="font-bold text-gray-700 mb-3" style={{ fontSize: "16px" }}>Currently Blocked Dates:</p>
              {(availData?.blocks ?? []).length === 0 ? (
                <p className="text-gray-400" style={{ fontSize: "15px" }}>No dates blocked right now.</p>
              ) : (
                <div className="space-y-2">
                  {availData?.blocks.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-4 rounded-2xl"
                      style={{ background: "white", border: "1px solid #e5e7eb" }}
                    >
                      <div>
                        <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>
                          {format(new Date(b.blockDate), "EEEE, MMMM d, yyyy")}
                        </p>
                        {b.reason && <p className="text-gray-500" style={{ fontSize: "14px" }}>{b.reason}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveBlock(b.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "#fee2e2" }}
                      >
                        <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Settings Tab ────────────────────────────────────────────── */}
        {!selectedBookingId && view === "settings" && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
              Settings
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontSize: "15px" }}>
              Update your pricing and cart details here.
            </p>

            {pricingData && (
              <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: "#16a34a" }} />
                <p className="font-semibold text-gray-800" style={{ fontSize: "15px" }}>
                  Current rate: <strong>${pricingData.dailyRate}/day</strong> · Cart: <strong>{pricingData.cartName}</strong>
                </p>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Daily Rate ($)</Label>
                    <Input
                      type="number"
                      placeholder={pricingData?.dailyRate ?? "89.00"}
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      className="h-12 rounded-xl"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Delivery Fee ($)</Label>
                    <Input
                      type="number"
                      placeholder={pricingData?.deliveryFee ?? "0.00"}
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="h-12 rounded-xl"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Cart Name</Label>
                  <Input
                    placeholder={pricingData?.cartName ?? "Breezy Golf Cart"}
                    value={cartName}
                    onChange={(e) => setCartName(e.target.value)}
                    className="h-12 rounded-xl"
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Cart Description</Label>
                  <Textarea
                    placeholder={pricingData?.cartDescription ?? "Describe the golf cart..."}
                    value={cartDesc}
                    onChange={(e) => setCartDesc(e.target.value)}
                    className="rounded-xl"
                    style={{ fontSize: "15px" }}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full h-14 rounded-xl font-bold text-white"
                  style={{ background: "#0284c7", border: "none", fontSize: "17px" }}
                >
                  {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
