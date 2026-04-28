# Vercel Deployment Guide - Breezy Coastal Rentals

## Quick Start

This project is configured for Vercel deployment. Follow these steps:

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Create Vercel Project

1. Go to https://vercel.com
2. Click "New Project"
3. Select "Import Git Repository"
4. Search for `breezy-coastal-rentals` (from `tiffani7577`)
5. Click "Import"

### 3. Add Environment Variables

In Vercel → Settings → Environment Variables, add these:

**Required:**
- `DATABASE_URL` - Your TiDB/MySQL connection string
- `STRIPE_SECRET_KEY` - From Stripe Dashboard (Live)
- `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks
- `VITE_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard (Live)
- `RESEND_API_KEY` - From Resend Dashboard
- `JWT_SECRET` - Generate: `openssl rand -base64 32`

**Optional (if using Manus services):**
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `OWNER_NAME`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`

### 4. Deploy

Click "Deploy" in Vercel. The build will:
1. Install dependencies (`pnpm install`)
2. Migrate database schema (`pnpm db:push`)
3. Build the app (`pnpm build`)

### 5. Configure Domain

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records at your registrar

### 6. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://breezycoastalrentals.com/api/stripe/webhook`
3. Events: `charge.succeeded`, `charge.failed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret and add to Vercel as `STRIPE_WEBHOOK_SECRET`

## Automatic Redeployment

Every push to `main` branch automatically triggers a Vercel redeploy (~2-3 minutes).

```bash
git add .
git commit -m "Update booking flow"
git push origin main
# Vercel automatically deploys
```

## Build Configuration

Build settings are in `vercel.json`:
- **Build Command:** `pnpm install && pnpm db:push && pnpm build`
- **Output Directory:** `client/dist`
- **Node Version:** 22.x

## Troubleshooting

### Build fails: "DATABASE_URL not found"
→ Add `DATABASE_URL` to Vercel environment variables

### Build fails: "STRIPE_SECRET_KEY not found"
→ Add all Stripe keys from Step 3

### Site loads but shows 404
→ Check Vercel build logs for errors

### Payments not working
→ Verify Stripe keys are correct and webhook is configured

### Emails not sending
→ Verify `RESEND_API_KEY` is correct

## Key Files

- `vercel.json` - Vercel build configuration
- `package.json` - Dependencies and build scripts
- `server/_core/env.ts` - Environment variable definitions
- `drizzle/schema.ts` - Database schema

## Support

For issues, check:
1. Vercel build logs → Project → Deployments
2. Stripe dashboard → Developers → Webhooks
3. Resend dashboard → Emails
4. Database connection status
