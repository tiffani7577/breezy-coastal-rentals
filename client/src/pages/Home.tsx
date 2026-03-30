import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Waves,
  ParkingCircleOff,
  MapPin,
  ShieldCheck,
  FileText,
  CreditCard,
  Star,
  ChevronRight,
  Car,
  Clock,
  Zap,
} from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/hero-beach_99596afc.jpg";
const BEACH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/beach-seashore_ead00462.jpg";
const GOLF_CART_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/golf-cart-beach_db9b806a.jpg";
const PATHWAY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/beach-pathway_db9cb33c.jpg";

// Animated wave SVG component
function AnimatedWave({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className="w-full overflow-hidden leading-none"
      style={{
        height: "80px",
        transform: flip ? "scaleY(-1)" : undefined,
        marginBottom: flip ? undefined : "-2px",
        marginTop: flip ? "-2px" : undefined,
      }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes wave1 { 0%,100%{d:path("M0,40 C180,10 360,70 540,40 C720,10 900,70 1080,40 C1260,10 1380,55 1440,40 L1440,80 L0,80 Z")} 50%{d:path("M0,40 C180,70 360,10 540,40 C720,70 900,10 1080,40 C1260,70 1380,25 1440,40 L1440,80 L0,80 Z")} }
            @keyframes wave2 { 0%,100%{d:path("M0,50 C200,20 400,65 600,45 C800,25 1000,65 1200,45 C1320,30 1400,55 1440,50 L1440,80 L0,80 Z")} 50%{d:path("M0,50 C200,65 400,20 600,45 C800,65 1000,20 1200,45 C1320,60 1400,30 1440,50 L1440,80 L0,80 Z")} }
          `}</style>
        </defs>
        <path
          style={{ animation: "wave1 6s ease-in-out infinite", fill: "oklch(0.99 0.005 220)" }}
          d="M0,40 C180,10 360,70 540,40 C720,10 900,70 1080,40 C1260,10 1380,55 1440,40 L1440,80 L0,80 Z"
        />
        <path
          style={{ animation: "wave2 8s ease-in-out infinite", fill: "oklch(0.93 0.04 215)", opacity: 0.5 }}
          d="M0,50 C200,20 400,65 600,45 C800,25 1000,65 1200,45 C1320,30 1400,55 1440,50 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(16px)",
              borderRadius: "12px",
              padding: "8px 16px",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <Waves className="w-5 h-5 text-primary" />
            <span
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "17px" }}
              className="text-foreground"
            >
              Breezy
            </span>
          </div>
          <Link href="/booking">
            <Button
              size="sm"
              className="shadow-lg"
              style={{ background: "rgba(255,255,255,0.92)", color: "var(--primary)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)", fontWeight: 600 }}
            >
              Reserve Now
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,28,60,0.55) 0%, rgba(10,28,60,0.35) 40%, rgba(10,28,60,0.65) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto pt-20">
          <Badge
            className="mb-6 text-xs tracking-widest uppercase font-semibold"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}
          >
            Cape Canaveral, Florida
          </Badge>
          <h1
            className="text-white mb-5 leading-tight"
            style={{ fontSize: "clamp(2.4rem, 7vw, 4rem)", fontFamily: "'Playfair Display', serif", fontWeight: 700, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
          >
            Enhance Your Stay<br />with a Private Golf Cart
          </h1>
          <p
            className="mb-10 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 3vw, 1.2rem)", color: "rgba(255,255,255,0.88)", textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
          >
            Make your stay breezy with effortless local travel.<br />
            The beach is just a short ride away.
          </p>

          {/* CTA */}
          <Link href="/booking">
            <Button
              size="lg"
              className="w-full max-w-xs text-base font-semibold shadow-2xl h-14"
              style={{
                background: "linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                letterSpacing: "0.01em",
              }}
            >
              Reserve Your Golf Cart
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { icon: Clock, label: "60-sec booking" },
              { icon: ShieldCheck, label: "Secure payment" },
              { icon: Star, label: "5-star experience" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                <Icon className="w-4 h-4" />
                <span style={{ fontSize: "12px", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div
            className="w-6 h-10 rounded-full flex items-start justify-center pt-2"
            style={{ border: "2px solid rgba(255,255,255,0.4)" }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.7)", animation: "bounce 2s infinite" }}
            />
          </div>
        </div>

        {/* Animated wave at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <AnimatedWave />
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "oklch(0.99 0.005 220)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Why Breezy</p>
            <h2 className="text-foreground" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontFamily: "'Playfair Display', serif" }}>
              Your Beach, Your Way
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Skip the parking stress. Our private golf cart puts Cape Canaveral's best spots at your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Waves,
                title: "Easy Beach Access",
                desc: "Ride straight to the sand. The beach is right at the back of the neighborhood — no car needed.",
                color: "oklch(0.93 0.06 215)",
                iconColor: "oklch(0.48 0.18 232)",
              },
              {
                icon: ParkingCircleOff,
                title: "No Parking Stress",
                desc: "Forget circling for spots. Park the golf cart anywhere and enjoy your day without the hassle.",
                color: "oklch(0.95 0.04 175)",
                iconColor: "oklch(0.45 0.15 175)",
              },
              {
                icon: MapPin,
                title: "Explore Effortlessly",
                desc: "Discover local restaurants, shops, and hidden gems around Cape Canaveral at your own pace.",
                color: "oklch(0.96 0.04 80)",
                iconColor: "oklch(0.55 0.14 60)",
              },
            ].map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div
                key={title}
                className="rounded-2xl p-7"
                style={{ background: color, border: "1px solid rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.7)" }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.38 0.04 230)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Golf Cart Video Section ───────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "oklch(0.10 0.05 240)" }}>
        {/* Top wave */}
        <div style={{ transform: "scaleY(-1)", marginBottom: "-2px" }}>
          <AnimatedWave />
        </div>

        <div className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "oklch(0.72 0.12 215)" }}>
                Your Ride Awaits
              </p>
              <h2 className="text-white mb-3" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontFamily: "'Playfair Display', serif" }}>
                Meet Your Golf Cart
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 }}>
                A premium 4-seat electric cart, ready and waiting at the property. Your ticket to effortless coastal living.
              </p>
            </div>

            {/* Video + Image side by side on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pexels embed video — golf cart at beach */}
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{ aspectRatio: "16/10", boxShadow: "0 20px 60px -10px rgba(0,0,0,0.5)" }}
              >
                <iframe
                  src="https://www.pexels.com/video/3571264/embed/"
                  className="w-full h-full"
                  style={{ border: "none" }}
                  allow="autoplay; fullscreen"
                  title="Golf cart at beach"
                />
                {/* Fallback image if iframe blocked */}
                <div
                  className="absolute inset-0 -z-10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${GOLF_CART_IMG})` }}
                />
              </div>

              {/* Golf cart beach photo */}
              <div
                className="rounded-2xl overflow-hidden relative group"
                style={{ aspectRatio: "16/10", boxShadow: "0 20px 60px -10px rgba(0,0,0,0.5)" }}
              >
                <img
                  src={GOLF_CART_IMG}
                  alt="Golf cart at the beach"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 50%, rgba(10,28,60,0.7) 100%)" }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                    4-Seat Electric Golf Cart
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                    Included with every rental · Cape Canaveral, FL
                  </p>
                </div>
              </div>
            </div>

            {/* Cart specs row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Seats", value: "4 Guests" },
                { label: "Type", value: "Electric" },
                { label: "Range", value: "Full Day" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "2px" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ marginTop: "-2px" }}>
          <AnimatedWave />
        </div>
      </section>

      {/* ── Photo strip — Beach + Peacock Beach Pathway ───────────── */}
      <section className="py-4 px-4" style={{ background: "oklch(0.99 0.005 220)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">
          {/* Peacock Beach pathway */}
          <div className="rounded-2xl overflow-hidden aspect-[4/3] relative group">
            <img
              src={PATHWAY_IMG}
              alt="Peacock Beach pathway, Cape Canaveral"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 55%, rgba(10,28,60,0.65) 100%)" }}
            />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-semibold text-xs" style={{ fontFamily: "'Playfair Display', serif" }}>
                Peacock Beach Access
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px" }}>End of the street · 2-min ride</p>
            </div>
          </div>
          {/* Canaveral seashore */}
          <div className="rounded-2xl overflow-hidden aspect-[4/3] relative group">
            <img
              src={BEACH_IMG}
              alt="Canaveral National Seashore"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 55%, rgba(10,28,60,0.65) 100%)" }}
            />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-semibold text-xs" style={{ fontFamily: "'Playfair Display', serif" }}>
                Canaveral National Seashore
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px" }}>Miles of pristine coastline</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you need ─────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "oklch(0.99 0.005 220)" }}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Before You Book</p>
            <h2 className="text-foreground" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontFamily: "'Playfair Display', serif" }}>
              What You'll Need
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Have these ready to complete your booking in under 90 seconds.
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid oklch(0.90 0.015 220)", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}
          >
            {[
              {
                icon: Car,
                title: "Valid Driver's License",
                desc: "A photo or scan of your current driver's license.",
                step: "01",
              },
              {
                icon: ShieldCheck,
                title: "Proof of Insurance",
                desc: "Your personal auto insurance card or policy document.",
                step: "02",
              },
              {
                icon: FileText,
                title: "Signed Liability Waiver",
                desc: "A quick digital e-signature — completed right in the booking flow.",
                step: "03",
              },
              {
                icon: CreditCard,
                title: "Payment Card",
                desc: "Secure checkout via Stripe. Full payment required at booking.",
                step: "04",
              },
            ].map(({ icon: Icon, title, desc, step }, i) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5"
                style={{
                  borderBottom: i < 3 ? "1px solid oklch(0.93 0.01 220)" : "none",
                  background: i % 2 === 0 ? "white" : "oklch(0.99 0.004 220)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.93 0.04 215)" }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground/40 flex-shrink-0 mt-1">{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/booking">
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)",
                  color: "white",
                  border: "none",
                }}
              >
                Reserve Your Golf Cart
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Exclusively for Airbnb guests · Cape Canaveral, FL
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: "oklch(0.12 0.06 240)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "oklch(0.72 0.12 215)" }}>
              Simple Process
            </p>
            <h2 className="text-white" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontFamily: "'Playfair Display', serif" }}>
              Book in 5 Easy Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { n: "1", label: "Pick Dates", icon: Clock },
              { n: "2", label: "Your Details", icon: FileText },
              { n: "3", label: "Upload Docs", icon: Car },
              { n: "4", label: "Sign Waiver", icon: ShieldCheck },
              { n: "5", label: "Pay & Confirm", icon: Zap },
            ].map(({ n, label, icon: Icon }, i) => (
              <div key={n} className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background: "oklch(0.48 0.18 232)", color: "white" }}
                >
                  {n}
                </div>
                <div className="sm:mt-1">
                  <p className="text-white font-medium text-sm">{label}</p>
                </div>
                {i < 4 && (
                  <ChevronRight className="w-4 h-4 hidden sm:block absolute" style={{ color: "rgba(255,255,255,0.3)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 text-center" style={{ background: "oklch(0.08 0.04 240)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Waves className="w-5 h-5" style={{ color: "oklch(0.62 0.15 215)" }} />
          <span
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "18px", color: "white" }}
          >
            Breezy
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Cape Canaveral, Florida · Golf Cart Rental for Airbnb Guests
        </p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          © {new Date().getFullYear()} Breezy Coastal Rentals. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
