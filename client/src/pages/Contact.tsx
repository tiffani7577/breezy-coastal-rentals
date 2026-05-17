import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, Mail, MapPin, MessageSquare, Clock } from "lucide-react";

export default function Contact() {
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
          <Button
            size="sm"
            className="rounded-full px-6"
            style={{ background: "oklch(0.48 0.18 232)", color: "white" }}
          >
            Reserve Now
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="pt-24 pb-12 px-4 text-center" style={{ background: "oklch(0.12 0.025 232)" }}>
        <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "oklch(0.65 0.18 232)" }}>
          Get In Touch
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "white", lineHeight: 1.2 }}>
          Contact Us
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: "oklch(0.75 0.04 220)", lineHeight: 1.7 }}>
          Have questions about our street-legal golf carts? We're a local, family-run business and we're here to help.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="mb-8" style={{ fontSize: "1.6rem", fontFamily: "'Playfair Display', serif", color: "oklch(0.15 0.025 232)" }}>
              Ways to Reach Us
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.48 0.18 232)", color: "white" }}>
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Call or Text</h3>
                  <p className="text-muted-foreground mb-2">Speak directly with Dorothy for immediate help.</p>
                  <a href="tel:3214318333" className="text-xl font-bold text-primary">321-431-8333</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.48 0.18 232)", color: "white" }}>
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <p className="text-muted-foreground mb-2">For general inquiries and booking support.</p>
                  <a href="mailto:bookings@breezycoastalrentals.com" className="text-lg font-semibold text-primary">bookings@breezycoastalrentals.com</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.48 0.18 232)", color: "white" }}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Location</h3>
                  <p className="text-muted-foreground">Serving Cape Canaveral, Florida and surrounding areas.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-3xl" style={{ background: "white", border: "1px solid oklch(0.9 0.02 220)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Response Time</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As a local family business, we aim to respond to all texts and calls within minutes during normal business hours. Emails are typically answered within 2-4 hours.
              </p>
            </div>
          </div>

          {/* Quick FAQ / Note */}
          <div className="rounded-3xl p-10 flex flex-col justify-center text-center md:text-left" style={{ background: "oklch(0.12 0.025 232)", color: "white" }}>
            <MessageSquare className="w-12 h-12 mb-6 mx-auto md:mx-0" style={{ color: "oklch(0.65 0.18 232)" }} />
            <h2 className="mb-6" style={{ fontSize: "1.8rem", fontFamily: "'Playfair Display', serif" }}>
              Ready to roll?
            </h2>
            <p className="mb-10 text-lg opacity-80 leading-relaxed">
              Our 6-seater luxury golf carts are the easiest way to explore Cape Canaveral. Book online in under 60 seconds.
            </p>
            <Link href="/booking">
              <Button
                size="lg"
                className="w-full py-7 text-lg font-bold rounded-2xl"
                style={{ background: "oklch(0.48 0.18 232)", color: "white" }}
              >
                Reserve Your Carts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
