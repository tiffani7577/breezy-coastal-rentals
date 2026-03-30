import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Waves, ChevronLeft } from "lucide-react";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.99 0.005 220)" }}>
      <div
        className="sticky top-0 z-40 px-4 py-4"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid oklch(0.93 0.01 220)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.96 0.01 220)" }}>
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "16px" }}>{title}</span>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="prose prose-sm max-w-none" style={{ color: "oklch(0.25 0.04 230)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Terms of Service</h1>
      <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using BreezyCoastalRentals.com and renting our golf cart, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>

      <h2>2. Eligibility</h2>
      <p>You must be at least 18 years of age and hold a valid driver's license to rent our golf cart. This service is exclusively available to guests with an active Airbnb reservation at our property in Cape Canaveral, Florida.</p>

      <h2>3. Rental Agreement</h2>
      <p>By completing the booking process, you agree to the Liability Waiver and all terms outlined therein. The rental period is as specified in your booking confirmation. The golf cart must be returned by the end date of your rental period.</p>

      <h2>4. Payment</h2>
      <p>Full payment is required at the time of booking via Stripe Checkout. All prices are in USD. Bookings are subject to admin review and approval after payment. If your booking is rejected, a refund will be processed manually within 5–10 business days.</p>

      <h2>5. Cancellation & Refunds</h2>
      <p>Refunds are handled manually by the property owner. We do not offer automatic refunds. Please contact us directly if you need to cancel or modify your booking.</p>

      <h2>6. Responsible Use</h2>
      <p>You agree to operate the golf cart safely, in compliance with all applicable laws, and not under the influence of alcohol or drugs. You are responsible for any damage, theft, or loss that occurs during your rental period.</p>

      <h2>7. Limitation of Liability</h2>
      <p>Breezy Coastal Rentals is not liable for any personal injury, property damage, or other losses arising from your use of the golf cart. See the Liability Waiver for full details.</p>

      <h2>8. Contact</h2>
      <p>For questions about these Terms, contact us at <a href="mailto:bookings@breezycoastalrentals.com" className="text-primary">bookings@breezycoastalrentals.com</a>.</p>

      <p className="text-xs text-muted-foreground mt-8 p-4 rounded-xl" style={{ background: "oklch(0.96 0.02 215)", border: "1px solid oklch(0.88 0.04 215)" }}>
        <strong>Note:</strong> These Terms of Service are provided as a structural framework and should be reviewed by a qualified attorney before launch to ensure legal compliance for your jurisdiction and specific use case.
      </p>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Privacy Policy</h1>
      <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <h2>1. Information We Collect</h2>
      <p>We collect the following information when you make a booking:</p>
      <ul>
        <li>Personal information: name, email address, phone number</li>
        <li>Airbnb booking reference name</li>
        <li>Driver's license and proof of insurance documents</li>
        <li>Waiver signature, timestamp, and IP address</li>
        <li>Payment information (processed securely by Stripe — we do not store card details)</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and manage your golf cart rental booking</li>
        <li>Verify your identity and rental eligibility</li>
        <li>Send booking confirmations and status updates via email</li>
        <li>Comply with legal and insurance requirements</li>
      </ul>

      <h2>3. Document Storage</h2>
      <p>Uploaded documents (driver's license, proof of insurance) are stored securely using encrypted cloud storage. Access is restricted to authorized personnel only. Documents are retained for the duration required by applicable law and our insurance obligations.</p>

      <h2>4. Data Sharing</h2>
      <p>We do not sell or share your personal information with third parties, except as required to process your booking (e.g., Stripe for payments, Resend for email delivery) or as required by law.</p>

      <h2>5. Data Security</h2>
      <p>We implement industry-standard security measures to protect your personal information. All data is transmitted over HTTPS and stored using secure cloud infrastructure.</p>

      <h2>6. Your Rights</h2>
      <p>You have the right to request access to, correction of, or deletion of your personal data. Contact us at <a href="mailto:bookings@breezycoastalrentals.com" className="text-primary">bookings@breezycoastalrentals.com</a> to exercise these rights.</p>

      <h2>7. Contact</h2>
      <p>For privacy-related questions, contact us at <a href="mailto:bookings@breezycoastalrentals.com" className="text-primary">bookings@breezycoastalrentals.com</a>.</p>

      <p className="text-xs text-muted-foreground mt-8 p-4 rounded-xl" style={{ background: "oklch(0.96 0.02 215)", border: "1px solid oklch(0.88 0.04 215)" }}>
        <strong>Note:</strong> This Privacy Policy is provided as a structural framework and should be reviewed by a qualified attorney before launch to ensure compliance with GDPR, CCPA, and other applicable privacy regulations.
      </p>
    </LegalLayout>
  );
}
