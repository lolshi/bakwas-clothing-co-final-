
# Technical Documentation for BAKWAS Platform (tech2.md)

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Page-by-Page Functionality](#page-by-page-functionality)
3. [Admin Dashboard](#admin-dashboard)
4. [Supabase Integration & Logic](#supabase-integration--logic)
5. [Event & Real-Time Features](#event--real-time-features)
6. [Error Handling & Logging](#error-handling--logging)
7. [Performance & Security](#performance--security)
8. [Deployment & Environment](#deployment--environment)
9. [Additional Deliverables](#additional-deliverables)

   * 9.1 [API Specification (OpenAPI / Swagger)](#api-specification-openapi--swagger)
   * 9.2 [Data & Sequence Diagrams](#data--sequence-diagrams)
   * 9.3 [CI/CD & Infrastructure as Code](#cicd--infrastructure-as-code)
   * 9.4 [Automated Testing Strategy](#automated-testing-strategy)
   * 9.5 [Monitoring & Error-Tracking](#monitoring--error-tracking)
   * 9.6 [Security & Compliance](#security--compliance)
   * 9.7 [Onboarding & Style Guides](#onboarding--style-guides)
   * 9.8 [Developer "Get-Started" Section](#developer-get-started-section)
   * 9.9 [Localization & Accessibility](#localization--accessibility)
   * 9.10 [Future Roadmap & TBDs](#future-roadmap--tbds)

---

## 1. Architecture Overview

* **Frontend**: React (Next.js) with Tailwind CSS, SSR for SEO.
* **Backend / Data Layer**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
* **Hosting & CI/CD**: Vercel for frontend, GitHub Actions workflows for build/test/deploy, Terraform for infra.
* **Folder Structure**:

  * `/pages` (Next.js routes)
  * `/components` (UI, layout)
  * `/lib/supabase` (client, helpers)
  * `/styles` (global CSS/Tailwind overrides)
  * `/functions` (Supabase Edge Functions)

## 2. Page-by-Page Functionality

### 2.1 Home Page (`/`)

* **Hero Banner**: static content, high z-index, no background override.
* **Why Choose Bakwas**: static JSON config, rendered as cards (see component `WhySection`).
* **Featured Products**: SSR fetch from `products` table with `isFeatured=true`.
* **Newsletter Signup**: calls `subscriptions` insert via Supabase client, triggers Edge Function for welcome email.

### 2.2 Products Listing (`/products`)

* **Data Fetch**: `getServerSideProps` → `supabase.from('products').select('*')` + filters.
* **UI**: grid with pagination; infinite scroll via Intersection Observer + client-side fetch.
* **Filtering**: on change, call `supabase.rpc('filter_products', { category, tags })`.

### 2.3 Product Detail (`/products/[id]`)

* **Data Fetch**: `getStaticPaths` + `getStaticProps` for SEO.
* **Variants & Images**: join `variants` and `images` tables.
* **Add to Cart**: writes to `cart` context; if user authenticated, upsert to `carts` table via `supabase.from('carts').upsert(...)`.
* **Related Products**: Supabase view `related_products(product_id)`.

### 2.4 Cart Page (`/cart`)

* **Data Source**: localStorage or `carts` table for logged-in users.
* **Ops**: update/remove items via `supabase.from('carts').update/delete`.
* **Calculations**: subtotal, tax (5%), shipping rules in client helper `calculateTotals()`.

### 2.5 Checkout Page (`/checkout`)

* **Auth Guard**: Next.js middleware checks `supabase.auth.getSession()`.
* **Form**: collects address, saves to `addresses` table.
* **Payment**: stubbed Stripe integration; uses serverless function `/api/create-payment-intent`.
* **Order Creation**: in one transaction: insert into `orders`, `order_items`, clear `carts`.

### 2.6 Profile Page (`/profile`)

* **Auth Guard**.
* **Profile Data**: selects from `profiles` table joined to `auth.users`.
* **Order History**: `supabase.from('orders').select('*').eq('user_id', session.user.id)`.
* **Update**: `supabase.from('profiles').update({...})`.

## 3. Admin Dashboard

* **Route**: `/admin/*`, Next.js custom server middleware enforces `role='admin'` in JWT.
* **Features**:

  * Users management (`/admin/users`): list, edit, deactivate via RLS-protected selects/updates.
  * Products management (`/admin/products`): full CRUD, image upload to Supabase Storage in bucket `product-assets`.
  * Orders management (`/admin/orders`): view, status update, shipment email trigger via Edge Function.
  * Analytics (`/admin/analytics`): real-time charts via Supabase subscriptions; queries on `orders` and `order_items`.

## 4. Supabase Integration & Logic

### 4.1 Database Schema

* **Tables**: `products`, `variants`, `images`, `users` (Auth), `profiles`, `carts`, `orders`, `order_items`, `subscriptions`, `addresses`.
* **Keys**: PKs on `id`, FKs linking `order_items.order_id → orders.id`, etc.

### 4.2 Authentication Flow

1. **Signup**: Supabase Auth signup → webhook triggers `create_profile` Edge Function → inserts into `profiles`.
2. **Login**: stores JWT in cookie; Next.js API routes use `supabase.auth.getSession()`.
3. **Session**: auto-refresh via Supabase client; stored in browser memory/cookie.

### 4.3 Row-Level Security (RLS)

* **Policies**:

  * `profiles`: only owner (`auth.uid()`) and admins can SELECT/UPDATE.
  * `orders`: only owner or admin.
  * `carts`: only owner.
* **Examples**:

  ```sql
  CREATE POLICY "Users own profiles" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
  ```

### 4.4 Edge Functions & RPCs

* **Edge Functions**: `send_welcome_email`, `on_order_insert` (HTTP trigger).
* **RPC**: `filter_products(category text, tags text[])`.

### 4.5 Storage & File Logic

* **Buckets**: `product-assets`, `user-avatars`.
* **Access**: public read; signed URL for private files (e.g. invoices) via `supabase.storage.createSignedUrl()`.

## 5. Event & Real-Time Features

* **Realtime**: subscriptions on `carts` and `orders` tables in admin UI.
* **Webhooks**: on order insert, call external shipping API via Edge Function.

## 6. Error Handling & Logging

* **Client**: catch Supabase errors, show toasts via `react-hot-toast`.
* **Server**: Edge Functions log to `logs` table and Sentry.

## 7. Performance & Security

* **Optimizations**:

  * Image compression & responsive `srcset`.
  * Caching: SSR + stale-while-revalidate via Next.js.
  * Lazy-load offscreen images and components.
* **Security**:

  * CSP headers via `next.config.js`.
  * Rate limiting via middleware.
  * CSRF protection on form submissions.

## 8. Deployment & Environment

* **Env Vars**: listed in `.env.example` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`).
* **CI/CD**: GitHub Actions pipeline for lint/test/build → Vercel deploy.
* **Terraform**: scripts to provision Supabase project and buckets.

## 9. Additional Deliverables

### 9.1 API Specification (OpenAPI / Swagger)

* Auto-generate `openapi.yaml` from Next.js API routes using `next-openapi`.
* Serve via `/api/docs` with Swagger UI.

### 9.2 Data & Sequence Diagrams

* **ER Diagram**: use Mermaid syntax in markdown (`tech.md` supports Mermaid).
* **Sequence Diagrams**: e.g.

  ```mermaid
  sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase
    U->>F: Click "Checkout"
    F->>S: supabase.from('orders').insert(...)
    S-->>F: Confirmation
    F->>U: Show success
  ```

### 9.3 CI/CD & Infrastructure as Code

* Include `.github/workflows/ci.yml` snippet.
* Terraform main.tf for Supabase resources.

### 9.4 Automated Testing Strategy

* **Frontend**: Jest + React Testing Library examples for components.
* **Integration**: play with Supabase test DB via `@supabase/supabase-js` in tests.
* **E2E**: Cypress config and sample test for login + checkout.

### 9.5 Monitoring & Error-Tracking

* Sentry init in `_app.js`.
* Logflare integration in Edge Functions via HTTP.
* Dashboard links & alerts config.

### 9.6 Security & Compliance

* CSP, CORS, rate-limiting rules in `next.config.js`.
* 2FA flow stub linked to Supabase MFA (future).
* OWASP top 10 checklist with mitigation notes.

### 9.7 Onboarding & Style Guides

* ESLint + Prettier config (`.eslintrc.js`, `.prettierrc`).
* Git Flow guide in markdown.
* Code of Conduct file reference.

### 9.8 Developer "Get-Started" Section

1. `git clone ...`
2. `cp .env.example .env.local`
3. `npm install`
4. `npm run dev`
5. `npm run test`

### 9.9 Localization & Accessibility

* i18n setup: `next-i18next` config.
* ARIA roles, color-contrast thresholds, keyboard nav doc.

### 9.10 Future Roadmap & TBDs

* Loyalty program integration.
* Push notifications (Web Push).
* PWA offline support.
* Open questions: Shopify sync webhook design.

---

*End of tech2.md*
