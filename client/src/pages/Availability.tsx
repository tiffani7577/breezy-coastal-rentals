import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Waves, ChevronLeft, Calendar, CheckCircle, XCircle, MinusCircle, ChevronRight } from "lucide-react";
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
  isWithinInterval,
  format,
  startOfDay,
} from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Availability() {
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: availData, isLoading } = trpc.availability.getBlockedDates.useQuery();

  const today = startOfDay(new Date());

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

  const getDayStatus = (date: Date) => {
    if (isPast(date)) return "past";
    if (isBooked(date)) return "booked";
    if (isBlocked(date)) return "blocked";
    return "available";
  };

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

  const statusStyle = (status: string, inMonth: boolean) => {
    if (!inMonth) return { bg: "transparent", text: "oklch(0.80 0.01 220)", cursor: "default" };
    switch (status) {
      case "past":
        return { bg: "transparent", text: "oklch(0.78 0.01 220)", cursor: "default" };
      case "booked":
        return { bg: "oklch(0.92 0.04 15)", text: "oklch(0.45 0.18 15)", cursor: "default" };
      case "blocked":
        return { bg: "oklch(0.93 0.02 50)", text: "oklch(0.50 0.12 50)", cursor: "default" };
      case "available":
        return { bg: "oklch(0.93 0.06 150)", text: "oklch(0.35 0.14 150)", cursor: "pointer" };
      default:
        return { bg: "transparent", text: "oklch(0.5 0.01 220)", cursor: "default" };
    }
  };

  const handleDayClick = (date: Date, status: string) => {
    if (status === "available") {
      navigate(`/booking?start=${format(date, "yyyy-MM-dd")}`);
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
            <Waves className="w-5 h-5 text-primary" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-wide"
            style={{ background: "oklch(0.93 0.04 215)", color: "oklch(0.48 0.18 232)" }}>
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
            Tap any available date to start your reservation.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mb-6 flex-wrap">
          {[
            { color: "oklch(0.93 0.06 150)", text: "oklch(0.35 0.14 150)", label: "Available" },
            { color: "oklch(0.92 0.04 15)", text: "oklch(0.45 0.18 15)", label: "Booked" },
            { color: "oklch(0.93 0.02 50)", text: "oklch(0.50 0.12 50)", label: "Unavailable" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-md"
                style={{ background: item.color }}
              />
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
                    const style = statusStyle(status, inMonth);
                    const isToday = isSameDay(date, today);
                    return (
                      <button
                        key={di}
                        onClick={() => inMonth && handleDayClick(date, status)}
                        disabled={!inMonth || status !== "available"}
                        className="relative flex items-center justify-center rounded-xl transition-all"
                        style={{
                          height: "42px",
                          background: style.bg,
                          color: style.text,
                          cursor: style.cursor,
                          fontWeight: isToday ? 700 : 500,
                          fontSize: "13px",
                          outline: isToday ? `2px solid oklch(0.48 0.18 232)` : undefined,
                          outlineOffset: "-2px",
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

        {/* Status summary */}
        {!isLoading && availData && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                icon: CheckCircle,
                color: "oklch(0.35 0.14 150)",
                bg: "oklch(0.93 0.06 150)",
                label: "Available",
                desc: "Tap to book",
              },
              {
                icon: XCircle,
                color: "oklch(0.45 0.18 15)",
                bg: "oklch(0.92 0.04 15)",
                label: "Booked",
                desc: "Already reserved",
              },
              {
                icon: MinusCircle,
                color: "oklch(0.50 0.12 50)",
                bg: "oklch(0.93 0.02 50)",
                label: "Unavailable",
                desc: "Admin blocked",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3 text-center"
                style={{ background: item.bg }}
              >
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
