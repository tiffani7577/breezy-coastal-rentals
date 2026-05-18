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
  Camera,
  ClipboardCheck,
  LayoutTemplate,
} from "lucide-react";
import PageEditor from "./admin/PageEditor";
import AdminLoginForm from "./admin/AdminLoginForm";
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

type AdminView = "list" | "detail" | "calendar" | "settings" | "dashboard" | "pageEditor";

// ─── Quick Message Modal ────────────────────────────────────────────────────────────────────
function QuickMessageModal({ bookingId, guestName, onClose }: { bookingId: number; guestName: string; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const QUICK_MESSAGES = [
    "Cart is ready for you! 😊",
    "Your booking has been approved!",
    "Please re-upload your documents.",
    "Do you have any questions before your rental?",
  ];
  const sendMsg = trpc.admin.sendMessage.useMutation({
    onSuccess: () => { toast.success("Message sent!"); onClose(); },
    onError: () => toast.error("Could not send. Please try again."),
  });
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4" style={{ background: "white" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: "18px" }}>Quick Message</p>
            <p className="text-gray-500" style={{ fontSize: "14px" }}>to {guestName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#f1f5f9" }}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_MESSAGES.map(q => (
            <button key={q} onClick={() => setMsg(q)}
              className="px-3 py-2 rounded-xl font-medium text-left"
              style={{ background: msg === q ? "#dbeafe" : "#f1f5f9", color: msg === q ? "#1e40af" : "#374151", fontSize: "13px", border: msg === q ? "1px solid #93c5fd" : "1px solid transparent" }}>
              {q}
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Or type a custom message…"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          className="rounded-xl resize-none"
          style={{ fontSize: "15px" }}
          rows={3}
        />
        <Button
          onClick={() => sendMsg.mutate({ bookingId, content: msg.trim() })}
          disabled={!msg.trim() || sendMsg.isPending}
          className="w-full h-14 rounded-xl font-bold text-white"
          style={{ background: "#0284c7", border: "none", fontSize: "16px" }}
        >
          {sendMsg.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
          Send Message
        </Button>
      </div>
    </div>
  );
}

// ─── Inspection Checklist Component ────────────────────────────────────────────────────────────────────
const INSPECTION_ITEMS = [
  { key: "batteryCharged",      label: "Battery fully charged",         icon: "🔋" },
  { key: "tiresInflated",       label: "Tires properly inflated",        icon: "🛞" },
  { key: "brakesWorking",       label: "Brakes working correctly",       icon: "🛑" },
  { key: "steeringWorking",     label: "Steering smooth & responsive",   icon: "🔄" },
  { key: "signalLightsWorking", label: "Signal lights working",          icon: "🔆" },
  { key: "brakeLightsWorking",  label: "Brake lights working",           icon: "🔴" },
  { key: "headlightsWorking",   label: "Headlights working",             icon: "💡" },
  { key: "bodyFrameOk",         label: "Body & frame — no damage",       icon: "🏎️" },
  { key: "seatbeltsOk",         label: "Seatbelts in good condition",    icon: "🪢" },
  { key: "cleanAndReady",       label: "Cart clean and ready for guest", icon: "✨" },
] as const;
type InspectionKey = typeof INSPECTION_ITEMS[number]["key"];

function InspectionChecklist({ bookingId }: { bookingId: number }) {
  const defaultState = Object.fromEntries(INSPECTION_ITEMS.map(i => [i.key, false])) as Record<InspectionKey, boolean>;
  const [items, setItems] = useState<Record<InspectionKey, boolean>>(defaultState);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { data: existing } = trpc.admin.getInspection.useQuery({ bookingId });
  const save = trpc.admin.saveInspection.useMutation({
    onSuccess: () => { setSaved(true); toast.success("Inspection saved! ✅"); },
    onError: () => toast.error("Could not save. Please try again."),
  });
  useEffect(() => {
    if (existing) {
      const loaded = {} as Record<InspectionKey, boolean>;
      INSPECTION_ITEMS.forEach(i => { loaded[i.key] = !!(existing as any)[i.key]; });
      setItems(loaded);
      setNotes(existing.notes ?? "");
      setSaved(true);
    }
  }, [existing]);
  const allPassed = INSPECTION_ITEMS.every(i => items[i.key]);
  const passedCount = INSPECTION_ITEMS.filter(i => items[i.key]).length;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4" style={{ background: allPassed ? "#f0fdf4" : "#fef9ee", border: `1px solid ${allPassed ? "#86efac" : "#fde68a"}` }}>
        <p className="font-bold mb-2" style={{ fontSize: "15px", color: allPassed ? "#166534" : "#92400e" }}>
          {allPassed ? "✅ All checks passed — cart is ready!" : `${passedCount} of ${INSPECTION_ITEMS.length} checks completed`}
        </p>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(passedCount / INSPECTION_ITEMS.length) * 100}%`, background: allPassed ? "#16a34a" : "#f59e0b" }} />
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb", background: "white" }}>
        {INSPECTION_ITEMS.map(({ key, label, icon }, i) => (
          <button key={key} onClick={() => { setItems(prev => ({ ...prev, [key]: !prev[key] })); setSaved(false); }}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
            style={{ borderBottom: i < INSPECTION_ITEMS.length - 1 ? "1px solid #f1f5f9" : "none", background: items[key] ? "#f0fdf4" : "white" }}>
            <span style={{ fontSize: "22px" }}>{icon}</span>
            <p className="flex-1 font-semibold" style={{ fontSize: "16px", color: items[key] ? "#166534" : "#374151" }}>{label}</p>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: items[key] ? "#16a34a" : "#e5e7eb" }}>
              {items[key] && <Check className="w-4 h-4 text-white" />}
            </div>
          </button>
        ))}
      </div>
      <div>
        <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Notes (optional)</Label>
        <Textarea placeholder="Any issues or observations…" value={notes} onChange={e => { setNotes(e.target.value); setSaved(false); }}
          className="rounded-xl" style={{ fontSize: "15px" }} rows={3} />
      </div>
      <Button onClick={() => save.mutate({ bookingId, ...items, notes: notes || undefined })} disabled={save.isPending}
        className="w-full h-14 rounded-xl font-bold text-white"
        style={{ background: allPassed ? "#16a34a" : "#0284c7", border: "none", fontSize: "17px" }}>
        {save.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ClipboardCheck className="w-5 h-5 mr-2" />}
        {saved ? "Update Inspection Record" : "Save Inspection"}
      </Button>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<"info" | "messages" | "docs" | "inspection">("info");
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
          { id: "inspection" as const, label: "Inspection", icon: ClipboardCheck },
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

      {/* Tab: Inspection */}
      {activeTab === "inspection" && (
        <InspectionChecklist bookingId={bookingId} />
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
  const isAdminSession = Boolean(isAuthenticated && user?.role === "admin");
  const hasResolvedAuth = useRef(false);
  if (!loading) {
    hasResolvedAuth.current = true;
  }
  const [adminAuthed, setAdminAuthed] = useState(false);
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
  const [promo7, setPromo7] = useState("");
  const [promo6, setPromo6] = useState("");
  const [promo5, setPromo5] = useState("");
  const [promo7Name, setPromo7Name] = useState("SEASHELL7");
  const [promo6Name, setPromo6Name] = useState("SEASHELL6");
  const [promo5Name, setPromo5Name] = useState("SEASHELL5");
  const [searchGuest, setSearchGuest] = useState("");
  const [isSavingPromos, setIsSavingPromos] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [showInspection, setShowInspection] = useState<number | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [inspectionPhotos, setInspectionPhotos] = useState<File[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [quickMsg, setQuickMsg] = useState<{ bookingId: number; guestName: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const cartImageInputRef = useRef<HTMLInputElement>(null);
  const uploadCartImage = trpc.admin.uploadCartImage.useMutation({
    onSuccess: () => { toast.success("Cart photo updated!"); refetchPricing(); },
    onError: () => toast.error("Could not upload photo. Please try again."),
  });
  const handleCartImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Photo must be under 10MB"); return; }
    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadCartImage.mutateAsync({ fileName: file.name, mimeType: file.type, fileBase64: base64 });
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch { setIsUploadingImage(false); }
  };

  const { data: bookingsList, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery(
    undefined,
    { enabled: isAdminSession }
  );
  const { data: unreadCounts } = trpc.admin.getUnreadCounts.useQuery(undefined, {
    enabled: isAdminSession,
  });
  const { data: availData, refetch: refetchAvail } = trpc.availability.getBlockedDates.useQuery(
    undefined,
    { enabled: isAdminSession }
  );
  const { data: pricingData, refetch: refetchPricing } = trpc.pricing.get.useQuery(undefined, {
    enabled: isAdminSession,
  });

  // Calculate approved booking dates for calendar
  const approvedBookingDates = (bookingsList ?? [])
    .filter(b => b.bookingStatus === "approved")
    .flatMap(b => {
      const dates = [];
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    });

  const blockedDates = (availData?.blocks ?? []).map(b => new Date(b.blockDate));

  // Calculate daily/weekly/monthly revenue
  const calculateRevenue = () => {
    const approved = (bookingsList ?? []).filter(b => b.bookingStatus === "approved");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const toNumber = (val: any) => {
      if (val === null || val === undefined) return 0;
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      return isNaN(num) ? 0 : num;
    };
    
    const dailyTotal = approved
      .filter(b => new Date(b.startDate).toDateString() === today.toDateString())
      .reduce((sum, b) => sum + toNumber(b.totalAmount), 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weeklyTotal = approved
      .filter(b => {
        const start = new Date(b.startDate);
        return start >= weekStart && start <= weekEnd;
      })
      .reduce((sum, b) => sum + toNumber(b.totalAmount), 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyTotal = approved
      .filter(b => {
        const start = new Date(b.startDate);
        return start >= monthStart && start <= monthEnd;
      })
      .reduce((sum, b) => sum + toNumber(b.totalAmount), 0);
    
    return { dailyTotal, weeklyTotal, monthlyTotal };
  };

  const revenue = calculateRevenue();

  const addBlock = trpc.availability.addBlock.useMutation();
  const removeBlock = trpc.availability.removeBlock.useMutation();
  const updatePricing = trpc.pricing.update.useMutation();

  // Auth guard — use new admin email/password login
  if (loading && !hasResolvedAuth.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#0284c7" }} />
      </div>
    );
  }

  // Show login form if not authenticated OR not admin role
  if (!isAuthenticated || user?.role !== "admin") {
    if (adminAuthed && !loading) {
      // Auth state has resolved — refetch to pick up new session
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#0284c7" }} />
        </div>
      );
    }
    return <AdminLoginForm onSuccess={() => setAdminAuthed(true)} />;
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
      {quickMsg && <QuickMessageModal bookingId={quickMsg.bookingId} guestName={quickMsg.guestName} onClose={() => setQuickMsg(null)} />}
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
        { id: "dashboard" as AdminView, icon: DollarSign, label: "Revenue", badge: 0 },
          { id: "settings" as AdminView, icon: Settings, label: "Settings", badge: 0 },
          { id: "pageEditor" as AdminView, icon: LayoutTemplate, label: "Page Editor", badge: 0 },
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const rows = (bookingsList ?? []);
                    if (!rows.length) return;
                    const headers = ["Ref","Guest Name","Email","Phone","Start Date","End Date","Days","Total Paid","Status","Doc Status","Created At"];
                    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
                    const csv = [
                      headers.join(","),
                      ...rows.map(b => [
                        escape(b.bookingRef),
                        escape(b.guestName),
                        escape(b.guestEmail),
                        escape(b.guestPhone),
                        escape(b.startDate),
                        escape(b.endDate),
                        escape(b.totalDays),
                        escape(b.totalAmount ? `$${Number(b.totalAmount).toFixed(2)}` : ""),
                        escape(b.bookingStatus),
                        escape(b.documentStatus),
                        escape(b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""),
                      ].join(","))
                    ].join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `breezy-bookings-${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm"
                  style={{ background: "#dcfce7", color: "#15803d" }}
                  title="Export all bookings as CSV"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => refetchBookings()}
                  className="p-2 rounded-xl"
                  style={{ background: "#dbeafe", color: "#0284c7" }}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Summary chips */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {newBookings > 0 && (
                <button onClick={() => { setStatusFilter("submitted"); setView("list"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold cursor-pointer hover:opacity-80" style={{ background: "#dbeafe", color: "#1e40af", fontSize: "13px" }}>
                  🆕 {newBookings} new booking{newBookings > 1 ? "s" : ""} to review
                </button>
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
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedBookingId(b.id)}
                      onKeyDown={e => e.key === 'Enter' && setSelectedBookingId(b.id)}
                      className="w-full text-left rounded-2xl p-5 transition-all cursor-pointer"
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
                          <button
                            onClick={e => { e.stopPropagation(); setQuickMsg({ bookingId: b.id, guestName: b.guestName }); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold"
                            style={{ background: "#0284c7", color: "white", fontSize: "13px" }}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
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
            <div className="flex gap-4 mb-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "#fee2e2" }}></div>
                <span className="text-gray-600">Already Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "#fef3c7" }}></div>
                <span className="text-gray-600">Manually Blocked</span>
              </div>
            </div>
            <div className="mb-4 p-4 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
              <p className="font-bold text-gray-800 mb-2" style={{ fontSize: "15px" }}>📅 Booked Dates:</p>
              {approvedBookingDates.length === 0 ? (
                <p className="text-gray-600" style={{ fontSize: "14px" }}>No dates booked yet</p>
              ) : (
                <div className="space-y-1">
                  {(bookingsList ?? []).filter(b => b.bookingStatus === "approved").map(b => (
                    <p key={b.id} className="text-gray-700" style={{ fontSize: "14px" }}>
                      <strong>{b.guestName}</strong>: {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-5 mb-5" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <p className="font-bold text-gray-800 mb-3" style={{ fontSize: "16px" }}>Pick a date to block:</p>
              <DayPicker
                mode="single"
                selected={blockDate}
                onSelect={setBlockDate}
                disabled={(date) => {
                  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                  return approvedBookingDates.some(d => d.toDateString() === date.toDateString());
                }}
                className="w-full"
                modifiers={{
                  booked: approvedBookingDates,
                  blocked: blockedDates,
                }}
                modifiersStyles={{
                  booked: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" },
                  blocked: { background: "#fef3c7", color: "#92400e", fontWeight: "bold" },
                }}
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

        
        {/* ── Revenue Dashboard Tab ────────────────────────────────────────────── */}
        {!selectedBookingId && view === "dashboard" && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => setView("list")}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
              style={{ fontSize: "14px" }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Bookings
            </button>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
              Revenue Dashboard
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontSize: "15px" }}>
              Track your daily, weekly, and monthly earnings
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <p className="text-gray-600 text-sm mb-2">Today</p>
                <p className="text-3xl font-bold text-gray-900">${(revenue?.dailyTotal ?? 0).toFixed(2)}</p>
              </div>
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <p className="text-gray-600 text-sm mb-2">This Week</p>
                <p className="text-3xl font-bold text-gray-900">${(revenue?.weeklyTotal ?? 0).toFixed(2)}</p>
              </div>
              <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <p className="text-gray-600 text-sm mb-2">This Month</p>
                <p className="text-3xl font-bold text-gray-900">${(revenue?.monthlyTotal ?? 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: "18px" }}>Approved Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Guest</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Dates</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Days</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bookingsList ?? [])
                      .filter(b => b.bookingStatus === "approved")
                      .map(b => {
                        const amount = typeof b.totalAmount === 'number' ? b.totalAmount : parseFloat(String(b.totalAmount || 0));
                        return (
                          <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td className="py-3 px-4 text-gray-900">{b.guestName}</td>
                            <td className="py-3 px-4 text-gray-600">{format(new Date(b.startDate), "MMM d")} - {format(new Date(b.endDate), "MMM d")}</td>
                            <td className="py-3 px-4 text-gray-600">{b.totalDays}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900">${amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Page Editor Tab ─────────────────────────────────────────── */}
        {!selectedBookingId && view === "pageEditor" && <PageEditor />}

        {/* ── Settings Tab ────────────────────────────────────────────── */}
        {!selectedBookingId && view === "settings" && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <button
              onClick={() => setView("list")}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
              style={{ fontSize: "14px" }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Bookings
            </button>
            
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
                  <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Cart Photo</Label>
                  <input ref={cartImageInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCartImageChange} />
                  {pricingData?.cartImageUrl && (
                    <img src={pricingData.cartImageUrl} alt="Cart" className="w-full rounded-xl mb-3 object-cover" style={{ maxHeight: "180px" }} />
                  )}
                  <button
                    onClick={() => cartImageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{ background: "#f0f9ff", border: "2px dashed #7dd3fc", color: "#0284c7", fontSize: "16px" }}
                  >
                    {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    {isUploadingImage ? "Uploading…" : pricingData?.cartImageUrl ? "Replace Cart Photo" : "Upload Cart Photo"}
                  </button>
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

            <div className="mt-8 rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <div className="p-5">
                <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: "18px" }}>Promo Codes</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Code Name</Label>
                    <Input type="text" placeholder="SEASHELL7" value={promo7Name} onChange={(e) => setPromo7Name(e.target.value.toUpperCase())} className="h-12 rounded-xl" style={{ fontSize: "16px" }} />
                    <Label className="font-bold text-gray-700 mb-2 block mt-3" style={{ fontSize: "15px" }}>Price ($)</Label>
                    <Input type="number" placeholder="950" value={promo7} onChange={(e) => setPromo7(e.target.value)} className="h-12 rounded-xl" style={{ fontSize: "16px" }} />
                    <p className="text-gray-500 text-sm mt-1">7 nights</p>
                  </div>
                  <div>
                    <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Code Name</Label>
                    <Input type="text" placeholder="SEASHELL6" value={promo6Name} onChange={(e) => setPromo6Name(e.target.value.toUpperCase())} className="h-12 rounded-xl" style={{ fontSize: "16px" }} />
                    <Label className="font-bold text-gray-700 mb-2 block mt-3" style={{ fontSize: "15px" }}>Price ($)</Label>
                    <Input type="number" placeholder="850" value={promo6} onChange={(e) => setPromo6(e.target.value)} className="h-12 rounded-xl" style={{ fontSize: "16px" }} />
                    <p className="text-gray-500 text-sm mt-1">6 nights</p>
                  </div>
                  <div>
                    <Label className="font-bold text-gray-700 mb-2 block" style={{ fontSize: "15px" }}>Code Name</Label>
                    <Input type="text" placeholder="SEASHELL5" value={promo5Name} onChange={(e) => setPromo5Name(e.target.value.toUpperCase())} className="h-12 rounded-xl" style={{ fontSize: "16px" }} />
                    <Label className="font-bold text-gray-700 mb-2 block mt-3" style={{ fontSize: "15px" }}>Price ($)</Label>
                    <Input type="number" placeholder="750" value={promo5} onChange={(e) => setPromo5(e.target.value)} className="h-12 rounded-xl" style={{ fontSize: "16px" }} />
                    <p className="text-gray-500 text-sm mt-1">5 nights</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    setIsSavingPromos(true);
                    try {
                      await trpc.admin.updatePromos.mutate({
                        promo7: { name: promo7Name, price: parseInt(promo7) || 950 },
                        promo6: { name: promo6Name, price: parseInt(promo6) || 850 },
                        promo5: { name: promo5Name, price: parseInt(promo5) || 750 }
                      });
                      toast.success("Promo codes updated in Stripe!");
                    } catch (error) {
                      toast.error("Failed to update promo codes");
                    } finally {
                      setIsSavingPromos(false);
                    }
                  }}
                  disabled={isSavingPromos}
                  className="w-full h-12 rounded-xl font-bold text-white mt-4"
                  style={{ background: "#10b981", border: "none", fontSize: "16px" }}
                >
                  {isSavingPromos ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Save Promo Codes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
