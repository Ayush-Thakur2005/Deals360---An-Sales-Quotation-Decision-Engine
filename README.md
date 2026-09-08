# DealFlow360

> **End-to-end B2B sales operations platform** — quotes, discount governance, multi-step approvals, customer portal, fulfillment, billing, recommendations, and deal health analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [About](#-about)
- [Architecture](#-architecture)
- [Repository Structure](#-repository-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [Running Commands](#-running-commands)
- [Test Accounts](#-test-accounts)
- [Key Features](#-key-features)
- [Demo Walkthroughs](#-demo-walkthroughs)
- [API Documentation](#-api-documentation)
- [Permissions (RBAC)](#-permissions-rbac)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 About

**DealFlow360** is a full-stack demo/production-ready sales ops system built for complex B2B deal workflows. It models the complete quote-to-cash lifecycle:

| Phase | Capabilities |
|-------|--------------|
| **Quote & Risk** | Multi-line quotes, blended risk scoring, tier/category discount ceilings |
| **Approvals** | Manager + Finance chains driven by database policy rules |
| **Portal** | Magic-link customer portal, change requests, counter-discount negotiation |
| **Fulfillment** | Multi-warehouse greedy allocation, backorder detection |
| **Billing** | Subscriptions, prorated mid-cycle quantity changes, append-only ledger |
| **Intelligence** | Co-occurrence recommendations (lift scoring), discount anomaly detection, stall detection |
| **Audit** | Event-sourced writes, immutable event log, what-if replay |

The backend is an **event-sourced modular monolith**; the frontend is a **React SPA** with role-based access control, dark/light mode, and real-time notifications.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DealFlow360 (Monorepo)                          │
├──────────────────────────────┬──────────────────────────────────────────┤
│   dealflow360/  (Frontend)   │   dealflow360-api/  (Backend)            │
│   React 19 + Vite + Tailwind │   Fastify + Prisma + PostgreSQL          │
│   Port 5173                  │   Port 3000                              │
└──────────────┬───────────────┴──────────────────┬───────────────────────┘
               │  REST + JWT                        │
               └────────────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   PostgreSQL 16 (Docker)      │
                    │   Prisma ORM + migrations     │
                    └───────────────────────────────┘
```

**Event flow (simplified):**

```
User action → API route → append Event → update read models → event bus handlers
                                                              (allocation, recs, notifications…)
```

---

## 📁 Repository Structure

```
.
├── dealflow360/                 # Frontend — React SPA
│   ├── src/
│   │   ├── pages/               # App, auth, portal, marketing screens
│   │   ├── components/          # UI + business components
│   │   ├── lib/                 # API client, permissions, types
│   │   └── context/             # Auth, theme, notifications
│   └── package.json
│
├── dealflow360-api/             # Backend — Fastify API
│   ├── src/
│   │   ├── modules/             # quotes, policy, portal, billing, recs…
│   │   ├── core/                # event bus, event store, schemas
│   │   └── index.ts             # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Demo data bootstrap
│   ├── docker-compose.yml       # PostgreSQL container
│   └── package.json
│
└── README.md                    # ← You are here
```

---

## 🛠 Tech Stack

### Frontend (`dealflow360/`)

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (CSS variables, dark/light themes) |
| Routing | React Router 7 |
| Charts | Recharts |
| Icons | Lucide React |

### Backend (`dealflow360-api/`)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + TypeScript |
| HTTP | Fastify 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | JWT (`@fastify/jwt`) |
| Validation | Zod + `fastify-type-provider-zod` |
| API Docs | Swagger UI at `/docs` |
| Email | Nodemailer (portal magic links, welcome emails) |
| Tests | Vitest |

---

## ✅ Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20+ recommended | LTS preferred |
| **npm** | 9+ | Comes with Node |
| **Docker** | Any recent | For PostgreSQL via `docker compose` |
| **Git** | — | Clone & push to GitHub |

---

## 🚀 Quick Start

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd "Odoo Final 2026"   # or your cloned folder name
```

### 2️⃣ Start the database

```bash
cd dealflow360-api
docker compose up -d
```

PostgreSQL will be available at `localhost:5432`.

### 3️⃣ Configure & run the API

```bash
cd dealflow360-api
cp .env.example .env          # Edit if needed (defaults work locally)
npm install
npx prisma migrate dev          # Apply migrations
npm run seed                    # Load demo data (users, products, quotes…)
npm run dev                     # → http://localhost:3000
```

> **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)

### 4️⃣ Run the frontend (new terminal)

```bash
cd dealflow360
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:3000
npm install
npm run dev                     # → http://localhost:5173
```

### 5️⃣ Log in

Open [http://localhost:5173/login](http://localhost:5173/login) and use any test account below (e.g. `rep@dealflow360.test` / `password123`).

---

## 🔐 Environment Variables

### Backend — `dealflow360-api/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://dealflow:dealflow_secret@localhost:5432/dealflow360` |
| `JWT_SECRET` | JWT signing secret | Change in production |
| `PORT` | API port | `3000` |
| `HOST` | Bind address | `0.0.0.0` |
| `EMAIL_TRANSPORT` | `console` \| `ethereal` \| `smtp` | `console` |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Portal & welcome email (optional) | — |
| `PORTAL_BASE_URL` | Frontend URL for magic links | `http://localhost:5173` |

### Frontend — `dealflow360/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

> ⚠️ Never commit `.env` files. They are gitignored.

---

## 🗄 Database

### Docker PostgreSQL

```yaml
# dealflow360-api/docker-compose.yml
User:     dealflow
Password: dealflow_secret
Database: dealflow360
Port:     5432
```

### Core models (Prisma)

| Domain | Models |
|--------|--------|
| **Auth** | `User` |
| **Catalog** | `Product`, `PriceListEntry`, `Customer`, `CustomerTier` |
| **Policy** | `CategoryDiscountCeiling`, `ApprovalChainRule` |
| **Quotes** | `Quote`, `QuoteLine`, `Approval`, `QuoteStageTransition` |
| **Fulfillment** | `Warehouse`, `StockLevel`, `Allocation`, `Backorder` |
| **Billing** | `SubscriptionPlan`, `Subscription`, `LedgerLine` |
| **Portal** | `PortalSession`, `ChangeRequest`, `Notification` |
| **Recs** | `ProductCoOccurrence`, `ProductPurchaseCount` |
| **Audit** | `Event` (append-only event store) |

### Common DB commands

```bash
cd dealflow360-api

# Generate Prisma client after schema changes
npm run db:generate

# Create / apply migrations
npm run db:migrate

# Push schema without migration (dev only)
npm run db:push

# Reset & reseed demo data
npm run seed

# Rebuild recommendation co-occurrence pairs
npm run seed:recompute-cooccurrence

# Re-backfill stage transitions for Deal Health
npm run seed:stage-transitions
```

---

## ⌨️ Running Commands

### Backend (`dealflow360-api/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run seed` | Clear & rebuild all demo data |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `docker compose up -d` | Start PostgreSQL |
| `docker compose down` | Stop PostgreSQL |
| `npx prisma studio` | Visual database browser |

### Frontend (`dealflow360/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run oxlint |

### Full local stack (cheat sheet)

```bash
# Terminal 1 — Database (once)
cd dealflow360-api && docker compose up -d

# Terminal 2 — API
cd dealflow360-api && npm run dev

# Terminal 3 — Frontend
cd dealflow360 && npm run dev
```

---

## 👤 Test Accounts

All seeded users share password: **`password123`**

| Role | Email | Typical use |
|------|-------|-------------|
| 🧑‍💼 Sales Rep | `rep@dealflow360.test` | Create deals, add lines, submit, send to customer |
| 👔 Manager | `manager@dealflow360.test` | Approve/reject manager step |
| 💰 Finance | `finance@dealflow360.test` | Approve high-risk finance step, billing |
| ⚙️ Admin | `admin@dealflow360.test` | Policies, warehouses, products, full access |

After `npm run seed`, the API console prints useful demo IDs (products, customers, portal tokens, stalled quotes, etc.).

---

## ✨ Key Features

### Quote workspace (`/app/deals/:id`)

| Tab | What it does |
|-----|--------------|
| **Quote** | Line items, risk panel, recommendations/upsell, submit & send |
| **Fulfillment** | Warehouse allocation, backorder view |
| **Billing** | Attach subscriptions, ledger entries, proration |
| **Audit** | Paginated immutable event trail |
| **What-if** | Replay risk/routing with hypothetical discount ceilings |
| **Changes** | Customer portal change requests (accept/reject) |

### Other screens

| Screen | Route | Highlights |
|--------|-------|------------|
| Overview | `/app` | Dashboard summary |
| Deals | `/app/deals` | Search, pagination, lifecycle filters |
| Approvals | `/app/approvals` | Pending approval queue |
| Deal Health | `/app/deal-health` | Discount z-score anomalies, stalled deals |
| Customer Portal | `/portal/quote/:token` | View quote, request changes, confirm |
| Policies | `/app/policies` | Admin — ceilings & approval chains |
| Warehouses | `/app/warehouses` | Stock levels per warehouse |

### Recommendations engine

Add **Laptop Pro 14** to a draft quote → panel suggests **Laptop Bag** with lift score **> 1** and tag `BUNDLE_ATTACH` (seeded co-occurrence from confirmed order history).

---

## 🎬 Demo Walkthroughs

### Flow A — Approval chain (Rep → Manager → Finance)

1. Log in as **rep@dealflow360.test**
2. **Deals → New Deal** → pick a Gold customer
3. **Quote tab** → add Hardware line (low discount) + Service line with **> ceiling discount** (e.g. 22%)
4. Check risk panel → **Submit for Approval**
5. Log in as **manager@dealflow360.test** → **Approvals** → Approve with reason
6. If risk is high, log in as **finance@dealflow360.test** and approve Finance step
7. **Audit tab** → verify `QuoteCreated` → `LineAdded` → `RiskScoreComputed` → `ApprovalRequested` → `ApprovalDecided`

### Flow B — Fulfillment + billing

1. Open a **CONFIRMED** seeded deal (or complete Flow A + customer confirm)
2. **Fulfillment** → **Allocate** → see per-warehouse splits
3. **Billing** → view ledger / attach subscription (plan UUID from seed output)
4. **Apply Qty Change** mid-cycle → see `PRORATED_CHARGE` in ledger

### Flow C — Customer portal negotiation

1. Rep sends quote → **Send to Customer** (email or console magic link)
2. Customer opens `/portal/quote/:token` → submits counter-discount change request
3. Rep reviews on **Changes** tab → Accept → may re-enter approval if risk spikes
4. Customer confirms → quote becomes `CONFIRMED`

> 📖 Detailed Swagger steps and seed notes: see [`dealflow360-api/README.md`](./dealflow360-api/README.md)

---

## 📡 API Documentation

| Resource | URL |
|----------|-----|
| **Swagger UI** | [http://localhost:3000/docs](http://localhost:3000/docs) |
| **OpenAPI JSON** | [http://localhost:3000/docs/json](http://localhost:3000/docs/json) |

### Module overview

| Module | Key endpoints |
|--------|---------------|
| Auth | `POST /auth/login`, `POST /auth/signup` |
| Quotes | `GET/POST /quotes`, lines, submit, send, confirm |
| Policy | Discount ceilings, approval chain rules |
| Approvals | `POST /quotes/:id/approvals/:id/decide` |
| Portal | `POST /portal/request-access`, `GET /portal/quotes/:token` |
| Fulfillment | `POST/GET /quotes/:id/fulfillment` |
| Billing | Subscriptions, `GET /quotes/:id/ledger` |
| Recs | `GET /products/:id/recommendations` |
| Deal Health | `GET /deal-health/anomalies`, `stalled`, `thresholds` |
| Audit | `GET /audit/quotes/:id`, `POST /audit/quotes/:id/replay` |
| Notifications | `GET /notifications`, dismiss endpoints |

Authenticate in Swagger: **POST /auth/login** → copy `token` → **Authorize** → `Bearer <token>`

---

## 🔒 Permissions (RBAC)

Frontend mirrors backend guards via `src/lib/permissions.ts` (`usePermission`, `<Can action="...">`). Unauthorized actions are **hidden**, not shown as disabled buttons.

| Action | Roles |
|--------|-------|
| Create deal, add/edit lines, submit, send | Sales Rep, Admin |
| Approve / reject | Manager, Finance, Admin |
| Respond to change requests | Sales Rep, Admin |
| Allocate fulfillment | Sales Rep, Manager, Admin |
| Billing & subscriptions | Sales Rep, Finance, Admin |
| Edit policies, warehouses | Admin |

---

## 🧪 Testing

### Backend unit tests

```bash
cd dealflow360-api
npm test
```

Covers: blended risk, warehouse allocator, subscription proration, lift scoring, discount anomaly z-scores, stall detection (IQR thresholds).

### Manual smoke test

```bash
# API health + login
curl http://localhost:3000/docs/json

# Recommendations (after seed) — replace TOKEN and LAPTOP_ID from seed output
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/products/<LAPTOP_ID>/recommendations
# Expect: Laptop Bag with liftScore > 1
```

---

## 🩺 Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on API calls | Ensure API is running on port 3000 and `VITE_API_BASE_URL` matches |
| Database connection failed | Run `docker compose up -d` in `dealflow360-api/` |
| Empty deals / no users | Run `npm run seed` in `dealflow360-api/` |
| CORS errors on DELETE/PATCH | API allows these methods — restart API if you changed `index.ts` |
| Portal email not received | Set `SMTP_*` in `.env`, or copy magic link from API console / JSON response |
| Prisma client errors | Run `npm run db:generate` after pulling schema changes |
| Port 5173 in use | Vite picks next free port — check terminal output |

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [`dealflow360-api/README.md`](./dealflow360-api/README.md) | Deep API docs, Swagger walkthroughs, architecture notes |
| [`dealflow360/README.md`](./dealflow360/README.md) | Frontend routes and feature summary |
| [`dealflow360/INTEGRATION_AUDIT.md`](./dealflow360/INTEGRATION_AUDIT.md) | Frontend ↔ backend wiring audit |

---

## 📄 License
  MIT License.

---

<p align="center">
  <strong>DealFlow360</strong> — Quote smarter. Approve faster. Close with confidence.
</p>
