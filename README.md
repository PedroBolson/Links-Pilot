# 🔗 LinksPilot

> **Smart URL shortener** — Create, manage and track short links with QR codes, expiration control and click analytics.

[![Live](https://img.shields.io/badge/live-linkspilot.web.app-7c3aed?style=flat-square)](https://linkspilot.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development](#-development)
- [Firebase Setup](#-firebase-setup)
  - [Authentication](#authentication)
  - [Firestore Collections](#firestore-collections)
  - [Security Rules](#security-rules)
  - [Composite Indexes](#composite-indexes)
- [Cloud Functions](#-cloud-functions)
- [Deployment](#-deployment)
- [Internationalization](#-internationalization)
- [Security Model](#-security-model)
- [Roadmap](#-roadmap)

---

## 🧭 Overview

LinksPilot is a full-stack URL shortener built as a personal project by **Pedro Bolson**. It runs entirely on the Firebase ecosystem — Firestore as database, Cloud Functions (2nd Gen / Cloud Run) as backend, and Firebase Hosting as CDN.

The application enforces a **server-side security model**: all writes to Firestore go exclusively through Cloud Functions using the Admin SDK, bypassing client-side security rules entirely. The React frontend communicates with the backend only via HTTPS callable functions, making the surface area for client-side attacks minimal.

Key design goals:
- **Zero trust on the client** — Firestore rules deny all client writes; every mutation runs server-side
- **Scalable by default** — Cloud Run auto-scales, Firestore TTL auto-expires old data
- **i18n from day one** — EN / PT / ES with browser auto-detection
- **Type safety end-to-end** — Zod schemas at both frontend and backend validate all data at both layers

---

## 🌐 Live Demo

**Production:** [https://linkspilot.web.app](https://linkspilot.web.app)

> Sign in with a Google account to create links. Free plan allows **10 active links** at a time — delete any link to free up a slot.

---

## ✨ Features

### 🔗 Link Management
- Create short links with **auto-generated 7-character slugs** (nanoid) or **custom slugs** (4–20 chars, `[a-zA-Z0-9_-]`)
- Optional link title for easy identification
- **Expiration presets**: 1 day, 7 days, 30 days, 90 days
- Visual expiration highlight with countdown display
- Reserved slug protection (`auth`, `dashboard`, `r`, `admin`, etc.)
- Delete links with a confirmation dialog

### 📊 Analytics
- Per-link **click counter** updated in real-time
- Click events stored with timestamp, user-agent and HTTP referrer
- Dashboard stats: total links, active links, total clicks

### 📱 QR Codes
- Instant QR code generation for every link
- **Download as PNG** (canvas-based, always works)
- **Native share** via Web Share API (files) — opens the system share sheet on mobile; falls back to download on desktop

### 🔐 Authentication
- **Google Sign-In** via Firebase Authentication (OAuth popup)
- Automatic user profile creation on first login via `ensureProfile` Cloud Function
- Protected routes redirect unauthenticated users to the landing page

### 🌍 Internationalization
- **3 languages**: English 🇺🇸, Portuguese 🇧🇷, Spanish 🇪🇸
- Auto-detects browser language on first visit
- Persists language preference in `localStorage`

### 🎨 Theming
- Light / Dark / System modes
- Persists via `localStorage`
- Theme-aware color system using CSS custom properties mapped to Tailwind v4 `@theme inline`

### 🛡️ Plan Limits

| Plan | Links |
|------|-------|
| Free | 10 active links |
| Pro  | Unlimited |

Enforced server-side in the `createLink` Cloud Function — the client cannot bypass this.

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.2 |
| Language | TypeScript | ~6.0 |
| Build Tool | Vite | 8.0 |
| Styling | Tailwind CSS v4 | 4.2 |
| Routing | React Router DOM | 7.14 |
| Data Fetching | TanStack React Query | 5.99 |
| Forms | React Hook Form | 7.72 |
| Validation | Zod | 4.3 |
| UI Components | shadcn/ui + Base UI | — |
| Icons | Lucide React | 1.8 |
| Toasts | Sonner | 2.0 |
| QR Codes | qrcode.react | 4.2 |
| i18n | i18next + react-i18next | 26 / 17 |
| Date Utilities | date-fns | 4.1 |
| ID Generation | nanoid | 5.1 |
| Theme | next-themes | 0.4 |
| Font | Geist Variable | — |

### Backend (Cloud Functions)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22 |
| Language | TypeScript | 5.7 |
| Functions | Firebase Functions v2 | 7.0 |
| Admin SDK | firebase-admin | 13.6 |
| Validation | Zod | 4.3 |
| ID Generation | nanoid | 5.1 |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Firebase Authentication | Google OAuth 2.0 |
| Cloud Firestore | NoSQL document database (southamerica-east1) |
| Cloud Functions 2nd Gen | Serverless backend running on Cloud Run |
| Firebase Hosting | Static CDN + SPA routing + rewrites |
| Google Analytics | Event and session tracking |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting (CDN)                   │
│                  linkspilot.web.app / dist                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ serves
                ┌───────────▼───────────┐
                │   React SPA (Vite)    │
                │  - React Router       │
                │  - React Query        │
                │  - Firebase SDK       │
                └─────────┬─────────────┘
                          │ httpsCallableFromURL
                          │ (direct Cloud Run URL)
          ┌───────────────┼───────────────────────┐
          │               │                       │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌─────────────▼──────┐
   │ createLink  │ │ deleteLink  │ │  ensureProfile     │
   │  (onCall)   │ │  (onCall)   │ │   (onCall)         │
   └──────┬──────┘ └──────┬──────┘ └──────────┬─────────┘
          │               │                   │
          └───────────────┼───────────────────┘
                          │ Admin SDK (bypasses rules)
                ┌─────────▼─────────┐
                │  Cloud Firestore  │
                │  - links          │
                │  - slugs          │
                │  - users          │
                │  - clicks         │
                └───────────────────┘

Separate HTTP trigger (no auth required):
  /r/:slug  ──►  redirect (onRequest)  ──►  Firestore lookup  ──►  302 redirect
```

### Data Flow: Creating a Short Link

```
1. User fills form → React Hook Form validates (Zod, client-side)
2. useCreateLink() calls httpsCallableFromURL('createLink')
3. Firebase SDK attaches Bearer token (Firebase Auth JWT)
4. Cloud Run receives request → onCall handler runs
5. request.auth validated → unauthenticated throws 401
6. request.data validated by Zod → failure throws 400 with field message
7. Firestore transaction (atomic):
   a. Check slug uniqueness in /slugs/{slug}
   b. Write /links/{linkId}
   c. Write /slugs/{slug}
   d. Increment /users/{uid}.linkCount
8. Returns { linkId, slug, shortUrl }
9. React Query invalidates ['links'] → dashboard re-fetches automatically
```

### Redirect Flow

```
User visits https://linkspilot.web.app/r/abc123
  │
  ├── Firebase Hosting matches /r/** rewrite rule
  │
  └── redirect Cloud Function (onRequest):
        ├── Read /slugs/abc123  (O(1) document ID lookup)
        ├── Read /links/{linkId}
        ├── Not found  → 302 /expired
        ├── Expired    → 302 /expired
        └── Active     → write /clicks/{id}
                         increment links.clickCount
                         return 302 → originalUrl
```

---

## 📁 Project Structure

```
linkspilot/
├── src/                              # React frontend
│   ├── app/
│   │   ├── App.tsx                  # Root — all providers stacked
│   │   ├── Router.tsx               # Route definitions + auth guards
│   │   └── providers/
│   │       ├── AuthProvider.tsx     # Firebase Auth state context
│   │       ├── QueryProvider.tsx    # TanStack Query client provider
│   │       └── ThemeProvider.tsx    # next-themes wrapper
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitive components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   └── tooltip.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx        # Authenticated page shell
│   │   │   └── Header.tsx           # Top navigation bar
│   │   └── shared/
│   │       └── EmptyState.tsx       # Empty dashboard placeholder
│   │
│   ├── features/                    # Feature-sliced modules
│   │   ├── auth/
│   │   │   └── hooks/
│   │   │       └── useAuthActions.ts  # useSignInWithGoogle, useSignOut
│   │   ├── links/
│   │   │   ├── components/
│   │   │   │   ├── CreateLinkForm.tsx  # Form with preset expiration
│   │   │   │   └── LinkCard.tsx        # Card + QR modal + share
│   │   │   ├── hooks/
│   │   │   │   ├── useCreateLink.ts    # Mutation: create link
│   │   │   │   ├── useDeleteLink.ts    # Mutation: delete link
│   │   │   │   └── useLinks.ts         # Query: list user's links
│   │   │   └── schemas/
│   │   │       └── link.schema.ts      # Zod schema (frontend)
│   │   └── dashboard/
│   │       └── components/
│   │           └── StatsCard.tsx       # Metric display card
│   │
│   ├── pages/
│   │   ├── HomePage.tsx             # Landing page with animated demo
│   │   ├── AuthPage.tsx             # Redirect to home (legacy route)
│   │   ├── DashboardPage.tsx        # Main authenticated view
│   │   ├── RedirectPage.tsx         # Client-side redirect fallback
│   │   └── ExpiredLinkPage.tsx      # Expired / not found fallback
│   │
│   ├── services/
│   │   ├── auth.service.ts          # signInWithGoogle, signOut helpers
│   │   ├── links.service.ts         # Firestore read queries
│   │   └── users.service.ts         # getUserProfile (read-only)
│   │
│   ├── types/
│   │   ├── link.types.ts            # Link, CreateLinkInput, CreateLinkResult
│   │   ├── user.types.ts            # UserProfile
│   │   └── api.types.ts             # Generic API response types
│   │
│   ├── lib/
│   │   ├── firebase.ts              # SDK init + cloudRunUrl() helper
│   │   ├── query-client.ts          # QueryClient singleton
│   │   └── utils.ts                 # cn(), timeFromNow(), isExpired()
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth state consumer hook
│   │   └── useDebounce.ts           # Generic debounce hook
│   │
│   ├── i18n/
│   │   ├── index.ts                 # i18next init + language detector
│   │   └── locales/
│   │       ├── en.ts                # English translations
│   │       ├── pt.ts                # Portuguese translations
│   │       └── es.ts                # Spanish translations
│   │
│   ├── index.css                    # Tailwind v4 directives + CSS vars
│   └── main.tsx                     # Vite entry point
│
├── functions/                       # Firebase Cloud Functions (Node 22)
│   └── src/
│       ├── index.ts                 # Re-exports all functions
│       ├── auth/
│       │   └── ensure-profile.ts    # onCall: create user doc on first login
│       ├── links/
│       │   ├── create-link.ts       # onCall: validate + create short link
│       │   ├── delete-link.ts       # onCall: verify ownership + delete
│       │   ├── redirect-link.ts     # onRequest: slug lookup + 302 redirect
│       │   └── cleanup-expired.ts   # onSchedule: mark expired links
│       ├── lib/
│       │   ├── firestore.ts         # Admin SDK db singleton
│       │   ├── slug.ts              # generateSlug() with nanoid
│       │   ├── validators.ts        # Zod schemas (backend)
│       │   ├── audit.ts             # Structured audit log emitter (Cloud Logging)
│       │   ├── rate-limiter.ts      # Firestore-based sliding window rate limiter
│       │   └── safe-browsing.ts     # Google Safe Browsing API v4 client
│       └── types/
│           └── link.types.ts        # Types + PLAN_LIMITS + RESERVED_SLUGS
│
├── public/
│   └── favicon.svg                  # Chain link icon on purple gradient
│
├── index.html                       # HTML entry + meta + OG tags
├── firebase.json                    # Hosting, Functions, Firestore config
├── firestore.rules                  # Security rules (deny all client writes)
├── firestore.indexes.json           # Composite indexes + TTL field config
├── .firebaserc                      # Active Firebase project binding
├── vite.config.ts                   # Vite + Tailwind v4 plugin config
├── tsconfig.json                    # Root TypeScript config
├── tsconfig.app.json                # App-specific TypeScript config
└── components.json                  # shadcn/ui CLI configuration
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 22 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 | bundled with Node |
| Firebase CLI | latest | `npm i -g firebase-tools` |
| A Firebase project | — | [console.firebase.google.com](https://console.firebase.google.com) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/PedroBolson/linkspilot.git
cd linkspilot

# 2. Install frontend dependencies
npm install

# 3. Install functions dependencies
npm install --prefix functions
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Web SDK credentials
# Get from: Firebase Console → Project Settings → Your apps → Web app
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Base URL used to build the short link (your Hosting URL or custom domain)
VITE_SHORT_BASE_URL=https://your-project.web.app

# Cloud Run URL hash for direct callable function access (2nd Gen Functions)
# Format: {hash}-{region-code}.a.run.app
# Find it after first deploy: Firebase Console → Functions → any function URL
VITE_CLOUD_RUN_BASE=xxxxxxxxxx-xx.a.run.app
```

> **Why `VITE_CLOUD_RUN_BASE`?**
> Firebase Functions v2 are deployed on Cloud Run. The legacy `cloudfunctions.net` routing is not always provisioned for new projects. Using `httpsCallableFromURL` with the direct Cloud Run URL (`https://{function-name}-{hash}.a.run.app`) is the reliable alternative. The hash is project-specific and never changes after initial deployment.

---

## 💻 Development

```bash
# Start the Vite dev server with hot reload
npm run dev
# → http://localhost:5173

# Type-check the entire frontend project
npx tsc -b --noEmit

# Lint the frontend
npm run lint

# Build functions (TypeScript → lib/)
npm run build --prefix functions

# Watch functions in dev mode (recompiles on save)
npm run build:watch --prefix functions

# Start Firebase Emulator Suite (Firestore + Functions + Hosting)
firebase emulators:start

# Tail live function logs from production
firebase functions:log --follow
```

---

## 🔥 Firebase Setup

### Authentication

Enable **Google Sign-In** in the Firebase console:

```
Firebase Console → Authentication → Sign-in method → Google → Enable
```

Add your domains to the **Authorized domains** list:
- `localhost`
- `your-project.web.app`
- Your custom domain (if applicable)

### Firestore Collections

#### `links` — Short link documents

```typescript
interface Link {
  slug: string             // Short slug (e.g., "abc1234")
  originalUrl: string      // Full destination URL (http/https required)
  userId: string           // Firebase Auth UID of the owner
  title: string | null     // Optional human-readable label
  customSlug: boolean      // true if the user specified the slug manually
  createdAt: Timestamp     // Server timestamp at creation
  expiresAt: Timestamp     // When the link stops working
  status: 'active' | 'expired'
  clickCount: number       // Incremented atomically on each redirect
  ttl: Timestamp           // Mirror of expiresAt — Firestore TTL auto-delete
}
```

#### `slugs` — Reverse-lookup index

```typescript
// Document ID = the slug string itself → O(1) Firestore lookup
interface SlugIndex {
  linkId: string       // Points to /links/{linkId}
  userId: string       // Owner UID for ownership checks
  expiresAt: Timestamp
}
```

> **Design note:** Using document IDs for slug lookups avoids a full collection scan. Instead of `where('slug', '==', value)` on `links`, we do `doc('slugs', slug).get()` — a single document read regardless of collection size.

#### `users` — User profiles

```typescript
// Document ID = Firebase Auth UID
interface UserProfile {
  email: string
  plan: 'free' | 'pro'
  linkCount: number    // Maintained with FieldValue.increment (atomic, no race condition)
  createdAt: Timestamp
}
```

#### `clicks` — Click analytics

```typescript
interface ClickEvent {
  linkId: string
  userId: string        // Link owner UID (not the visitor)
  timestamp: Timestamp
  userAgent: string | null
  referer: string | null
}
```

#### `rate_limits` — Per-user rate limit windows

```typescript
// Document ID = "{action}_{uid}" (e.g., "createLink_abc123")
interface RateLimitWindow {
  count: number        // Requests within the current window
  windowStart: Timestamp
  ttl: Timestamp       // Auto-deleted by Firestore TTL after 2h
}
```

#### `click_dedup` — Click deduplication records

```typescript
// Document ID = "{linkId}_{ipHash}_{hourWindow}"
// Prevents the same IP from inflating click counts within a 1-hour window
interface ClickDedup {
  ttl: Timestamp       // Auto-deleted by Firestore TTL after 2h
}
```

### Security Rules

All write operations go through Cloud Functions using the **Admin SDK**, which bypasses Firestore security rules. This eliminates entire categories of client-side exploits (plan bypass, unauthorized deletes, data poisoning).

```js
// firestore.rules (simplified)

match /links/{linkId} {
  allow read:  if request.auth.uid == resource.data.userId;
  allow write: if false;  // Admin SDK only
}
match /slugs/{slug} {
  allow read:  if request.auth != null;
  allow write: if false;  // Admin SDK only
}
match /users/{userId} {
  allow read:  if request.auth.uid == userId;
  allow write: if false;  // Admin SDK only
}
match /clicks/{clickId} {
  allow read:  if request.auth.uid == resource.data.userId;
  allow write: if false;  // Admin SDK only
}
```

### Composite Indexes

Defined in `firestore.indexes.json` and deployed via `firebase deploy --only firestore:indexes`:

| Collection | Index Fields | Query Purpose |
|-----------|-------------|---------------|
| `links` | `userId ASC` + `createdAt DESC` | Dashboard link list |
| `links` | `userId ASC` + `status ASC` + `createdAt DESC` | Filtered list by status |
| `links` | `status ASC` + `expiresAt ASC` | Cleanup job batch query |
| `clicks` | `linkId ASC` + `timestamp DESC` | Per-link analytics |
| `clicks` | `userId ASC` + `timestamp DESC` | User-level analytics |

**TTL Policy** — The `ttl` field is configured for Firestore's native TTL auto-delete on three collections: `links`, `rate_limits`, and `click_dedup`. Deployed automatically via `firebase deploy --only firestore:indexes`.

---

## ⚡ Cloud Functions

All functions are deployed in the **`southamerica-east1`** region (São Paulo, Brazil) and run on Node.js 22.

### `ensureProfile` — HTTPS Callable

Called after every Google Sign-In. Creates the `users/{uid}` Firestore document if it doesn't exist. Idempotent — safe to call repeatedly.

```
Trigger:      onCall (HTTPS Callable)
Auth:         Required (unauthenticated → 401)
Input:        none
Output:       { created: boolean }
Side effects: Creates /users/{uid} with { email, plan: 'free', linkCount: 0 }
```

### `createLink` — HTTPS Callable

Core function. Validates input with Zod, checks plan limits, runs an atomic Firestore transaction.

```
Trigger:  onCall (HTTPS Callable)
Auth:     Required
Input:    { originalUrl, slug?, title?, expiresAt }

Error codes:
  unauthenticated    → not signed in
  invalid-argument   → Zod validation failed / URL flagged as unsafe by Safe Browsing
  not-found          → user profile document missing
  resource-exhausted → plan link limit or hourly rate limit reached
  already-exists     → custom slug is already taken

Output: { linkId, slug, shortUrl }

Security layers (in order):
  1. Auth check          — unauthenticated request rejected immediately
  2. Zod validation      — schema enforced server-side (url, slug, title, expiresAt)
  3. Rate limiting       — Firestore sliding window (free: 20/h, pro: 200/h)
  4. Plan limit check    — linkCount vs PLAN_LIMITS (free: 10, pro: unlimited)
  5. Safe Browsing check — Google Safe Browsing API v4 (MALWARE, SOCIAL_ENGINEERING,
                           UNWANTED_SOFTWARE, POTENTIALLY_HARMFUL_APPLICATION)
  6. Atomic transaction  — slug uniqueness + link write + linkCount increment
```

### `deleteLink` — HTTPS Callable

Verifies ownership before deletion. Cleans up both the link document and its slug index atomically.

```
Trigger:  onCall (HTTPS Callable)
Auth:     Required
Input:    { linkId: string }

Error codes:
  unauthenticated   → not signed in
  invalid-argument  → linkId missing or wrong type
  not-found         → link document doesn't exist
  permission-denied → link belongs to a different user

Output: { success: true }

Atomic transaction:
  1. Delete /links/{linkId}
  2. Delete /slugs/{slug}
  3. Decrement /users/{uid}.linkCount
```

### `redirect` — HTTP Request

Public endpoint. No authentication. Triggered by Firebase Hosting rewrite on `/r/**`. Records the click and returns a 302.

```
Trigger:  onRequest (HTTP GET)
Auth:     None (public)
Route:    /r/:slug  (via Firebase Hosting rewrite rule)

Security layers:
  1. IP rate limiting    — in-memory per Cloud Run instance (60 req/min per IP)
  2. Expiration check    — expired links redirect to /expired
  3. Click deduplication — SHA-256(ip + date) key prevents the same IP from
                           inflating clickCount more than once per hour

Flow:
  - Rate limit check (in-memory, per IP, 60/min)
  - Read /slugs/{slug}      (document ID lookup — O(1))
  - Read /links/{linkId}
  - Not found → 302 /expired
  - Expired   → 302 /expired
  - Duplicate click → 302 originalUrl (no Firestore write)
  - Unique click  → atomic transaction:
                      create /clicks/{id}
                      create /click_dedup/{key} (TTL 2h)
                      increment links/{linkId}.clickCount
                    return 302 → originalUrl
```

### `cleanupExpiredLinks` — Scheduled

Runs every 60 minutes to mark expired links as `status: 'expired'`. Firestore TTL handles actual document deletion; this function keeps the UI state consistent.

```
Trigger:      onSchedule (every 60 minutes)
Auth:         Service account (automatic)
Query:        links where status='active' AND expiresAt <= now()
Batch size:   Up to 400 documents per run
Side effects: Sets links.status = 'expired'
```

---

## 🚢 Deployment

### Deploy Everything

```bash
# Build frontend + deploy all Firebase services
npm run build
firebase deploy
```

This runs the full pipeline:
1. ESLint on `functions/` (predeploy hook)
2. TypeScript compile `functions/src/` → `functions/lib/`
3. Vite build `src/` → `dist/`
4. Upload `dist/` to Firebase Hosting
5. Upload and redeploy all 5 Cloud Functions
6. Apply Firestore security rules
7. Apply Firestore composite indexes

### Selective Deployment

```bash
# Frontend only (fastest — no function cold starts)
npm run build && firebase deploy --only hosting

# All functions (no frontend build needed)
firebase deploy --only functions

# Single function
firebase deploy --only functions:createLink

# Firestore rules only
firebase deploy --only firestore:rules

# Firestore indexes only
firebase deploy --only firestore:indexes
```

### Hosting Headers

Firebase Hosting applies the following HTTP headers automatically:

| Pattern | Header | Value |
|---------|--------|-------|
| `*.js, *.css, *.woff2` | `Cache-Control` | `public, max-age=31536000, immutable` |
| `**` | `X-Content-Type-Options` | `nosniff` |
| `**` | `X-Frame-Options` | `DENY` |
| `**` | `Referrer-Policy` | `strict-origin-when-cross-origin` |

---

## 🌍 Internationalization

Translation files are in `src/i18n/locales/`. Each file exports a flat key-value object typed against the English baseline.

```
src/i18n/locales/
├── en.ts   🇺🇸 English  (default fallback)
├── pt.ts   🇧🇷 Portuguese
└── es.ts   🇪🇸 Spanish
```

**Detection order:**
1. `localStorage` (persisted from previous visit)
2. `navigator.language` (browser setting)
3. Falls back to `en`

To add a new language, create `src/i18n/locales/xx.ts` with all keys from `en.ts`, then register it in `src/i18n/index.ts`:

```ts
import xx from './locales/xx'

resources: {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  xx: { translation: xx },   // add here
}
```

---

## 🔒 Security Model

### Threat Model & Mitigations

| Attack Vector | Mitigation |
|--------------|-----------|
| Client writes directly to Firestore | All writes denied in security rules; only Admin SDK (Cloud Functions) can write |
| User creates link attributed to another user | `request.auth.uid` is used as `userId` server-side — client cannot override |
| User deletes another user's link | Ownership verified: `link.userId !== uid` → `permission-denied` |
| User bypasses plan limits | `linkCount` maintained server-side with atomic `FieldValue.increment`; checked in `createLink` |
| Slug squatting on reserved paths | `RESERVED_SLUGS` set checked before any slug is written |
| Open redirect to non-HTTP URLs | `originalUrl` validated: `z.string().url()` + must start with `http://` or `https://` |
| Link pointing to malware or phishing site | Google Safe Browsing API v4 checks every URL at creation time (MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE, POTENTIALLY_HARMFUL_APPLICATION) |
| Unauthenticated function calls | `if (!request.auth)` guard at the top of every callable function |
| CORS bypass on Cloud Run | `cors: true` on all callable functions; Firebase handles OPTIONS preflight |
| XSS via link titles | Titles are rendered as text content, never as HTML |
| Brute-force / mass link creation | Firestore-based rate limiter: free plan capped at 20 creates/hour, pro at 200/hour |
| Redirect endpoint flood (DDoS) | In-memory IP rate limiter: 60 requests/minute per IP per Cloud Run instance |
| Artificial click inflation (analytics fraud) | Click deduplication: SHA-256(ip + daily-salt) prevents counting the same IP more than once per hour per link |

### Audit Logging

All Cloud Functions emit structured JSON logs to **Cloud Logging** on every operation:

```json
{
  "audit": true,
  "action": "createLink",
  "uid": "abc123",
  "result": "url_blocked",
  "metadata": { "url": "https://...", "threats": ["MALWARE"] },
  "timestamp": "2025-04-22T14:30:00.000Z"
}
```

Filter in Firebase Console → Functions → Logs:
```
jsonPayload.audit=true
jsonPayload.action="createLink"
jsonPayload.result="url_blocked"
```

### Safe Browsing API Key Setup

The Google Safe Browsing API key is stored in **Firebase Secret Manager** (never in `.env` or source code):

```bash
# 1. Enable the Safe Browsing API in your Google Cloud project
#    Cloud Console → APIs & Services → Library → Safe Browsing API → Enable

# 2. Create an API key (restrict it to Safe Browsing API only)
#    Cloud Console → APIs & Services → Credentials → Create credentials → API key

# 3. Store it in Secret Manager
firebase functions:secrets:set SAFE_BROWSING_API_KEY

# 4. Verify
firebase functions:secrets:access SAFE_BROWSING_API_KEY
```

### Dual-Layer Validation

Every input is validated **twice** — once client-side for UX, once server-side for security:

```
Client (React Hook Form + Zod):
  ✓ Shows inline errors without an API round-trip
  ✓ Prevents submitting obviously invalid data

Server (Cloud Function + Zod):
  ✓ Cannot be bypassed — runs in a trusted environment
  ✓ z.coerce.date()     — accepts ISO strings, coerces to Date
  ✓ z.nullable()        — handles null (Firebase SDK encodes undefined as null)
  ✓ z.string().url()    — strict URL validation
  ✓ future date check   — evaluated at request time, not module load time
```

---

## 🗺️ Roadmap

- [ ] Link analytics page with charts (clicks over time, top referrers, devices)
- [ ] Custom domain support with CNAME setup guide
- [ ] Bulk link import via CSV
- [ ] Password-protected links
- [ ] Pro plan billing integration (Stripe)
- [ ] REST API access with API key management
- [ ] Link preview cards (og:image generation via Puppeteer)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Firebase Emulator seed data for local development

---

## 👤 Author

**Pedro Bolson**
- 🌐 [linkspilot.pedrobolson.com.br](https://linkspilot.pedrobolson.com.br)
- 🐙 [@PedroBolson](https://github.com/PedroBolson)

---

<p align="center">
  Built with ❤️ using React, Firebase and TypeScript<br/>
  <sub>© 2025 Pedro Bolson · LinksPilot</sub>
</p>
