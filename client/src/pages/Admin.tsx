import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  LogOut,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MessageCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type AdminView = "home" | "bookings" | "calendar" | "messages";

export default function Admin() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<AdminView>("home");
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const bookingsQuery = trpc.admin.getAllBookings.useQuery();
  const bookings = bookingsQuery.data ?? [];

  const updateStatus = trpc.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      bookingsQuery.refetch();
      setSelectedBooking(null);
    },
  });

  const sendMessage = trpc.admin.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent!");
      setMessageText("");
    },
  });



  if (!user) {
    return <div className="p-4 text-center text-gray-600">Loading...</div>;
  }

  const todayBooking = bookings.find(b => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const today = new Date();
    return start <= today && today <= end && b.bookingStatus === "approved";
  });

  const pendingCount = bookings.filter(b => b.bookingStatus === "submitted").length;
  const approvedCount = bookings.filter(b => b.bookingStatus === "approved").length;
  const totalRevenue = bookings
    .filter(b => b.bookingStatus === "approved")
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);

  // ─── HOME VIEW ───────────────────────────────────────────────────────────────
  if (view === "home") {
    return (
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
        {/* Header */}
        <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between" style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Breezy Admin</h1>
            <p className="text-sm text-gray-500">Dorothy's Golf Cart</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* STATUS CARDS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl text-center" style={{ background: "#dcfce7", border: "2px solid #86efac" }}>
              <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
              <p className="text-xs text-green-600 mt-1">Approved</p>
            </div>
            <div className="p-4 rounded-2xl text-center" style={{ background: "#dbeafe", border: "2px solid #93c5fd" }}>
              <p className="text-3xl font-bold text-blue-700">{pendingCount}</p>
              <p className="text-xs text-blue-600 mt-1">Pending</p>
            </div>
            <div className="p-4 rounded-2xl text-center" style={{ background: "#fef3c7", border: "2px solid #fde68a" }}>
              <p className="text-2xl font-bold text-amber-700">${totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-amber-600 mt-1">Revenue</p>
            </div>
          </div>

          {/* TODAY'S BOOKING */}
          {todayBooking && (
            <div className="p-4 rounded-2xl" style={{ background: "white", border: "2px solid #0284c7" }}>
              <p className="text-sm font-semibold text-gray-600 mb-2">TODAY'S RENTAL</p>
              <p className="text-xl font-bold text-gray-900">{todayBooking.guestName}</p>
              <p className="text-sm text-gray-600 mt-1">📞 {todayBooking.guestPhone}</p>
              <div className="flex gap-2 mt-3">
                <Button className="flex-1 h-12 rounded-xl font-bold" style={{ background: "#16a34a", color: "white" }}>
                  ✓ Picked Up
                </Button>
                <Button className="flex-1 h-12 rounded-xl font-bold" style={{ background: "#dc2626", color: "white" }}>
                  ✓ Returned
                </Button>
              </div>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setView("bookings")}
              className="p-4 rounded-2xl text-left transition hover:scale-105"
              style={{ background: "white", border: "1px solid #e2e8f0" }}
            >
              <p className="text-2xl">📋</p>
              <p className="font-bold text-gray-900 mt-2">Bookings</p>
              <p className="text-xs text-gray-500 mt-1">{bookings.length} total</p>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
            </button>

            <button
              onClick={() => setView("calendar")}
              className="p-4 rounded-2xl text-left transition hover:scale-105"
              style={{ background: "white", border: "1px solid #e2e8f0" }}
            >
              <p className="text-2xl">📅</p>
              <p className="font-bold text-gray-900 mt-2">Calendar</p>
              <p className="text-xs text-gray-500 mt-1">Block dates</p>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
            </button>

            <button
              onClick={() => setView("messages")}
              className="p-4 rounded-2xl text-left transition hover:scale-105"
              style={{ background: "white", border: "1px solid #e2e8f0" }}
            >
              <p className="text-2xl">💬</p>
              <p className="font-bold text-gray-900 mt-2">Messages</p>
              <p className="text-xs text-gray-500 mt-1">Send to guests</p>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
            </button>

            <button
              className="p-4 rounded-2xl text-left transition hover:scale-105"
              style={{ background: "white", border: "1px solid #e2e8f0" }}
            >
              <p className="text-2xl">⚙️</p>
              <p className="font-bold text-gray-900 mt-2">Settings</p>
              <p className="text-xs text-gray-500 mt-1">Pricing & info</p>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── BOOKINGS VIEW ───────────────────────────────────────────────────────────────
  if (view === "bookings") {
    const currentBooking = bookings.find(b => b.id === selectedBooking);

    if (currentBooking) {
      return (
        <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
          <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
            <button onClick={() => setSelectedBooking(null)} className="mr-3">
              <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">{currentBooking.guestName}</h2>
          </div>

          <div className="max-w-2xl mx-auto p-4 space-y-4">
            <div className="p-4 rounded-2xl" style={{ background: "white" }}>
              <p className="text-sm text-gray-600 font-semibold">BOOKING REF</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{currentBooking.bookingRef}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                <p className="text-xs text-gray-600 font-semibold">CHECK-IN</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{format(new Date(currentBooking.startDate), "MMM d")}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                <p className="text-xs text-gray-600 font-semibold">CHECK-OUT</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{format(new Date(currentBooking.endDate), "MMM d")}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl" style={{ background: "white" }}>
              <p className="text-xs text-gray-600 font-semibold">CONTACT</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{currentBooking.guestPhone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900 text-sm">{currentBooking.guestEmail}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl" style={{ background: "white" }}>
              <p className="text-xs text-gray-600 font-semibold">TOTAL</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${currentBooking.totalAmount}</p>
            </div>

            {currentBooking.bookingStatus === "submitted" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateStatus.mutate({ id: currentBooking.id, status: "approved" });
                  }}
                  className="flex-1 h-14 rounded-xl font-bold text-white"
                  style={{ background: "#16a34a" }}
                >
                  ✓ APPROVE
                </Button>
                <Button
                  onClick={() => {
                    updateStatus.mutate({ id: currentBooking.id, status: "rejected" });
                  }}
                  className="flex-1 h-14 rounded-xl font-bold text-white"
                  style={{ background: "#dc2626" }}
                >
                  ✗ REJECT
                </Button>
              </div>
            )}

            <Button
              onClick={() => setView("messages")}
              className="w-full h-14 rounded-xl font-bold text-white"
              style={{ background: "#0284c7" }}
            >
              💬 SEND MESSAGE
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
        <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
          <button onClick={() => setView("home")} className="mr-3">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-2">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings yet</div>
          ) : (
            bookings.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBooking(b.id)}
                className="w-full p-4 rounded-2xl text-left transition hover:shadow-md"
                style={{ background: "white", border: "1px solid #e2e8f0" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{b.guestName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${b.totalAmount}</p>
                    <p
                      className="text-xs font-semibold mt-1 px-2 py-1 rounded-lg"
                      style={{
                        background: b.bookingStatus === "approved" ? "#dcfce7" : b.bookingStatus === "submitted" ? "#dbeafe" : "#fee2e2",
                        color: b.bookingStatus === "approved" ? "#166534" : b.bookingStatus === "submitted" ? "#1e40af" : "#991b1b",
                      }}
                    >
                      {b.bookingStatus === "approved" ? "✓ Approved" : b.bookingStatus === "submitted" ? "🆕 Pending" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ─── CALENDAR VIEW ───────────────────────────────────────────────────────────────
  if (view === "calendar") {
    return (
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
        <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
          <button onClick={() => setView("home")} className="mr-3">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Block Dates</h2>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          <div className="p-6 rounded-2xl text-center" style={{ background: "white" }}>
            <p className="text-gray-600">Calendar blocking feature coming soon.</p>
            <p className="text-sm text-gray-500 mt-2">For now, manage availability through the bookings list.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── MESSAGES VIEW ───────────────────────────────────────────────────────────────
  if (view === "messages") {
    const selectedMsg = bookings.find(b => b.id === selectedBooking);

    if (selectedMsg) {
      return (
        <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
          <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
            <button onClick={() => setSelectedBooking(null)} className="mr-3">
              <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Message {selectedMsg.guestName}</h2>
          </div>

          <div className="max-w-2xl mx-auto p-4 space-y-4">
            <div className="space-y-2">
              <Button
                onClick={() => setMessageText("Cart is ready for you!")}
                className="w-full h-12 rounded-xl justify-start text-left"
                style={{ background: "#f1f5f9", color: "#374151" }}
              >
                Cart is ready for you!
              </Button>
              <Button
                onClick={() => setMessageText("Your booking has been approved!")}
                className="w-full h-12 rounded-xl justify-start text-left"
                style={{ background: "#f1f5f9", color: "#374151" }}
              >
                Your booking has been approved!
              </Button>
              <Button
                onClick={() => setMessageText("Please re-upload your documents.")}
                className="w-full h-12 rounded-xl justify-start text-left"
                style={{ background: "#f1f5f9", color: "#374151" }}
              >
                Please re-upload your documents.
              </Button>
              <Button
                onClick={() => setMessageText("Thanks for renting with us!")}
                className="w-full h-12 rounded-xl justify-start text-left"
                style={{ background: "#f1f5f9", color: "#374151" }}
              >
                Thanks for renting with us!
              </Button>
            </div>

            <Textarea
              placeholder="Or type a custom message…"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="rounded-xl resize-none"
              rows={4}
            />

            <Button
              onClick={() => {
                sendMessage.mutate({ bookingId: selectedMsg.id, content: messageText.trim() });
                setMessageText("");
              }}
              disabled={!messageText.trim() || sendMessage.isPending}
              className="w-full h-14 rounded-xl font-bold text-white"
              style={{ background: "#0284c7" }}
            >
              SEND MESSAGE
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
        <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
          <button onClick={() => setView("home")} className="mr-3">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Send Message</h2>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-2">
          {bookings.filter(b => b.bookingStatus === "approved").length === 0 ? (
            <div className="p-8 text-center text-gray-500">No approved bookings to message</div>
          ) : (
            bookings
              .filter(b => b.bookingStatus === "approved")
              .map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBooking(b.id)}
                  className="w-full p-4 rounded-2xl text-left transition hover:shadow-md"
                  style={{ background: "white", border: "1px solid #e2e8f0" }}
                >
                  <p className="font-bold text-gray-900">{b.guestName}</p>
                  <p className="text-sm text-gray-600 mt-1">{b.guestPhone}</p>
                </button>
              ))
          )}
        </div>
      </div>
    );
  }

  return null;
}
