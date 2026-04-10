import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Waves,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  MinusCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
  format,
  startOfDay,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Availability() {
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stayStart, setStayStart] = useState("");
  const [stayEnd, setStayEnd] = useState("");
  const { data: availData, isLoading } = trpc.availability.getBlockedDates.useQuery();

  const today = startOfDay(new Date());

  // Parsed stay window
  const stayStartDate = stayStart ? startOfDay(parseISO(stayStart)) : null;
  const stayEndDate = stayEnd ? startOfDay(parseISO(stayEnd)) : null;
  const hasStayWindow = stayStartDate && stayEndDate && !isAfter(stayStartDate, stayEndDate);

  const isBlocked = useCallback(
    (date: Date) => {
      if (!availData) return false;
      return availData.blocks.some((b) => isSameDay(new Date(b.blockDate), date));
    },
    [availData]
  );

  const isBooked = useCallback(
    (date: Date) => {
      if (!availData) return false;
      return availData.approvedRanges.some((r) =>
        isWithinInterval(date, {
          start: startOfDay(new Date(r.startDate)),
          end: startOfDay(new Date(r.endDate)),
        })
      );
    },
    [availData]
  );

  const isPast = (date: Date) => isBefore(date, today);

  const isInStayWindow = (date: Date) => {
    if (!hasStayWindow) return false;
    return isWithinInterval(date, { start: stayStartDate!, end: stayEndDate! });
  };

  const isStayEdge = (date: Date) => {
    if (!hasStayWindow) return false;
    return isSameDay(date, stayStartDate!) || isSameDay(date, stayEndDate!);
  };

  const getDayStatus = (date: Date) => {
    if (isPast(date)) return "past";
    if (isBooked(date)) return "booked";
    if (isBlocked(date)) return "blocked";
    return "available";
  };

  // Availability summary for stay window
  const stayWindowSummary = useCallback(() => {
    if (!hasStayWindow) return null;
    let available = 0, booked = 0, blocked = 0;
    let d = stayStartDate!;
    while (!isAfter(d, stayEndDate!)) {
      const status = getDayStatus(d);
      if (status === "available") available++;
      else if (status === "booked") booked++;
      else if (status === "blocked") blocked++;
      d = addDays(d, 1);
    }
    const total = differenceInCalendarDays(stayEndDate!, stayStartDate!) + 1;
    return { available, booked, blocked, total, fullyAvailable: booked === 0 && blocked === 0 };
  }, [hasStayWindow, stayStartDate, stayEndDate, availData]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let day = calStart;
  while (!isBefore(calEnd, day)) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const getDayStyle = (date: Date, inMonth: boolean) => {
    if (!inMonth) return { bg: "transparent", text: "oklch(0.82 0.01 220)", border: "none", cursor: "default" };
    const status = getDayStatus(date);
    const inWindow = isInStayWindow(date);
    const isEdge = isStayEdge(date);
    const isToday = isSameDay(date, today);

    if (isEdge) {
      return { bg: "oklch(0.48 0.18 232)", text: "white", border: "none", cursor: "default", fontWeight: 700 };
    }
    if (inWindow) {
      switch (status) {
        case "available":
          return { bg: "oklch(0.88 0.08 150)", text: "oklch(0.30 0.14 150)", border: "none", cursor: "pointer" };
        case "booked":
          return { bg: "oklch(0.88 0.06 15)", text: "oklch(0.40 0.18 15)", border: "none", cursor: "default" };
        case "blocked":
          return { bg: "oklch(0.88 0.04 50)", text: "oklch(0.45 0.12 50)", border: "none", cursor: "default" };
        case "past":
          return { bg: "oklch(0.93 0.01 220)", text: "oklch(0.70 0.01 220)", border: "none", cursor: "default" };
      }
    }
    switch (status) {
      case "past":
        return { bg: "transparent", text: "oklch(0.80 0.01 220)", border: "none", cursor: "default" };
      case "booked":
        return { bg: "oklch(0.94 0.03 15)", text: "oklch(0.50 0.15 15)", border: "none", cursor: "default" };
      case "blocked":
        return { bg: "oklch(0.94 0.02 50)", text: "oklch(0.55 0.10 50)", border: "none", cursor: "default" };
      case "available":
        return {
          bg: isToday ? "oklch(0.93 0.06 215)" : "oklch(0.95 0.04 150)",
          text: isToday ? "oklch(0.35 0.18 232)" : "oklch(0.38 0.12 150)",
          border: isToday ? "2px solid oklch(0.48 0.18 232)" : "none",
          cursor: "pointer",
        };
      default:
        return { bg: "transparent", text: "oklch(0.5 0.01 220)", border: "none", cursor: "default" };
    }
  };

  const handleDayClick = (date: Date, inMonth: boolean) => {
    if (!inMonth) return;
    const status = getDayStatus(date);
    if (status === "available") {
      navigate(`/booking?start=${format(date, "yyyy-MM-dd")}`);
    }
  };

  const summary = stayWindowSummary();

  // Auto-navigate to the month containing stay start when entered
  const handleStayStartChange = (val: string) => {
    setStayStart(val);
    if (val) {
      try {
        const d = parseISO(val);
        if (!isNaN(d.getTime())) setCurrentMonth(d);
      } catch {}
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.99 0.005 220)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.93 0.01 220)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.96 0.01 220)" }}
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/breezy-logo-transparent_f177cea4.png" alt="Breezy" className="h-8 w-8 object-contain" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "16px" }}>
              Breezy
            </span>
          </div>
          <Link href="/booking">
            <Button size="sm" className="rounded-xl font-semibold">
              Reserve Now
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-wide"
            style={{ background: "oklch(0.93 0.04 215)", color: "oklch(0.48 0.18 232)" }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Live Availability
          </div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Check Availability
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your stay dates to see if the cart is available for your trip.
          </p>
        </div>

        {/* Stay date input card */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "white",
            border: "1px solid oklch(0.90 0.015 220)",
            boxShadow: "0 4px 20px -4px rgba(0,0,0,0.07)",
          }}
        >
          <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Your Stay Dates
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Check-in</label>
              <input
                type="date"
                value={stayStart}
                min={format(today, "yyyy-MM-dd")}
                onChange={(e) => handleStayStartChange(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-foreground"
                style={{
                  border: "1.5px solid oklch(0.88 0.02 220)",
                  background: "oklch(0.98 0.005 220)",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Check-out</label>
              <input
                type="date"
                value={stayEnd}
                min={stayStart || format(today, "yyyy-MM-dd")}
                onChange={(e) => setStayEnd(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-foreground"
                style={{
                  border: "1.5px solid oklch(0.88 0.02 220)",
                  background: "oklch(0.98 0.005 220)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Summary banner */}
          {summary && (
            <div
              className="mt-4 rounded-xl p-4"
              style={{
                background: summary.fullyAvailable
                  ? "oklch(0.93 0.06 150)"
                  : "oklch(0.93 0.04 15)",
                border: `1px solid ${summary.fullyAvailable ? "oklch(0.82 0.10 150)" : "oklch(0.82 0.08 15)"}`,
              }}
            >
              <div className="flex items-start gap-3">
                {summary.fullyAvailable ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.35 0.14 150)" }} />
                ) : (
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.45 0.18 15)" }} />
                )}
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: summary.fullyAvailable ? "oklch(0.30 0.14 150)" : "oklch(0.40 0.18 15)" }}
                  >
                    {summary.fullyAvailable
                      ? `Great news! All ${summary.total} day${summary.total > 1 ? "s" : ""} are available.`
                      : `${summary.booked + summary.blocked} day${summary.booked + summary.blocked > 1 ? "s" : ""} unavailable in your window.`}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: summary.fullyAvailable ? "oklch(0.40 0.12 150)" : "oklch(0.50 0.15 15)" }}
                  >
                    {format(stayStartDate!, "MMM d")} – {format(stayEndDate!, "MMM d, yyyy")} ·{" "}
                    {summary.available} available · {summary.booked} booked · {summary.blocked} blocked
                  </p>
                </div>
              </div>
              {summary.fullyAvailable && (
                <Link href={`/booking?start=${stayStart}&end=${stayEnd}`}>
                  <Button
                    size="sm"
                    className="mt-3 w-full rounded-xl font-semibold"
                    style={{ background: "oklch(0.35 0.14 150)", color: "white" }}
                  >
                    Book These Dates <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {stayStart && stayEnd && stayStartDate && stayEndDate && isAfter(stayStartDate, stayEndDate) && (
            <p className="mt-3 text-xs text-red-500 font-medium">Check-out must be after check-in.</p>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mb-4 flex-wrap">
          {[
            { color: "oklch(0.93 0.06 150)", text: "oklch(0.35 0.14 150)", label: "Available" },
            { color: "oklch(0.92 0.04 15)", text: "oklch(0.45 0.18 15)", label: "Booked" },
            { color: "oklch(0.93 0.02 50)", text: "oklch(0.50 0.12 50)", label: "Unavailable" },
            { color: "oklch(0.48 0.18 232)", text: "white", label: "Your stay" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md" style={{ background: item.color }} />
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar card */}
        <div
          className="rounded-2xl overflow-hidden bg-white"
          style={{ border: "1px solid oklch(0.90 0.015 220)", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}
        >
          {/* Month navigation */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid oklch(0.93 0.01 220)" }}
          >
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
              disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
              style={{ opacity: isBefore(endOfMonth(subMonths(currentMonth, 1)), today) ? 0.3 : 1 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2
              className="font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px" }}
            >
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-4 pt-3 pb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="px-4 pb-4">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                  {week.map((date, di) => {
                    const inMonth = isSameMonth(date, currentMonth);
                    const status = getDayStatus(date);
                    const style = getDayStyle(date, inMonth);
                    const inWindow = inMonth && isInStayWindow(date);
                    const isEdge = inMonth && isStayEdge(date);

                    return (
                      <button
                        key={di}
                        onClick={() => handleDayClick(date, inMonth)}
                        disabled={!inMonth || status !== "available"}
                        className="relative flex items-center justify-center rounded-xl transition-all"
                        style={{
                          height: "42px",
                          background: style.bg,
                          color: style.text,
                          cursor: style.cursor,
                          fontWeight: isEdge ? 700 : inWindow ? 600 : 500,
                          fontSize: "13px",
                          border: style.border || undefined,
                          boxShadow: isEdge ? "0 2px 8px -2px rgba(0,0,0,0.18)" : undefined,
                          transform: isEdge ? "scale(1.08)" : undefined,
                          zIndex: isEdge ? 1 : undefined,
                        }}
                      >
                        {inMonth ? format(date, "d") : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status cards */}
        {!isLoading && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: CheckCircle, color: "oklch(0.35 0.14 150)", bg: "oklch(0.93 0.06 150)", label: "Available", desc: "Tap to book" },
              { icon: XCircle, color: "oklch(0.45 0.18 15)", bg: "oklch(0.92 0.04 15)", label: "Booked", desc: "Already reserved" },
              { icon: MinusCircle, color: "oklch(0.50 0.12 50)", bg: "oklch(0.93 0.02 50)", label: "Unavailable", desc: "Admin blocked" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: item.bg }}>
                <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                <p className="text-xs font-bold" style={{ color: item.color }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: item.color, opacity: 0.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/booking">
            <Button size="lg" className="rounded-2xl px-8 font-semibold text-base h-14">
              Reserve Your Golf Cart
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            Full payment collected at booking · Admin review required
          </p>
        </div>
      </div>
    </div>
  );
}
