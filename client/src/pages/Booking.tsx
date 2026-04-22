import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import {
  Waves,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Upload,
  FileText,
  CreditCard,
  Check,
  X,
  AlertCircle,
  Camera,
  Loader2,
  Car,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, addDays, differenceInCalendarDays, isBefore, startOfDay, isWithinInterval } from "date-fns";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Dates", icon: Calendar },
  { id: 2, label: "Vehicle", icon: Car },
  { id: 3, label: "Details", icon: User },
  { id: 4, label: "Documents", icon: Upload },
  { id: 5, label: "Waiver", icon: FileText },
  { id: 6, label: "Payment", icon: CreditCard },
];

const WAIVER_TEXT = `Rental Agreement & Liability Waiver

This Rental Agreement & Liability Waiver is entered into between Breezy Coastal Rentals, LLC ("Company") and the undersigned renter. By signing below, you agree to all terms and conditions outlined herein.

RENTAL TERMS
• Rental period applies April 26 - May 2, 2026 and begins at 4:00 PM on the first day and ends at 10:00 AM on the final day.
• The golf cart is provided at and must be returned to: 8720 Seashell Ln., Cape Canaveral, FL 32920
• The vehicle may be used off the property but must be returned to and stored at this address when not in use. Late returns will result in an additional charge of $160.

SECURITY DEPOSIT & DAMAGES
• A security deposit will be collected at the time of booking. The deposit will be returned within 3 days after the rental period, following a satisfactory inspection of the vehicle.
• The Company reserves the right to charge the renter's payment method for any damages exceeding the deposit amount. Any such charges will be reasonable, documented, and made in good faith based on the cost of repair or replacement. The renter will be notified prior to any charges being processed.

AGE & DRIVER REQUIREMENTS
• The primary renter must be at least 25 years of age and is fully responsible for all drivers and use of the vehicle. All additional drivers must be at least 21 years of age, hold a valid driver's license, and be listed on this agreement.

DAMAGE RESPONSIBILITY
• I agree to return the vehicle in the same condition it was received. I am financially responsible for any damage, theft, loss, or excessive cleaning that occurs during my rental period. Damages will be charged at the cost of repair or replacement.

ASSUMPTION OF RISK
• I understand that operating a street-legal low-speed vehicle (LSV) involves inherent risks, including but not limited to personal injury, property damage, and accidents. I voluntarily assume all such risks.

RELEASE OF LIABILITY
• I hereby release, waive, and discharge the Company, its owners, agents, and representatives from any and all claims, damages, losses, or liability arising from my use of the vehicle.

RESPONSIBLE USE
• I agree to operate the vehicle in a safe and lawful manner, obey all applicable traffic laws, and not operate the vehicle under the influence of alcohol or drugs.

TRAFFIC VIOLATIONS & FINES
• Renter is solely responsible for any traffic violations, citations, fines, towing, or impound fees incurred during the rental period and agrees to reimburse the Company for any such costs if charged to the Company.

INSURANCE
• I confirm that I have valid personal auto insurance that covers LSV use, or I accept full financial responsibility for any damage or liability.

INDEMNIFICATION
• I agree to indemnify and hold harmless the Company from any claims, costs, or expenses arising from my use of the vehicle.

SERVICE & TOWING
• A $75 service fee will be charged if assistance is required due to misuse or avoidable issues (including but not limited to running out of battery charge). Towing or recovery costs are the responsibility of the renter.

KEY LOSS / REPLACEMENT
• Renter will be provided with one (1) key. Loss of the key will result in a $200 replacement fee.

BATTERY & CHARGING
• The vehicle must be charged nightly using the provided charger and extension cord only. Renter is responsible for ensuring the vehicle remains adequately charged throughout the rental period. Failure to properly charge the vehicle may result in additional fees if service, towing, or battery-related issues occur.

CANCELLATION POLICY
• Cancellations made 72 hours or more prior to the rental start date will receive a full refund. Cancellations made within 72 hours of the rental start date are non-refundable. No refunds will be issued for unused rental time after the rental period has begun.

GOLF CART RULES
• The golf cart is a street-legal low-speed vehicle (LSV) and must follow all traffic laws, including speed limits and use of headlights when required.
• The vehicle may only be operated on roads with posted speed limits of 35 MPH or less.
• Operation on highways or higher-speed roadways is strictly prohibited.
• Golf cart may not be operated between 11:00 PM and 6:00 AM.
• No parking on grass. Cart must be parked in the gravel driveway at the property.
• Maximum of 6 passengers. All passengers must be seated while the vehicle is in motion.
• No reckless driving, racing, or misuse of the vehicle.
• No operation under the influence of alcohol or drugs.
• Renter agrees to report any malfunction or issue immediately.
• At the end of the rental period, the golf cart must be returned to the property and plugged in using the provided charger and extension cord.

Violation of these rules may result in immediate termination of rental privileges without refund. This includes but not limited to: Underage or unapproved drivers, Driving under the influence, Reckless or unsafe operation, Operating off-road or on grass areas.

Renter must provide a valid driver's license and proof of auto insurance prior to receiving the vehicle.

By signing below, I agree to all terms of this Rental Agreement & Liability Waiver.`;

type DateRange = { from: Date | undefined; to: Date | undefined };
type UploadedFile = { file: File; preview: string; base64: string } | null;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatPhone(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Booking() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Step 1
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  // Step 2
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [airbnbName] = useState(""); // kept for schema compat, not shown to user

  // Step 3
  const [licenseFile, setLicenseFile] = useState<UploadedFile>(null);
  const [insuranceFile, setInsuranceFile] = useState<UploadedFile>(null);
  const licenseRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);

  // Step 4
  const [waiverName, setWaiverName] = useState("");
  const [waiverAgreed, setWaiverAgreed] = useState(false);

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const { data: pricingData } = trpc.pricing.get.useQuery();
  const { data: availData } = trpc.availability.getBlockedDates.useQuery();
  const createBooking = trpc.bookings.create.useMutation();
  const uploadDoc = trpc.documents.upload.useMutation();
  const createCheckout = trpc.bookings.createCheckout.useMutation();

  const MIN_DAYS = 4;
  const dailyRate = parseFloat(pricingData?.dailyRate ?? "160");
  const deliveryFee = parseFloat(pricingData?.deliveryFee ?? "0");
  const totalDays =
    dateRange.from && dateRange.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from)
      : 0;
  const subtotal = totalDays * dailyRate;
  const taxRate = 0.07;
  const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
  const depositAmount = 300;
  const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

  // Build disabled dates
  const disabledDates = useCallback(() => {
    const disabled: Date[] = [];
    const today = startOfDay(new Date());

    // Past dates
    for (let i = 0; i < 365; i++) {
      const d = addDays(new Date(today.getFullYear() - 1, 0, 1), i);
      if (isBefore(d, today)) disabled.push(d);
    }

    // Blocked dates
    availData?.blocks.forEach((b) => {
      disabled.push(new Date(b.blockDate));
    });

    // Approved booking ranges
    availData?.approvedRanges.forEach((r) => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      let cur = start;
      while (!isBefore(end, cur)) {
        disabled.push(new Date(cur));
        cur = addDays(cur, 1);
      }
    });

    return disabled;
  }, [availData]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: UploadedFile) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or PDF.");
      return;
    }
    const base64 = await fileToBase64(file);
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    setter({ file, preview, base64 });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!dateRange.from || !dateRange.to) {
        toast.error("Please select your rental dates.");
        return;
      }
      if (totalDays < MIN_DAYS) {
        toast.error(`Minimum rental is ${MIN_DAYS} nights. You selected ${totalDays} nights.`);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Vehicle selection — cart is auto-selected, just advance
      setStep(3);
    } else if (step === 3) {
      if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        toast.error("Please fill in all fields.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (guestPhone.replace(/\D/g, "").length < 10) {
        toast.error("Please enter a valid US phone number.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!licenseFile || !insuranceFile) {
        toast.error("Please upload both your driver's license and proof of insurance.");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!waiverName.trim()) {
        toast.error("Please type your full legal name to sign the waiver.");
        return;
      }
      if (!waiverAgreed) {
        toast.error("Please agree to the terms to continue.");
        return;
      }
      setStep(6);
    } else if (step === 6) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!dateRange.from || !dateRange.to) return;
    setIsSubmitting(true);
    try {
      // Create booking
      const { bookingRef: ref, bookingId: id } = await createBooking.mutateAsync({
        guestName,
        guestEmail,
        guestPhone,
        airbnbBookingName: airbnbName,
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        totalDays,
        dailyRate: dailyRate.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        waiverLegalName: waiverName,
        waiverAgreed,
        waiverIp: undefined,
        waiverUserAgent: navigator.userAgent,
      });

      setBookingRef(ref);
      setBookingId(id);

      // Upload documents
      if (licenseFile) {
        await uploadDoc.mutateAsync({
          bookingId: id,
          documentType: "drivers_license",
          fileName: licenseFile.file.name,
          mimeType: licenseFile.file.type,
          fileSize: licenseFile.file.size,
          fileBase64: licenseFile.base64,
        });
      }
      if (insuranceFile) {
        await uploadDoc.mutateAsync({
          bookingId: id,
          documentType: "proof_of_insurance",
          fileName: insuranceFile.file.name,
          mimeType: insuranceFile.file.type,
          fileSize: insuranceFile.file.size,
          fileBase64: insuranceFile.base64,
        });
      }

      // Create Stripe checkout
      const { url } = await createCheckout.mutateAsync({
        bookingRef: ref,
        origin: window.location.origin,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const FileUploadCard = ({
    label,
    hint,
    file,
    inputRef,
    onChange,
    imageOnly = false,
  }: {
    label: string;
    hint: string;
    file: UploadedFile;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    imageOnly?: boolean;
  }) => (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid oklch(0.90 0.015 220)" }}
    >
      <div className="p-4" style={{ background: "oklch(0.97 0.008 220)" }}>
        <p className="font-semibold text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="p-4 bg-white">
        {file ? (
          <div className="flex items-center gap-3">
            {file.preview ? (
              <img src={file.preview} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.93 0.04 215)" }}
              >
                <FileText className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.file.size / 1024).toFixed(0)} KB</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary font-medium"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center gap-3 py-6 rounded-xl transition-colors"
            style={{ border: "2px dashed oklch(0.85 0.02 220)", background: "oklch(0.99 0.004 220)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.93 0.04 215)" }}
            >
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Tap to upload</p>
              <p className="text-xs text-muted-foreground mt-0.5">{imageOnly ? "JPG or PNG · Max 10MB" : "JPG, PNG, or PDF · Max 10MB"}</p>
            </div>
          </button>
        )}
        <input
          ref={inputRef as any}
          type="file"
          accept={imageOnly ? "image/*" : "image/*,application/pdf"}
          capture="environment"
          className="hidden"
          onChange={onChange}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.99 0.005 220)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-4"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid oklch(0.93 0.01 220)" }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.96 0.01 220)" }}>
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/breezy-logo-transparent_f177cea4.png" alt="Breezy" className="h-8 w-8 object-contain" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "16px" }}>
              Breezy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/availability">
              <span className="text-xs font-medium hidden sm:block" style={{ color: "oklch(0.48 0.18 232)" }}>Check Availability</span>
            </Link>
            <span className="text-xs text-muted-foreground font-medium">
              Step {step} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1.5 rounded-full" style={{ background: "oklch(0.93 0.01 220)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(step / STEPS.length) * 100}%`,
                background: "linear-gradient(90deg, oklch(0.48 0.18 232), oklch(0.62 0.15 215))",
              }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: done
                        ? "oklch(0.62 0.15 215)"
                        : active
                        ? "oklch(0.48 0.18 232)"
                        : "oklch(0.93 0.01 220)",
                      color: done || active ? "white" : "oklch(0.6 0.04 230)",
                    }}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className="text-[10px] font-medium hidden sm:block"
                    style={{ color: active ? "oklch(0.48 0.18 232)" : "oklch(0.6 0.04 230)" }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* ── Step 1: Dates ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Select Your Dates
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Choose your rental start and end dates. Minimum 4-night rental.
              </p>
            </div>

            <div
              className="rounded-2xl p-4 bg-white mb-4"
              style={{ border: "1px solid oklch(0.90 0.015 220)", boxShadow: "0 2px 16px -2px rgba(0,0,0,0.06)" }}
            >
              <DayPicker
                mode="range"
                selected={dateRange as any}
                onSelect={(r: any) => setDateRange(r ?? { from: undefined, to: undefined })}
                disabled={[{ before: new Date() }, ...disabledDates()]}
                numberOfMonths={1}
                showOutsideDays={false}
                className="w-full"
                styles={{
                  root: { width: "100%", maxWidth: "100%" },
                  months: { width: "100%" },
                  month: { width: "100%" },
                  month_grid: { width: "100%", tableLayout: "fixed", borderCollapse: "collapse" },
                  head_cell: { width: "14.2857%", textAlign: "center" },
                  cell: { width: "14.2857%", textAlign: "center" },
                  day: { width: "100%", margin: "0 auto" },
                }}
              />
            </div>

            {dateRange.from && dateRange.to && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "oklch(0.93 0.04 215)", border: "1px solid oklch(0.85 0.06 215)" }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-primary font-semibold uppercase tracking-wide">Selected Dates</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{totalDays} day{totalDays !== 1 ? "s" : ""}</p>
                    <p className="font-bold text-foreground">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {pricingData && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                ${dailyRate}/day · 4-night minimum · 7% tax · $300 refundable security deposit charged at checkout
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Vehicle Selection ─────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Choose Your Vehicle
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {totalDays} day{totalDays !== 1 ? "s" : ""} · {dateRange.from && dateRange.to ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}` : ""}
              </p>
            </div>
            {/* Cart inventory card */}
            <div
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ border: "2px solid oklch(0.48 0.18 232)", boxShadow: "0 0 0 4px oklch(0.93 0.04 215)", background: "white" }}
            >
              <div className="relative" style={{ height: "200px", background: "oklch(0.93 0.04 215)" }}>
                {pricingData?.cartImageUrl ? (
                  <img src={pricingData.cartImageUrl} alt="Golf Cart" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16" style={{ color: "oklch(0.48 0.18 232)" }} />
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-bold text-xs" style={{ background: "#dcfce7", color: "#166534" }}>✓ Available</div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-foreground" style={{ fontSize: "20px", fontFamily: "'Playfair Display', serif" }}>{pricingData?.cartName ?? "Breezy Golf Cart"}</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">{pricingData?.cartDescription ?? "6-passenger electric golf cart"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ fontSize: "22px", color: "oklch(0.48 0.18 232)" }}>${dailyRate}<span className="text-sm font-normal text-muted-foreground">/day</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 6 passengers</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Electric</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Street legal</span>
                </div>
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "oklch(0.93 0.04 215)" }}>
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm font-semibold text-primary">Selected for your stay</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">Total: <strong>${totalAmount.toFixed(2)}</strong> for {totalDays} day{totalDays !== 1 ? "s" : ""}</p>
          </div>
        )}

        {/* ── Step 3: Guest Details ─────────────────────────────── */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your Details
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                We'll use this to send your confirmation and keep you updated.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">Full Name</Label>
                <Input
                  placeholder="Jane Smith"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  style={{ border: "1px solid oklch(0.88 0.015 220)" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">Email Address</Label>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  style={{ border: "1px solid oklch(0.88 0.015 220)" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(formatPhone(e.target.value))}
                  className="h-12 rounded-xl text-base"
                  style={{ border: "1px solid oklch(0.88 0.015 220)" }}
                />
              </div>

            </div>
          </div>
        )}

        {/* ── Step 4: Documents ─────────────────────────────────── */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Upload Documents
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Required for rental approval. Tap to take a photo or upload a file.
              </p>
            </div>

            <div className="space-y-4">
              <FileUploadCard
                label="Driver's License"
                hint="Front of your valid driver's license"
                file={licenseFile}
                inputRef={licenseRef}
                onChange={(e) => handleFileUpload(e, setLicenseFile)}
              />
              <FileUploadCard
                label="Insurance Card Photo"
                hint="Take a photo of your insurance card — front side"
                file={insuranceFile}
                inputRef={insuranceRef}
                onChange={(e) => handleFileUpload(e, setInsuranceFile)}
                imageOnly
              />
            </div>

            <div
              className="mt-4 rounded-xl p-3 flex items-start gap-2.5"
              style={{ background: "oklch(0.97 0.02 215)", border: "1px solid oklch(0.88 0.04 215)" }}
            >
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary leading-relaxed">
                Documents are stored securely and only used to verify your rental eligibility. We never share your information.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 5: Waiver ────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Rental Agreement & Liability Waiver
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Please read and sign the rental agreement.
              </p>
            </div>

            <div
              className="rounded-2xl p-4 mb-5 h-52 overflow-y-auto"
              style={{ background: "oklch(0.98 0.005 220)", border: "1px solid oklch(0.90 0.015 220)" }}
            >
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                {WAIVER_TEXT}
              </pre>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                  Type Your Full Legal Name to Sign
                </Label>
                <Input
                  placeholder="Your full legal name"
                  value={waiverName}
                  onChange={(e) => setWaiverName(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  style={{
                    border: "1px solid oklch(0.88 0.015 220)",
                    fontStyle: waiverName ? "italic" : "normal",
                    fontFamily: waiverName ? "'Playfair Display', serif" : "inherit",
                  }}
                />
                {waiverName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Signed: {new Date().toLocaleString()}
                  </p>
                )}
              </div>

              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "oklch(0.97 0.01 220)", border: "1px solid oklch(0.90 0.015 220)" }}
              >
                <Checkbox
                  id="waiver-agree"
                  checked={waiverAgreed}
                  onCheckedChange={(v) => setWaiverAgreed(!!v)}
                  className="mt-0.5"
                />
                <label htmlFor="waiver-agree" className="text-sm text-foreground leading-relaxed cursor-pointer">
                  I have read and agree to the Rental Agreement & Liability Waiver, <Link href="/terms" className="text-primary underline">Terms of Service</Link>, and <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 6: Review + Payment ──────────────────────────── */}
        {step === 6 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Review & Pay
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Confirm your booking details before payment.
              </p>
            </div>

            {/* Booking summary */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ border: "1px solid oklch(0.90 0.015 220)", boxShadow: "0 2px 16px -2px rgba(0,0,0,0.06)" }}
            >
              <div className="p-4" style={{ background: "linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)" }}>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Booking Summary</p>
                <p className="text-white font-bold text-lg mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {pricingData?.cartName ?? "Breezy Golf Cart"}
                </p>
              </div>
              <div className="p-4 bg-white space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium text-foreground">
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{totalDays} day{totalDays !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-medium text-foreground">{guestName}</span>
                </div>
                <div className="h-px" style={{ background: "oklch(0.93 0.01 220)" }} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">${dailyRate}/day × {totalDays} days</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Florida sales tax (7%)</span>
                  <span className="font-medium text-foreground">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="h-px" style={{ background: "oklch(0.93 0.01 220)" }} />
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Total Due Now</span>
                  <span className="font-bold text-xl text-primary">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refundable security deposit (charged at checkout, returned after inspection)</span>
                  <span className="font-medium text-foreground">${depositAmount}</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 mb-6">
              {[
                { label: "Rental dates selected", done: !!(dateRange.from && dateRange.to) },
                { label: "Guest details provided", done: !!(guestName && guestEmail && guestPhone) },
                { label: "Documents uploaded", done: !!(licenseFile && insuranceFile) },
                { label: "Waiver signed", done: !!(waiverName && waiverAgreed) },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? "oklch(0.62 0.15 175)" : "oklch(0.93 0.01 220)" }}
                  >
                    {done ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className="text-sm" style={{ color: done ? "oklch(0.35 0.1 175)" : "oklch(0.55 0.04 230)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-3 flex items-start gap-2.5 mb-2"
              style={{ background: "oklch(0.97 0.02 215)", border: "1px solid oklch(0.88 0.04 215)" }}
            >
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary leading-relaxed">
                You'll be redirected to Stripe for secure payment. Your booking is subject to admin review after payment.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-2xl text-base font-semibold"
              onClick={() => setStep(step - 1)}
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button
            className="flex-1 h-14 rounded-2xl text-base font-semibold shadow-lg"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.18 232) 0%, oklch(0.38 0.16 240) 100%)",
              color: "white",
              border: "none",
            }}
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : step === 5 ? (
              <>
                Pay ${totalAmount.toFixed(2)}
                <CreditCard className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
