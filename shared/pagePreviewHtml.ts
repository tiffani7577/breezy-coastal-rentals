import type { PageContent } from "./pageContent";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveImageUrl(url: string, siteUrl: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export function buildPagePreviewHtml(content: PageContent, siteUrl: string): string {
  const modules = content.modules;
  const heroImage = modules.find((m) => m.type === "hero_image");
  const heroCta = modules.find((m) => m.type === "hero_cta");
  const benefitsHeader = modules.find((m) => m.type === "benefits_header");
  const benefitCards = modules.filter((m) => m.type === "benefit_card");
  const lifestyleHeader = modules.find((m) => m.type === "lifestyle_header");
  const lifestylePhotos = modules.filter((m) => m.type === "lifestyle_photo");
  const faqHeader = modules.find((m) => m.type === "faq_header");
  const faqItems = modules.filter((m) => m.type === "faq_item");

  const heroImgUrl = resolveImageUrl(heroImage?.data.imageUrl ?? "", siteUrl);
  const heading = escapeHtml(heroCta?.data.heading ?? "").replace(/\n/g, "<br />");

  const benefitCardsHtml = benefitCards
    .map(
      (card) => `
      <div class="card">
        <h3>${escapeHtml(card.data.title ?? "")}</h3>
        <p>${escapeHtml(card.data.description ?? "")}</p>
      </div>`
    )
    .join("");

  const lifestyleHtml = lifestylePhotos
    .map(
      (photo) => `
      <div class="photo">
        <img src="${escapeHtml(resolveImageUrl(photo.data.imageUrl ?? "", siteUrl))}" alt="${escapeHtml(photo.data.alt ?? "")}" />
        <span>${escapeHtml(photo.data.label ?? "")}</span>
      </div>`
    )
    .join("");

  const faqHtml = faqItems
    .map(
      (item) => `
      <details class="faq">
        <summary>${escapeHtml(item.data.question ?? "")}</summary>
        <p>${escapeHtml(item.data.answer ?? "")}</p>
      </details>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, system-ui, sans-serif; color: #0f172a; background: #f8fafc; }
    .banner { background: #0284c7; color: white; text-align: center; padding: 8px 12px; font-size: 13px; font-weight: 600; }
    .hero { min-height: 280px; background-size: cover; background-position: 25% center; position: relative; }
    .hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,28,60,0.15), rgba(10,28,60,0.35)); }
    .hero-cta { padding: 48px 20px; text-align: center; background: white; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-family: "Playfair Display", Georgia, serif; font-size: clamp(1.8rem, 5vw, 2.6rem); line-height: 1.15; margin-bottom: 16px; }
    .subtitle { color: #64748b; font-size: 1rem; line-height: 1.6; max-width: 520px; margin: 0 auto 24px; }
    .btn { display: inline-block; padding: 14px 28px; border-radius: 14px; background: linear-gradient(135deg, #0284c7, #1e3a8a); color: white; font-weight: 600; text-decoration: none; }
    section { padding: 40px 20px; }
    .section-head { text-align: center; max-width: 640px; margin: 0 auto 28px; }
    .eyebrow { color: #0284c7; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
    h2 { font-family: "Playfair Display", Georgia, serif; font-size: 1.75rem; margin-bottom: 10px; }
    .grid { display: grid; gap: 16px; max-width: 960px; margin: 0 auto; }
    @media (min-width: 640px) { .grid.cols-2 { grid-template-columns: repeat(2, 1fr); } .grid.cols-4 { grid-template-columns: repeat(4, 1fr); } }
    .card { background: #e0f2fe; border-radius: 16px; padding: 20px; border: 1px solid rgba(0,0,0,0.04); }
    .card h3 { font-family: "Playfair Display", Georgia, serif; font-size: 1.1rem; margin-bottom: 8px; }
    .card p { font-size: 14px; color: #334155; line-height: 1.5; }
    .dark { background: #0c1929; color: white; }
    .dark h2 { color: white; }
    .dark .section-head p { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.6; }
    .photo { border-radius: 16px; overflow: hidden; position: relative; aspect-ratio: 4/3; }
    .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .photo span { position: absolute; bottom: 10px; left: 12px; color: white; font-size: 12px; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
    .faq { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 20px; margin-bottom: 10px; }
    .faq summary { font-weight: 600; cursor: pointer; font-size: 14px; }
    .faq p { margin-top: 10px; font-size: 14px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="banner">Preview — your changes are not live until you tap Deploy</div>
  <div class="hero" style="background-image: url('${escapeHtml(heroImgUrl)}')"></div>
  <section class="hero-cta">
    <div class="badge">${escapeHtml(heroCta?.data.badge ?? "")}</div>
    <h1>${heading}</h1>
    <p class="subtitle">${escapeHtml(heroCta?.data.subtitle ?? "")}</p>
    <a class="btn" href="#">${escapeHtml(heroCta?.data.buttonLabel ?? "Reserve")}</a>
  </section>
  <section style="background: #f8fafc;">
    <div class="section-head">
      <p class="eyebrow">${escapeHtml(benefitsHeader?.data.eyebrow ?? "")}</p>
      <h2>${escapeHtml(benefitsHeader?.data.title ?? "")}</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin-top:8px;">${escapeHtml(benefitsHeader?.data.subtitle ?? "")}</p>
    </div>
    <div class="grid cols-2">${benefitCardsHtml}</div>
  </section>
  <section class="dark">
    <div class="section-head">
      <p class="eyebrow" style="color:#7dd3fc;">${escapeHtml(lifestyleHeader?.data.eyebrow ?? "")}</p>
      <h2>${escapeHtml(lifestyleHeader?.data.title ?? "")}</h2>
      <p>${escapeHtml(lifestyleHeader?.data.subtitle ?? "")}</p>
    </div>
    <div class="grid cols-4">${lifestyleHtml}</div>
  </section>
  <section>
    <div class="section-head">
      <p class="eyebrow">${escapeHtml(faqHeader?.data.eyebrow ?? "")}</p>
      <h2>${escapeHtml(faqHeader?.data.title ?? "")}</h2>
    </div>
    <div style="max-width:640px;margin:0 auto;">${faqHtml}</div>
  </section>
</body>
</html>`;
}
