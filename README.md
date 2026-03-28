# InfluenceIndia 🇮🇳

India's influencer-brand collaboration marketplace. Brands discover verified Indian influencers with real metrics and transparent pricing. Influencers get listed and receive collaboration requests.

## Features

- **For Brands**: Browse verified influencers, filter by niche/city/budget, view ratings, send collaboration requests
- **For Influencers**: Multi-step onboarding, set pricing for Story/Post/Reel/Video, receive brand requests
- **Rating System**: Composite score (followers 40pts + engagement 40pts + virality 20pts)
- **Admin Panel**: Verify profiles, set/update influencer metrics
- **Authentication**: Email/password with role-based routing (brand / influencer / admin)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | Prisma + SQLite (zero setup, no account needed) |
| Auth | NextAuth.js v5 |
| UI | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Zod |

**100% free and open-source. No external accounts or API keys required.**

## Quick Start

### 1. Install dependencies
```bash
cd influencer-collab
npm install
```

### 2. Run migrations + seed demo data
```bash
npx prisma migrate dev --name init
npm run seed
```

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|------|-------|---------|
| **Admin** | admin@influenceindia.in | admin123 |
| **Influencer** | priya.sharma@example.com | password123 |
| **Brand** | brand@myntra.com | password123 |

## Demo Flow

1. **As a Brand** — Sign up → Complete onboarding (3 steps) → Browse influencers → Send collaboration request
2. **As an Influencer** — Sign up → Complete onboarding (5 steps) → Wait for admin verification
3. **As Admin** — Log in → Go to `/admin` → Expand influencer row → Set metrics + click "Approve & Verify"
4. **Brand sees influencer** — Browse page → View profile → Send request → Influencer accepts in dashboard

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Login page
│   ├── signup/                   # Signup with brand/influencer role selector
│   ├── onboarding/
│   │   ├── influencer/[step]/    # 5-step influencer onboarding
│   │   └── brand/[step]/         # 3-step brand onboarding
│   ├── influencers/
│   │   ├── page.tsx              # Browse + filter + search
│   │   └── [id]/page.tsx         # Full influencer profile
│   ├── dashboard/
│   │   ├── brand/                # Brand: requests history
│   │   └── influencer/           # Influencer: accept/decline requests
│   ├── admin/                    # Verify influencers + brands
│   └── api/                      # REST API routes
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Header, Footer
│   ├── influencer/               # Cards, filters, pricing, rating badge
│   ├── brand/                    # Contact form
│   ├── admin/                    # Admin row components
│   └── onboarding/               # Step indicator
├── lib/
│   ├── prisma.ts                 # DB client singleton
│   ├── auth.ts                   # NextAuth configuration
│   ├── scoring.ts                # Rating algorithm
│   └── utils.ts                  # cn(), formatters
└── types/index.ts                # Shared TypeScript types
```

## Rating Algorithm

```
Score (0–100) = Followers (40pts) + Engagement (40pts) + Virality (20pts)

Followers:   min(followerCount / 1,000,000 × 40, 40)
Engagement:  min(engagementRate × 4, 40)   // 10% engagement = max 40pts
Virality:    (viralityScore / 100) × 20
```

Scores are set by admins in the verification flow. Colors: 🔴 0–40 · 🟡 41–70 · 🟢 71–100

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run seed         # Seed demo data
npm run db:reset     # Drop + recreate + reseed database
npx prisma studio    # Visual DB browser
```
