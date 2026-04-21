import { Button } from "@/components/ui/button";
import React from "react";
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

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/hero-golf-cart-real-house-FeauoYkA3VctsQ9wqyep2e.webp";
// Original aerial beach (saved): https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/hero-beach_99596afc.jpg
const BEACH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/canaveral-coast-v2-BncqoUn3dE4qSpBSMm5UR6.webp";
const PATHWAY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/peacock-beach-v2-oFnvRDfks9XVPJbpXCtwWP.webp";
const LIFESTYLE_FAMILY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-family-cart-cDv5eUToTmXadSgKubPizH.webp";
const LIFESTYLE_GIRLS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-girls-trip-cart-VRqpYxcrwAXpxxaoCVmbGB.webp";
const LIFESTYLE_SUNSET = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-sunset-cart-534yNishhjohtUif7DYkRm.webp";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/breezy-logo-transparent_f177cea4.png";
const LIFESTYLE_SENIORS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-seniors-v3_8fd8ef29.png";

// Cinemagraph-style animated coastal scene
function CoastalCinemagraph() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(180deg, #87ceeb 0%, #5ba3d9 35%, #2a7ab5 60%, #1a5c8a 100%)" }}>
      <style>{`
        @keyframes cloudDrift { 0%{transform:translateX(-5%)} 50%{transform:translateX(5%)} 100%{transform:translateX(-5%)} }
        @keyframes cloudDrift2 { 0%{transform:translateX(3%)} 50%{transform:translateX(-4%)} 100%{transform:translateX(3%)} }
        @keyframes palmSway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes palmSway2 { 0%,100%{transform:rotate(1deg)} 50%{transform:rotate(-2.5deg)} }
        @keyframes waveShift1 { 0%{transform:translate(0,230px)} 50%{transform:translate(-20px,226px)} 100%{transform:translate(0,230px)} }
        @keyframes waveShift2 { 0%{transform:translate(0,222px)} 50%{transform:translate(15px,218px)} 100%{transform:translate(0,222px)} }
        @keyframes foamShimmer { 0%,100%{opacity:0.5} 50%{opacity:0.85} }
        @keyframes cartFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-3px)} }
        @keyframes sunGlow { 0%,100%{opacity:0.85} 50%{opacity:1} }
        @keyframes sparkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>

      {/* Sky gradient */}
      <svg viewBox="0 0 720 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        {/* Sky */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87ceeb" />
            <stop offset="60%" stopColor="#b8e0f7" />
            <stop offset="100%" stopColor="#d4eef9" />
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a7fc1" />
            <stop offset="100%" stopColor="#0d4f7a" />
          </linearGradient>
          <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5e6c8" />
            <stop offset="100%" stopColor="#e8d5a3" />
          </linearGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff9c4" stopOpacity="1" />
            <stop offset="60%" stopColor="#ffe082" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffb300" stopOpacity="0" />
          </radialGradient>
          <filter id="blur2"><feGaussianBlur stdDeviation="2" /></filter>
          <filter id="blur4"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>

        {/* Sky bg */}
        <rect width="720" height="400" fill="url(#skyGrad)" />

        {/* Sun glow */}
        <circle cx="580" cy="80" r="55" fill="url(#sunGrad)" filter="url(#blur4)" style={{animation:"sunGlow 4s ease-in-out infinite"}} />
        <circle cx="580" cy="80" r="22" fill="#fff9e6" style={{animation:"sunGlow 4s ease-in-out infinite"}} />

        {/* Cloud 1 */}
        <g style={{animation:"cloudDrift 12s ease-in-out infinite", transformOrigin:"200px 70px"}}>
          <ellipse cx="180" cy="72" rx="55" ry="18" fill="white" opacity="0.85" filter="url(#blur2)" />
          <ellipse cx="210" cy="65" rx="35" ry="14" fill="white" opacity="0.9" filter="url(#blur2)" />
          <ellipse cx="155" cy="68" rx="28" ry="12" fill="white" opacity="0.8" filter="url(#blur2)" />
        </g>
        {/* Cloud 2 */}
        <g style={{animation:"cloudDrift2 18s ease-in-out infinite", transformOrigin:"450px 55px"}}>
          <ellipse cx="430" cy="55" rx="45" ry="15" fill="white" opacity="0.7" filter="url(#blur2)" />
          <ellipse cx="460" cy="48" rx="28" ry="12" fill="white" opacity="0.75" filter="url(#blur2)" />
        </g>

        {/* Ocean */}
        <rect x="0" y="240" width="720" height="160" fill="url(#oceanGrad)" />

        {/* Ocean sparkles */}
        {[{x:120,y:270,d:2},{x:280,y:260,d:3},{x:420,y:275,d:2.5},{x:560,y:265,d:2},{x:650,y:280,d:1.5}].map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r={s.d} fill="white" style={{animation:`sparkle ${2+i*0.7}s ease-in-out infinite`, animationDelay:`${i*0.4}s`}} />
        ))}

        {/* Wave 1 */}
        <path fill="#3a9bd5" opacity="0.6" style={{animation:"waveShift1 5s ease-in-out infinite"}}
          d="M-20,20 C80,5 160,35 240,20 C320,5 400,35 480,20 C560,5 640,35 760,20 L760,60 L-20,60 Z"
          transform="translate(0,230)" />
        {/* Wave 2 */}
        <path fill="#5bb8e8" opacity="0.45" style={{animation:"waveShift2 7s ease-in-out infinite"}}
          d="M-15,25 C90,10 180,40 270,25 C360,10 450,40 540,25 C630,10 700,35 740,25 L740,60 L-15,60 Z"
          transform="translate(0,222)" />
        {/* Foam */}
        <path fill="white" opacity="0.5" style={{animation:"foamShimmer 3s ease-in-out infinite"}}
          d="M0,28 C60,22 120,32 180,28 C240,22 300,32 360,28 C420,22 480,32 540,28 C600,22 660,30 720,28 L720,32 L0,32 Z"
          transform="translate(0,228)" />

        {/* Sand */}
        <path fill="url(#sandGrad)" d="M0,300 Q180,285 360,292 Q540,300 720,288 L720,400 L0,400 Z" />

        {/* Palm tree left */}
        <g transform="translate(60,160)">
          <rect x="-5" y="0" width="10" height="130" rx="5" fill="#8B6914" />
          {/* Fronds */}
          <g style={{animation:"palmSway 4s ease-in-out infinite", transformOrigin:"0px 0px"}}>
            <path d="M0,0 Q-60,-30 -90,-10" stroke="#2d7a2d" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q-50,-55 -30,-75" stroke="#2d7a2d" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q10,-65 30,-70" stroke="#3a8f3a" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q55,-45 70,-20" stroke="#3a8f3a" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q40,-20 65,5" stroke="#2d7a2d" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Palm tree right */}
        <g transform="translate(660,180)">
          <rect x="-5" y="0" width="9" height="110" rx="4" fill="#7a5c10" />
          <g style={{animation:"palmSway2 5s ease-in-out infinite", transformOrigin:"0px 0px"}}>
            <path d="M0,0 Q-55,-25 -80,-5" stroke="#2d7a2d" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q-40,-50 -20,-68" stroke="#3a8f3a" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q15,-60 35,-62" stroke="#2d7a2d" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M0,0 Q50,-35 60,-12" stroke="#3a8f3a" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Golf cart on sand */}
        <g transform="translate(300,295)" style={{animation:"cartFloat 4s ease-in-out infinite"}}>
          {/* Cart body */}
          <rect x="-45" y="-28" width="90" height="28" rx="6" fill="white" />
          <rect x="-40" y="-38" width="80" height="14" rx="4" fill="#e8f4fd" />
          {/* Roof */}
          <rect x="-42" y="-52" width="84" height="16" rx="4" fill="#1a5c8a" />
          {/* Windshield */}
          <rect x="-30" y="-38" width="35" height="14" rx="2" fill="#b8e0f7" opacity="0.7" />
          {/* Wheels */}
          <circle cx="-28" cy="0" r="10" fill="#333" />
          <circle cx="-28" cy="0" r="5" fill="#888" />
          <circle cx="28" cy="0" r="10" fill="#333" />
          <circle cx="28" cy="0" r="5" fill="#888" />
          {/* Stripe */}
          <rect x="-45" y="-16" width="90" height="4" rx="2" fill="#1a5c8a" opacity="0.4" />
        </g>

        {/* Caption overlay */}
        <rect x="0" y="340" width="720" height="60" fill="rgba(10,28,60,0.55)" />
        <text x="36" y="368" fontFamily="Georgia, serif" fontSize="15" fill="white" fontWeight="600">Your cart, ready at the property</text>
        <text x="36" y="388" fontFamily="Arial, sans-serif" fontSize="11" fill="rgba(255,255,255,0.7)">Cape Canaveral, FL · Peacock Beach · 2-min ride</text>
      </svg>
    </div>
  );
}

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

function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "Who can rent the golf cart?",
      a: "You must be 25 or older with a valid driver's license and proof of insurance. The cart is available to vacation rental guests and visitors staying in the Cape Canaveral area.",
    },
    {
      q: "Do I need insurance to rent?",
      a: "Yes. You'll need to upload a photo of your current auto insurance card during the booking process. This is required before your booking can be approved.",
    },
    {
      q: "How does the booking process work?",
      a: "Select your dates, provide your details, upload your driver's license and insurance card, sign the digital waiver, and pay. Your booking is then reviewed by our team — you'll receive an email once it's approved.",
    },
    {
      q: "Is payment collected upfront?",
      a: "Yes, full payment is collected at the time of booking via Stripe. If your booking is not approved for any reason, a manual refund will be issued through Stripe.",
    },
    {
      q: "What is the daily rate?",
      a: "The base rate is $160/day with a 4-night minimum. A 7% Florida sales tax applies. The full pricing breakdown is shown before you pay.",
    },
    {
      q: "Can I ride the golf cart on the beach?",
      a: "No — Cape Canaveral beaches do not permit golf cart or vehicle access on the sand. The cart is street-legal and perfect for roads, beach access paths, and local exploration.",
    },
    {
      q: "What happens if I need to cancel?",
      a: "You may cancel for a full refund, minus a $75 processing fee, as long as we receive notice more than 72 hours before your scheduled arrival date. Cancellations made within 72 hours of arrival are non-refundable. Once your rental period has begun, the reservation is also non-refundable, including for unused days or early departures. To cancel, contact us at 321-544-1539.",
    },
    {
      q: "Do you offer a discount code?",
      a: "Yes! If you received a promo code, you can enter it directly on the Stripe checkout page before completing payment.",
    },
    {
      q: "Is the cart safe for families?",
      a: "Absolutely. The cart seats 6 passengers and is designed for comfortable, low-speed local travel. Children must be seated and supervised at all times. Please review the safety guidelines on this page before your rental.",
    },
    {
      q: "What if the battery dies while I'm out?",
      a: "If your cart runs out of battery, call or text us right away at 321-544-1539 and do not attempt to continue driving. If a standard outlet is nearby, you may plug the cart in to recharge — even a short charge can provide enough power to get you back. If you're unable to recharge, contact us and we'll assist. A $75 service call fee applies if we need to come out in person. You are responsible for any third-party towing fees if you choose to contact a tow company. Tip: charge the cart nightly to avoid this situation.",
    },
    {
      q: "Can I cross roads with speed limits over 35 mph?",
      a: "Yes. You may cross higher-speed roads at intersections only, as permitted by Florida law. Driving along roads with speed limits over 35 mph is not allowed.",
    },
    {
      q: "Can I drive the golf cart at night?",
      a: "Yes. Our carts are fully street-legal and equipped with headlights, taillights, brake lights, and turn signals, making them safe to operate day or night.",
    },
  ];

  return (
    <section className="py-20 px-4" style={{ background: "oklch(0.99 0.005 220)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "oklch(0.48 0.18 232)" }}>
            Got Questions?
          </p>
          <h2
            className="text-foreground"
            style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontFamily: "'Playfair Display', serif" }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid oklch(0.90 0.015 220)",
                background: openIndex === i ? "white" : "oklch(0.98 0.005 220)",
                boxShadow: openIndex === i ? "0 4px 20px -4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-foreground text-sm leading-snug">{faq.q}</span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform"
                  style={{
                    background: openIndex === i ? "oklch(0.48 0.18 232)" : "oklch(0.93 0.04 215)",
                    color: openIndex === i ? "white" : "oklch(0.48 0.18 232)",
                    transform: openIndex === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetySection() {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    {
      icon: "🚗",
      label: "How to Operate",
      items: [
        { title: "Starting the Cart", body: "Turn the key to ON. The cart is electric — no engine noise is normal. Check that the gear selector is in NEUTRAL before starting." },
        { title: "Forward & Reverse", body: "Push the direction lever forward for DRIVE, pull back for REVERSE. Always come to a complete stop before switching directions." },
        { title: "Speed & Throttle", body: "Press the accelerator pedal gently to move. The cart has a governed top speed of approximately 20 mph. Do not force the pedal on inclines." },
        { title: "Braking", body: "Release the accelerator to slow down — regenerative braking engages automatically. Press the brake pedal firmly for a full stop. The parking brake lever is on the floor between the seats." },
        { title: "Lights & Signals", body: "Headlights: toggle switch on the dash. Turn signals: left-hand stalk. Horn: center of the steering wheel. Always use signals when turning on public roads." },
        { title: "Charging", body: "Please plug in the golf cart each night using the extension cord provided to the front porch outlet. A full charge takes 6–8 hours and keeps the cart ready for daily use. Avoid parking on grass while charging. Do not let the battery drop below 20%, and please return the cart with at least 30% charge." },
      ],
    },
    {
      icon: "⚠️",
      label: "Safety Rules",
      items: [
        { title: "Licensed Drivers Only", body: "Only the approved driver on the rental agreement may operate the cart. A valid driver's license must be in your possession at all times while driving." },
        { title: "Passenger Limit", body: "Maximum 6 passengers. Do not exceed the number of available seats. No passengers may ride on the roof, hood, or hang off the sides." },
        { title: "Seatbelts", body: "All passengers must be seated with seatbelts fastened before the cart moves. Children must be secured in an appropriate child restraint." },
        { title: "No Alcohol", body: "Operating the cart under the influence of alcohol or drugs is strictly prohibited and is a criminal offense under Florida law." },
        { title: "No Phones While Driving", body: "Handheld phone use while operating the cart is illegal in Florida. Pull over safely before using your phone." },
        { title: "Approved Roads Only", body: "The cart is approved for roads with a posted speed limit of 35 mph or less. Do not take the cart onto US-1, A1A, or any highway." },
        { title: "No Beach Driving", body: "Driving on the beach sand is not permitted. Park in designated areas and walk to the shoreline." },
        { title: "Weather", body: "Do not operate the cart in heavy rain, lightning, or severe weather. Pull over and wait for conditions to improve." },
      ],
    },
    {
      icon: "⚖️",
      label: "Local Laws",
      items: [
        { title: "Local Road Use", body: "This street-legal golf cart (LSV) can be driven on roads with speed limits of 35 mph or less throughout Cape Canaveral." },
        { title: "Street-Legal & Ready", body: "This is a fully street-legal low-speed vehicle (LSV), designed for safe and easy driving around town. Just hop in and go—no special setup needed." },
        { title: "Driver's License Required", body: "A valid driver's license is required to operate this cart on public roads in Cape Canaveral, FL. Unlicensed operation is a traffic violation." },
        { title: "Right-of-Way", body: "Golf carts must yield to all standard motor vehicles. Treat all intersections as you would in a car — obey all stop signs, traffic lights, and road markings." },
        { title: "Parking", body: "Park only in designated areas. Do not block driveways, fire hydrants, or ADA-accessible spaces. Parking on the beach is prohibited." },
        { title: "Liability", body: "The renter assumes full responsibility for any traffic violations, fines, or citations incurred during the rental period. The owner is not responsible for operator error." },
      ],
    },
    {
      icon: "🚨",
      label: "Emergencies",
      items: [
        { title: "Breakdown or Flat", body: "Pull safely off the road, turn on hazard lights, and call or text us immediately at the number in your booking confirmation. Do not attempt repairs yourself." },
        { title: "Accident or Collision", body: "Stop immediately. Check for injuries and call 911 if needed. Do not move the cart. Contact us right away and do not admit fault to any third party." },
        { title: "Lost or Stolen", body: "Call 911 immediately, then notify us. File a police report and provide us with the report number. Never leave the cart unattended with the key in the ignition." },
        { title: "Medical Emergency", body: "Call 911 immediately. Cape Canaveral Hospital is at 701 W Cocoa Beach Causeway, Cocoa Beach, FL — approximately 10 minutes by car." },
        { title: "Emergency Contact", body: "Our emergency line is available during your rental period. The number is in your booking confirmation email and on your booking status page." },
      ],
    },
    {
      icon: "🔧",
      label: "Maintenance",
      items: [
        { title: "Pre-Ride Inspection", body: "Before each use, do a quick check: tires inflated, no visible damage, lights working, battery above 30%. Report any issues to us before driving." },
        { title: "Battery Care", body: "This cart uses a lithium-ion battery pack. Do not run it to 0%. Charge after each use if possible. Do not leave it plugged in for more than 12 hours continuously." },
        { title: "Tire Pressure", body: "Recommended tire pressure is 22 PSI. Low pressure affects handling and range. If a tire looks flat, do not drive — contact us immediately." },
        { title: "Cleaning", body: "Please return the cart in the same condition it was received. Wipe down seats and surfaces if wet or sandy. Do not use a pressure washer on the cart." },
        { title: "Damage Reporting", body: "Any new damage — even minor scratches — must be reported to us at the end of your rental. Unreported damage discovered after return may be charged to the card on file." },
        { title: "Manufacturer Schedule", body: "This cart follows the manufacturer's recommended maintenance schedule: brake inspections, steering checks, battery health checks, and signal/light verification before each rental period." },
      ],
    },
  ];

  const active = tabs[activeTab];

  return (
    <section className="py-20 px-4" style={{ background: "oklch(0.10 0.05 240)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "oklch(0.72 0.12 215)" }}>
            Know Before You Go
          </p>
          <h2 className="text-white" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontFamily: "'Playfair Display', serif" }}>
            Safety &amp; Operations Guide
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Everything you need to know to enjoy Breezy safely and confidently.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-8" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeTab === i ? "oklch(0.48 0.18 232)" : "rgba(255,255,255,0.07)",
                color: activeTab === i ? "white" : "rgba(255,255,255,0.55)",
                border: activeTab === i ? "none" : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {active.items.map(({ title, body }) => (
            <div
              key={title}
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="font-semibold text-sm mb-2" style={{ color: "white" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
            <img src={LOGO_URL} alt="Breezy Coastal Rentals" className="h-9 w-9 object-contain" />
            <span
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "17px" }}
              className="text-foreground hidden sm:inline"
            >
              Breezy Coastal Rentals
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/about">
              <Button
                size="sm"
                variant="ghost"
                className="shadow-sm hidden sm:flex"
                style={{ background: "rgba(255,255,255,0.75)", color: "var(--primary)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", fontWeight: 600 }}
              >
                About
              </Button>
            </Link>
            <Link href="/availability">
              <Button
                size="sm"
                variant="ghost"
                className="shadow-sm hidden sm:flex"
                style={{ background: "rgba(255,255,255,0.75)", color: "var(--primary)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", fontWeight: 600 }}
              >
                Check Availability
              </Button>
            </Link>
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
            The Easiest Way to<br />Explore Cape Canaveral
          </h1>
          <p
            className="mb-10 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 3vw, 1.2rem)", color: "rgba(255,255,255,0.88)", textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
          >
            Your street-legal, private golf cart is already there — charged, ready, and waiting for you.
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
              Reserve Your Cart
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { icon: Clock, label: "60-sec booking" },
              { icon: ShieldCheck, label: "Street-legal LSV" },
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
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Why Add Breezy to Your Stay</p>
            <h2 className="text-foreground" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontFamily: "'Playfair Display', serif" }}>
              The Easiest Upgrade to Your Stay
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
              Turn every quick trip into part of the vacation. With your own golf cart, the beach, restaurants, and everything in between are just a relaxed ride away—no planning, no hassle, just go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Star,
                title: "It's Just More Fun",
                desc: "Cruising to the beach in a golf cart beats sitting in traffic every single time. Wind in your hair, no stress, pure vacation mode.",
                color: "oklch(0.93 0.06 215)",
                iconColor: "oklch(0.48 0.18 232)",
              },
              {
                icon: ParkingCircleOff,
                title: "Park Like a Car",
                desc: "As a street-legal vehicle, the golf cart parks in regular parking spots just like a car. No special permits needed — just find a spot and go.",
                color: "oklch(0.95 0.04 175)",
                iconColor: "oklch(0.45 0.15 175)",
              },
              {
                icon: MapPin,
                title: "Explore the Whole Area",
                desc: "Peacock Beach is a 2-minute ride. Restaurants, shops, and the waterfront are all within easy cart distance. See more, spend less time in the car.",
                color: "oklch(0.96 0.04 80)",
                iconColor: "oklch(0.55 0.14 60)",
              },
              {
                icon: ShieldCheck,
                title: "Street-Legal & Ready to Go",
                desc: "This is a fully street-legal low-speed vehicle (LSV) — licensed for roads with speed limits of 35 mph or less throughout Cape Canaveral. No special permit needed.",
                color: "oklch(0.94 0.04 250)",
                iconColor: "oklch(0.45 0.18 250)",
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
                A premium 6-seat electric cart, ready and waiting at the property. Your ticket to effortless coastal living.
              </p>
            </div>

            {/* Lifestyle photo grid — 4 images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { src: LIFESTYLE_FAMILY, alt: "Family heading to the beach in a golf cart", label: "Family Fun" },
                { src: LIFESTYLE_GIRLS, alt: "Girls trip on a golf cart by the ocean", label: "Girls Trip" },
                { src: LIFESTYLE_SUNSET, alt: "Couple watching sunset from a golf cart", label: "Sunset Rides" },
                { src: LIFESTYLE_SENIORS, alt: "Silver-haired couple laughing in a golf cart", label: "Any Age, Any Vibe" },
              ].map(({ src, alt, label }) => (
                <div key={label} className="rounded-2xl overflow-hidden relative group" style={{ aspectRatio: "4/3", minHeight: "160px", boxShadow: "0 20px 60px -10px rgba(0,0,0,0.5)" }}>
                  <img src={src} alt={alt} loading="eager" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ display: "block", minHeight: "160px" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(10,28,60,0.7) 100%)" }} />
                  <span className="absolute bottom-3 left-4 text-white text-xs font-semibold tracking-wide" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Elegant cart specs pill */}
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              {[
                { icon: "👥", text: "Seats up to 6 guests" },
                { icon: "⚡", text: "Electric · full-day range" },
                { icon: "✅", text: "Street-legal LSV" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <span style={{ fontSize: "16px" }}>{icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em" }}>{text}</span>
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
                Reserve Your Cart
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Must be 25+ · Valid license & insurance required · Cape Canaveral, FL
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

      {/* ── Safety & Operations ─────────────────────────────────── */}
      <SafetySection />

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 text-center" style={{ background: "oklch(0.08 0.04 240)" }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src={LOGO_URL} alt="Breezy Coastal Rentals" className="h-12 w-12 object-contain" />
          <span
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "20px", color: "white" }}
          >
            Breezy Coastal Rentals
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Cape Canaveral, Florida · Street-Legal Golf Cart Rental
        </p>
        <a href="tel:3215441539" className="inline-block mt-3 text-sm font-semibold" style={{ color: "oklch(0.65 0.18 232)" }}>
          📞 321-544-1539
        </a>
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
