import { Link } from "wouter";

const DOROTHY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/dorothy-v2-XyXFVKiTNsxc74AFjNYPHU.webp";

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.008 220)" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background: "rgba(10,20,35,0.92)", backdropFilter: "blur(12px)" }}>
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer">
            <span style={{ fontSize: "1.1rem", fontFamily: "'Playfair Display', serif", color: "white", fontWeight: 600 }}>
              Breezy Coastal Rentals
            </span>
          </span>
        </Link>
        <Link href="/booking">
          <button
            className="text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: "oklch(0.48 0.18 232)", color: "white" }}
          >
            Reserve Now
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="pt-24 pb-12 px-4 text-center" style={{ background: "oklch(0.12 0.025 232)" }}>
        <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "oklch(0.65 0.18 232)" }}>
          About Us
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "white", lineHeight: 1.2 }}>
          Breezy Coastal Rentals
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: "oklch(0.75 0.04 220)", lineHeight: 1.7 }}>
          A locally owned, family-run business based in Cape Canaveral, Florida — dedicated to helping guests enjoy the Space Coast with ease.
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-16">



        {/* About text */}
        <div className="rounded-3xl p-8 mb-8" style={{ background: "white", boxShadow: "0 4px 32px rgba(0,80,160,0.06)" }}>
          <h2 className="mb-5" style={{ fontSize: "1.4rem", fontFamily: "'Playfair Display', serif", color: "oklch(0.15 0.025 232)" }}>
            Our Story
          </h2>
          <div className="space-y-4 text-base" style={{ color: "oklch(0.35 0.02 220)", lineHeight: 1.8 }}>
            <p>
              Based in Cape Canaveral, Florida, Breezy Coastal Rentals is proudly operated as a locally owned, family-run business dedicated to helping guests enjoy the Space Coast with ease.
            </p>
            <p>
              Our goal is simple: provide clean, reliable, fully street-legal golf carts that make getting around fun and effortless. Whether you're heading to the beach, cruising the neighborhood, or exploring the area, our carts are designed to enhance your stay.
            </p>
            <p>
              As a local business, we take pride in being responsive and available. If you need anything during your rental, you're just a quick call or text away from someone right here.
            </p>
            <p>
              Thank you for supporting a small, local business — we're excited to be part of your stay.
            </p>
          </div>
        </div>

        {/* Contact card */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "oklch(0.12 0.025 232)" }}>
          <h3 className="mb-2" style={{ fontSize: "1.2rem", fontFamily: "'Playfair Display', serif", color: "white" }}>
            Questions? We're right here.
          </h3>
          <p className="mb-4 text-sm" style={{ color: "oklch(0.75 0.04 220)" }}>
            Call or text Dorothy directly — no bots, no wait times.
          </p>
          <a
            href="tel:3215441539"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: "oklch(0.48 0.18 232)", color: "white" }}
          >
            📞 321-544-1539
          </a>
          <div className="mt-6">
            <Link href="/booking">
              <button
                className="px-8 py-3 rounded-full text-sm font-semibold"
                style={{ background: "white", color: "oklch(0.15 0.025 232)" }}
              >
                Reserve Your Cart
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
