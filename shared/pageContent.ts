import { z } from "zod";

export const PAGE_MODULE_TYPES = [
  "hero_image",
  "hero_cta",
  "benefits_header",
  "benefit_card",
  "lifestyle_header",
  "lifestyle_photo",
  "faq_header",
  "faq_item",
] as const;

export type PageModuleType = (typeof PAGE_MODULE_TYPES)[number];

export const pageModuleSchema = z.object({
  id: z.string(),
  type: z.enum(PAGE_MODULE_TYPES),
  data: z.record(z.string(), z.string()),
});

export const pageContentSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string().optional(),
  modules: z.array(pageModuleSchema),
});

export type PageModule = z.infer<typeof pageModuleSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;

export const LIVE_CONTENT_PATH = "content/home-content.json";
export const DRAFT_CONTENT_PATH = "content/home-content.draft.json";

const LIFESTYLE_FAMILY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-family-red-cart-34RZSKBssW4hJLcAMPiYNo.webp";
const LIFESTYLE_GIRLS =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-girls-trip-red-cart-bTPTVVKBzyvgsyewtHGH9F.webp";
const LIFESTYLE_SUNSET =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-sunset-red-cart-KuxovWgnr7jqwNNWMMWaWB.webp";
const LIFESTYLE_SENIORS =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/lifestyle-seniors-v3_8fd8ef29.png";

export function createDefaultPageContent(): PageContent {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: "hero-image",
        type: "hero_image",
        data: { imageUrl: "/assets/hero_golf_cart_final.jpg" },
      },
      {
        id: "hero-cta",
        type: "hero_cta",
        data: {
          badge: "Cape Canaveral, Florida",
          heading: "The Easiest Way to\nExplore Cape Canaveral",
          subtitle:
            "Your street-legal, private golf carts are already there — charged, ready, and waiting for you.",
          buttonLabel: "Reserve Your Carts",
        },
      },
      {
        id: "benefits-header",
        type: "benefits_header",
        data: {
          eyebrow: "Why Add Breezy to Your Stay",
          title: "The Easiest Upgrade to Your Stay",
          subtitle:
            "Turn every quick trip into part of the vacation. With your own golf cart, the beach, restaurants, and everything in between are just a relaxed ride away—no planning, no hassle, just go.",
        },
      },
      {
        id: "benefit-1",
        type: "benefit_card",
        data: {
          title: "It's Just More Fun",
          description:
            "Cruising to the beach in a golf cart beats sitting in traffic every single time. Wind in your hair, no stress, pure vacation mode.",
        },
      },
      {
        id: "benefit-2",
        type: "benefit_card",
        data: {
          title: "Park Like a Car",
          description:
            "As a street-legal vehicle, the golf cart parks in regular parking spots just like a car. No special permits needed — just find a spot and go.",
        },
      },
      {
        id: "benefit-3",
        type: "benefit_card",
        data: {
          title: "Explore the Whole Area",
          description:
            "Peacock Beach is a 2-minute ride. Restaurants, shops, and the waterfront are all within easy cart distance. See more, spend less time in the car.",
        },
      },
      {
        id: "benefit-4",
        type: "benefit_card",
        data: {
          title: "Street-Legal & Ready to Go",
          description:
            "This is a fully street-legal low-speed vehicle (LSV) — licensed for roads with speed limits of 35 mph or less throughout Cape Canaveral. No special permit needed.",
        },
      },
      {
        id: "lifestyle-header",
        type: "lifestyle_header",
        data: {
          eyebrow: "Your Ride Awaits",
          title: "Meet Your Golf Cart",
          subtitle:
            "A premium 6-seat electric cart, ready and waiting at the property. Your ticket to effortless coastal living.",
        },
      },
      {
        id: "lifestyle-1",
        type: "lifestyle_photo",
        data: { imageUrl: LIFESTYLE_FAMILY, label: "Family Fun", alt: "Family heading to the beach in a golf cart" },
      },
      {
        id: "lifestyle-2",
        type: "lifestyle_photo",
        data: { imageUrl: LIFESTYLE_GIRLS, label: "Girls Trip", alt: "Girls trip on a golf cart by the ocean" },
      },
      {
        id: "lifestyle-3",
        type: "lifestyle_photo",
        data: { imageUrl: LIFESTYLE_SUNSET, label: "Sunset Rides", alt: "Couple watching sunset from a golf cart" },
      },
      {
        id: "lifestyle-4",
        type: "lifestyle_photo",
        data: {
          imageUrl: LIFESTYLE_SENIORS,
          label: "Any Age, Any Vibe",
          alt: "Silver-haired couple laughing in a golf cart",
        },
      },
      {
        id: "faq-header",
        type: "faq_header",
        data: {
          eyebrow: "Got Questions?",
          title: "Frequently Asked Questions",
        },
      },
      {
        id: "faq-1",
        type: "faq_item",
        data: {
          question: "Who can rent the golf cart?",
          answer:
            "You must be 25 or older with a valid driver's license and proof of insurance. The cart is available to vacation rental guests and visitors staying in the Cape Canaveral area.",
        },
      },
      {
        id: "faq-2",
        type: "faq_item",
        data: {
          question: "Do I need insurance to rent?",
          answer:
            "Yes. You'll need to upload a photo of your current auto insurance card during the booking process. This is required before your booking can be approved.",
        },
      },
      {
        id: "faq-3",
        type: "faq_item",
        data: {
          question: "How does the booking process work?",
          answer:
            "Select your dates, provide your details, upload your driver's license and insurance card, sign the digital waiver, and pay. Your booking is then reviewed by our team — you'll receive an email once it's approved.",
        },
      },
    ],
  };
}

export const MODULE_LABELS: Record<PageModuleType, string> = {
  hero_image: "Hero Photo",
  hero_cta: "Main Headline & Button",
  benefits_header: "Benefits Section Title",
  benefit_card: "Benefit Card",
  lifestyle_header: "Photo Gallery Title",
  lifestyle_photo: "Lifestyle Photo",
  faq_header: "FAQ Section Title",
  faq_item: "FAQ Question",
};

export function parsePageContent(raw: string): PageContent {
  const parsed = JSON.parse(raw);
  return pageContentSchema.parse(parsed);
}
