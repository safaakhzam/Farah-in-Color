# Farah in Color: online gallery & shop

A gallery-style web shop where Farah sells her original canvas paintings, with cash on delivery across Lebanon.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (database, image storage, admin login) · Resend (emails) · hosted on Vercel.

> **Try it right away:** with no keys set, the site runs in **demo mode** with 12 sample paintings and sample orders. Nothing is saved. Follow the steps below to go live.

---

## Contents

1. [What's included](#1-whats-included)
2. [Run it on your computer](#2-run-it-on-your-computer)
3. [Set up Supabase (database, images, login)](#3-set-up-supabase)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Connect your own domain](#5-connect-your-own-domain)
6. [Email notifications (Resend)](#6-email-notifications-resend)
7. [WhatsApp](#7-whatsapp)
8. [Instagram feed](#8-instagram-feed)
9. [Customising the look](#9-customising-the-look)
10. [Adding online payment later](#10-adding-online-payment-later)
11. [Project structure](#11-project-structure)
12. **[Guide for Farah: adding paintings & managing orders](./ADMIN-GUIDE.md)**

---

## 1. What's included

| Page | What it does |
|---|---|
| **Home** `/` | Hero with a featured painting, artist intro, featured collection, "how ordering works", Instagram feed and follow button |
| **Shop** `/shop` | Gallery grid with filters (availability, size, price, color, collection, style) and sorting |
| **Painting** `/paintings/[slug]` | Photo gallery with zoom, **View in a room** mockup drawn to scale, details, price, Sold/Reserved badge, **Order (Cash on Delivery)**, **Inquire about this piece**, WhatsApp button, related works |
| **Cart** `/cart` | Add several paintings, review them (sold ones are flagged) and check out in one cash-on-delivery order with one delivery fee |
| **Order now** `/order/[slug]` | One-painting checkout: name, phone, email (optional), region, city, address, notes. No payment step. |
| **Confirmation** | Tells the customer Farah will contact them and payment is cash on delivery, plus a WhatsApp button |
| **About** `/about` | Story, process and photo |
| **Commissions** `/commissions` | Custom request form: size, colors, budget (USD), idea, up to 5 reference images |
| **Contact** `/contact` | Form, Instagram and WhatsApp buttons |
| **Admin** `/admin` | Password-protected dashboard: paintings (add, edit, delete, upload photos, status), orders, commissions, messages, settings |

**Business rules built in**

- USD only, English only, delivery in Lebanon only, cash on delivery.
- **An original can never be sold twice.** Ordering (one painting or a whole cart) runs a database function that locks every painting, checks they are all still *Available*, creates the order and marks them *Reserved*, all in one step. If one was taken meanwhile, nothing is ordered and the customer is told which one.
- Order status keeps the painting in sync: **Delivered → Sold**, **Cancelled → Available again**.
- Delivery fee (default **$5** flat) and an optional free-delivery threshold are editable in **Admin → Settings**.
- Size filter bands come from each painting's dimensions: Small (< 40 cm longest side), Medium (40–80 cm), Large (> 80 cm). Paintings without dimensions show "Size to be announced".

**Quality**

- Mobile-first, responsive; images optimised automatically (AVIF/WebP) and lazy-loaded.
- SEO: page titles and descriptions, Open Graph previews (the painting itself shows when shared on WhatsApp/Instagram), `sitemap.xml`, `robots.txt`, and Google product data (price + availability).
- Accessible: alt text for every image (editable per photo), keyboard-friendly, AA contrast, skip link.
- Spam protection on all forms (hidden honeypot field) and validation on the server.

---

## 2. Run it on your computer

Requires **Node.js 20.9 or newer** (22 recommended).

```bash
npm install
cp .env.example .env.local   # leave it empty for demo mode
npm run dev
```

Open http://localhost:3000. The dashboard is at http://localhost:3000/admin (open without a password in demo mode).

---

## 3. Set up Supabase

Supabase stores the paintings, orders and photos, and handles the admin login. The free plan is enough.

1. Create an account at [supabase.com](https://supabase.com) → **New project**. Choose a region close to Lebanon (e.g. *Frankfurt*). Save the database password somewhere safe.
2. Go to **SQL Editor → New query**, paste the whole content of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**. (It is safe to run again after updates; re-run it whenever this file changes.) This creates the tables, the "never sell twice" function, security rules and the two photo buckets.
3. *(Optional)* To start with the sample paintings, run [`supabase/seed.sql`](./supabase/seed.sql) the same way. Farah can delete them later from the dashboard.
4. **Create Farah's login:** **Authentication → Users → Add user → Create new user**. Enter her email and a password, and tick **Auto Confirm User**.
5. **Turn off public sign-ups** (important): **Authentication → Sign In / Providers → Email** (or *Authentication → Settings*) → disable **Allow new users to sign up**. Only accounts you create can log in.
6. **Login links:** **Authentication → URL Configuration** → set **Site URL** to your website address (e.g. `https://farahincolor.com`) and add `https://farahincolor.com/auth/callback` under **Redirect URLs**. (This makes "Forgot your password?" work.)
7. Copy the keys from **Project Settings → API** (or **API Keys**):

| Supabase | Environment variable |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` / secret key (**keep private**) | `SUPABASE_SERVICE_ROLE_KEY` |

Also set `ADMIN_EMAILS` to Farah's email (comma-separate several). Only these accounts can open the dashboard.

---

## 4. Deploy to Vercel

1. Put this folder in a GitHub repository (GitHub → **New repository**, then upload or `git push`).
2. At [vercel.com](https://vercel.com) → **Add New → Project** → import the repository. Framework: **Next.js** (detected automatically).
3. Under **Environment Variables**, add every variable from [`.env.example`](./.env.example) with your values. Set `NEXT_PUBLIC_SITE_URL` to the final address (e.g. `https://farahincolor.com`, or the `*.vercel.app` address until you have a domain).
4. Click **Deploy**. Every future push to GitHub redeploys automatically.

After changing environment variables in Vercel, redeploy (**Deployments → ⋯ → Redeploy**) so they take effect.

---

## 5. Connect your own domain

1. Buy a domain (e.g. `farahincolor.com`) from any registrar (Namecheap, GoDaddy, Cloudflare…).
2. In Vercel: **Project → Settings → Domains → Add** → type your domain. Add both `farahincolor.com` and `www.farahincolor.com`, and choose which one redirects to the other.
3. Vercel shows the DNS records to add. At your registrar, open the DNS settings and add them (typically an **A** record for `@` and a **CNAME** for `www` pointing to Vercel). It can take from a few minutes to a few hours.
4. HTTPS is set up automatically.
5. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the new domain and redeploy, and update **Site URL / Redirect URLs** in Supabase (step 3.6).

---

## 6. Email notifications (Resend)

The site sends:

- **To Farah:** every new order (with a one-tap "WhatsApp the customer" button), commission request and message.
- **To the customer:** order confirmation (if they gave an email), and an automatic "we received your request/message" reply.

Setup:

1. Create a free account at [resend.com](https://resend.com).
2. **Domains → Add domain** → enter your domain and add the DNS records Resend shows at your registrar (same place as step 5). Wait until it says **Verified**.
3. **API Keys → Create API key** → copy it into `RESEND_API_KEY`.
4. Set `EMAIL_FROM`, e.g. `Farah in Color <orders@farahincolor.com>` (must use the verified domain).
5. Set `ARTIST_NOTIFICATION_EMAIL` to the inbox that should receive orders. Farah can also change it in **Admin → Settings**.

Without a domain you can test with `onboarding@resend.dev` as the sender, but Resend then only delivers to your own Resend account email. Without `RESEND_API_KEY`, emails are just written to the server log, so nothing breaks.

---

## 7. WhatsApp

Set Farah's number in **Admin → Settings** (or `NEXT_PUBLIC_WHATSAPP_NUMBER`), in international format with `961`, e.g. `9613123456`. This turns on:

- the floating WhatsApp button on every page,
- "Ask on WhatsApp" on each painting (pre-filled with the painting's name and link),
- WhatsApp buttons on Contact and the order confirmation page (pre-filled with the order number),
- the "WhatsApp the customer" button in order emails and in the dashboard.

WhatsApp buttons are hidden until a number is set.

---

## 8. Instagram feed

The home page shows the 6 latest Instagram posts. Until it is connected, it shows Farah's paintings instead (each tile links to her profile), so the page never looks broken.

Instagram only allows this for **Business or Creator accounts**.

1. In the Instagram app: **Settings → Account type and tools → Switch to professional account** (Creator or Business). It's free.
2. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create App** → choose the use case **"Manage messaging & content on Instagram"** (Instagram API with Instagram Login).
3. In the app: **Instagram → API setup with Instagram login** → **Add account** → log in as `@farahincolor`, then **Generate token**. This is a long-lived token (valid 60 days).
4. Put it in `INSTAGRAM_ACCESS_TOKEN` and redeploy.
5. Set `CRON_SECRET` to any long random text. Vercel then calls `/api/instagram/refresh` on the 1st of every month (configured in [`vercel.json`](./vercel.json)) to renew the token automatically and store it in the database, so it never expires.

**No-code alternative:** services like [Behold.so](https://behold.so) or [LightWidget](https://lightwidget.com) give you an embeddable feed without a developer app; you'd replace `<InstagramFeed>` on the home page with their snippet.

The follow buttons in the header, footer, home page and About page work without any setup.

---

## 9. Customising the look

| What | Where |
|---|---|
| **Logo** | Put the file in `/public` (e.g. `/public/logo.svg`) and set `logo: "/logo.svg"` in [`src/lib/config.ts`](./src/lib/config.ts). The text wordmark is replaced everywhere. Replace `/public/icon.svg` for the browser tab icon. |
| Brand colors | `@theme` block at the top of [`src/app/globals.css`](./src/app/globals.css) |
| Fonts | [`src/app/layout.tsx`](./src/app/layout.tsx) (Cormorant Garamond + DM Sans from Google Fonts) |
| Artist photo | Replace `/public/images/farah.jpg` (portrait 3:4, ~1200 × 1600 px) |
| Farah's story (home + About) | [`src/content/artist.ts`](./src/content/artist.ts) |
| Home intro text | [`src/app/(site)/page.tsx`](./src/app/(site)/page.tsx) |
| Default share image | `/public/og-default.jpg` (1200 × 630) |
| Size bands, default delivery fee, Instagram handle | [`src/lib/config.ts`](./src/lib/config.ts) |

The artist photo is still a placeholder.

---

## 10. Adding online payment later

Payment is isolated in [`src/lib/payments/index.ts`](./src/lib/payments/index.ts). Orders already store `payment_method` and `payment_status`. To add a provider (Stripe, Whish, OMT Pay…):

1. Add a provider object with `enabled: true` and a `startCheckout()` that returns the provider's payment URL.
2. Show the method choice in `OrderForm`, pass it to `placeOrder` ([`src/actions/orders.ts`](./src/actions/orders.ts)), and redirect to the URL returned by `startCheckout()` instead of the confirmation page.
3. Add a webhook route that sets `payment_status = 'paid'`.

No database changes are needed.

---

## 11. Project structure

```
src/
  app/
    (site)/          Public pages: home, shop, paintings/[slug], order, about, commissions, contact
    admin/           Login + dashboard (paintings, orders, commissions, messages, settings)
    api/instagram/   Monthly Instagram token refresh (Vercel Cron)
    auth/callback/   Login-link landing
    sitemap.ts, robots.ts
  actions/           Server actions: orders, forms (commission/contact), admin
  components/        UI (cards, gallery + zoom, room view, filters, forms, admin)
  lib/
    config.ts        Site settings (logo, Instagram, delivery defaults, size bands)
    data/            Database reads (falls back to sample data in demo mode)
    email.ts         Resend emails
    instagram.ts     Instagram feed
    payments/        Payment methods (cash on delivery today)
    sample-data.ts   Placeholder paintings
  proxy.ts           Keeps the admin session fresh
supabase/
  schema.sql         Tables, place_order function, security rules, storage buckets
  seed.sql           Optional sample paintings
scripts/             Generators for sample images and seed.sql
```

Useful commands: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run samples` (regenerate placeholder images).

### Security notes

- Visitors can only **read** paintings (Row Level Security). Orders, commissions, messages and settings are only touched by the server using the secret service key, after checking the admin login.
- Commission reference images are stored in a **private** bucket; the dashboard shows them through temporary links.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in code or in a variable starting with `NEXT_PUBLIC_`.
