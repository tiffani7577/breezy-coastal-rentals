# Breezy Coastal Rentals — TODO

## Phase 1: Foundation
- [x] Initialize project with web-db-user scaffold
- [x] Design system (CSS variables, typography, coastal color palette)
- [x] Database schema: bookings, documents, availability_blocks, pricing, waiver_signatures
- [x] tRPC routers: bookings, availability, pricing, documents, admin
- [x] S3 file upload endpoint for driver's license and proof of insurance

## Phase 2: Guest Booking Flow
- [x] Landing page (hero, benefits, requirements CTA) — Cape Canaveral beach photos
- [x] Step 1: Date picker with real-time availability (disabled blocked/booked dates)
- [x] Step 2: Guest details form (name, phone, email, Airbnb booking name)
- [x] Step 3: Driver's license + proof of insurance upload (camera-first mobile, JPG/PNG/PDF, 10MB max)
- [x] Step 4: Liability waiver e-signature (typed name + checkbox + timestamp + user agent)
- [x] Step 5: Review + Stripe Checkout redirect
- [x] Post-payment confirmation page with status timeline
- [x] Booking status page (guest can view reservation details by ref number)

## Phase 3: Admin Dashboard
- [x] Admin login (protected route, role-based, Manus OAuth)
- [x] Bookings list with status filters
- [x] Booking detail view (customer info, documents, waiver, status)
- [x] Approve / reject booking actions with optional rejection reason
- [x] Document viewer + download links
- [x] Availability calendar (block/unblock dates)
- [x] Pricing management (per-day rate, delivery fee)
- [x] Cart settings (name, description)

## Phase 4: Integrations
- [x] Stripe Checkout session creation
- [x] Stripe webhook endpoint at /api/stripe/webhook
- [x] Stripe payment confirmation (updates booking to "submitted")
- [x] Resend email: guest booking confirmation
- [x] Resend email: booking approved notification
- [x] Resend email: booking rejected notification (with reason)
- [x] Resend email: admin new booking alert with dashboard link

## Phase 5: Polish & Tests
- [x] Mobile-first responsive design across all pages
- [x] Coastal luxury design system (Playfair Display + Inter, OKLCH palette)
- [x] Terms of Service and Privacy Policy pages
- [x] Vitest unit tests (14 tests passing)
- [x] Final checkpoint + delivery

## Bug Fixes
- [x] Fix guestName validation error (too_small) — confirmed user input issue (single char), not a code bug

## Enhancements
- [x] Add animated ocean wave SVG/CSS animation to hero bottom edge
- [x] Add golf cart video section below hero (autoplay, muted, looping)
- [x] Add golf cart + beach pathway image card replacing one of the lower beach photos
- [x] Source best available golf cart / Peacock Beach pathway images
- [x] Fix broken Pexels iframe in golf cart section — replaced with animated SVG cinemagraph
- [x] Fix calendar empty space on right side (DayPicker not filling container width)
- [x] Replace Pexels iframe with cinemagraph-style animated SVG coastal scene
- [x] Replace cartoon SVG cinemagraph with AI-generated luxury golf cart sunset beach photo
- [x] Generate AI hero image: green ICON golf cart on gravel driveway, rocket launch in sky, tropical palms, excited group
- [x] Generate Image 1: Night balcony scene — family silhouettes watching SpaceX rocket launch over pool with twinkle lights, green golf cart visible on gravel driveway below
- [x] Generate Image 2: Aerial beach scene — green ICON golf cart parked at beach, group watching rocket arc still in sky, Cape Canaveral coast
- [x] Generate stylized panoramic: oversized cartoon-ish green ICON golf cart tilted on two wheels on gravel driveway, manatee mailbox, red ti plants, palm trees, pool/balcony house, beach in distance, night rocket arc
- [x] Generate left card image: aerial bird's-eye view from balcony looking down at property — lush tropical landscaping, white gravel cul-de-sac, red ti plants, royal palms, green ICON golf cart small in background heading toward manatee mailbox, no visible faces, warm golden-hour tropical luxury feel
- [x] Generate bottom-left photo: Peacock Beach access path at golden hour dusk — warm amber light, palm silhouettes, soft Atlantic waves, no people, cinematic luxury travel photography matching dark navy section aesthetic
- [x] Generate bottom-right photo: Canaveral coastline at golden hour — dramatic warm sky, ocean glowing amber, lush coastal vegetation silhouettes, cinematic luxury travel photography matching dark navy section aesthetic
- [x] Regenerate all 4 landing page photos with stunning magazine-quality cinematic imagery and unify photo strip section to dark navy background
- [x] Redesign admin dashboard to be senior-friendly: big cards, plain English, large text, no jargon
- [x] Add messages table to DB schema (booking_id, sender_role, content, timestamp, read)
- [x] Add tRPC procedures: sendMessage, listMessages, markMessagesRead
- [x] Build per-booking detail page with Airbnb-style message thread (admin ↔ guest)
- [x] Add guest-side message inbox so guests can see and reply to admin messages
- [x] Email notification to admin when guest sends a message
- [x] Email notification to guest when admin sends a message
