import { useEffect, useState } from "react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/breezy-logo-transparent_f177cea4.png";

// Ping the health endpoint to detect when the server is ready
async function pingServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/trpc/availability.getBlockedDates?input=%7B%7D", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

interface SplashScreenProps {
  onReady: () => void;
}

export default function SplashScreen({ onReady }: SplashScreenProps) {
  const [dots, setDots] = useState(".");
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);

  // Animated dots
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Show "taking a moment" message after 4s
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(id);
  }, []);

  // Retry loop — poll every 2s until server responds
  useEffect(() => {
    let cancelled = false;
    async function tryConnect() {
      const ok = await pingServer();
      if (cancelled) return;
      if (ok) {
        onReady();
      } else {
        setAttempt((a) => a + 1);
        setTimeout(tryConnect, 2000);
      }
    }
    tryConnect();
    return () => { cancelled = true; };
  }, [onReady]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "oklch(0.12 0.025 232)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        gap: "24px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid oklch(0.65 0.12 220)",
          boxShadow: "0 0 40px oklch(0.5 0.15 220 / 0.4)",
          animation: "breezy-pulse 2s ease-in-out infinite",
        }}
      >
        <img src={LOGO_URL} alt="Breezy Coastal Rentals" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Brand name */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: "white",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Breezy Coastal Rentals
        </p>
      </div>

      {/* Animated wave bar */}
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "32px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: "5px",
              borderRadius: "3px",
              background: "oklch(0.55 0.18 220)",
              animation: `breezy-wave 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          color: "oklch(0.55 0.06 220)",
          margin: 0,
          minHeight: "40px",
          textAlign: "center",
          padding: "0 32px",
          lineHeight: 1.5,
        }}
      >
        {slow
          ? "Just a moment — waking up the server for you" + dots
          : "Loading" + dots}
      </p>

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes breezy-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px oklch(0.5 0.15 220 / 0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 60px oklch(0.5 0.15 220 / 0.6); }
        }
        @keyframes breezy-wave {
          0%, 100% { height: 8px; }
          50% { height: 28px; }
        }
      `}</style>
    </div>
  );
}
