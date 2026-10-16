# TeesZone Admin Dashboard

Administrative back-office web application for **TeesZone**: product catalog, collections, homepage CMS, product likes tracking, customer inquiries, reviews, promotions, and customer management. Directly interfaces with the TeesZone Fastify API (`http://localhost:4010`).

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & shadcn/ui (Radix Primitives)
- **Data & Tables**: TanStack Query & TanStack Table
- **Forms & Validation**: react-hook-form + Zod

---

## Admin Modules & Key Features

### 1. Product Likes & Wishlist Tracking (`/likes`)
- Dedicated administrative overview of products saved by customers.
- 4 KPI metric cards: **Total Likes**, **Interested Customers**, **Products Saved**, and **Most Liked Item**.
- Detailed data table with customer name, email, phone number, company, liked product (with direct link to storefront PDP), and timestamp.
- Real-time search filter across customer details and product names.

### 2. Homepage Content CMS (`/home-content`)
- Visual CMS allowing store managers to update live storefront content without code changes:
  - **Hero Split**: Main headline, subheadline, CTA text, CTA link, desktop banner image, and mobile background image.
  - **Shop By Range**: Category cards, images, titles, and routing links.
  - **The Fabric Library**: Fabric title, GSM, composition, image, and descriptions.
  - **The TeesZone Process**: Step titles, descriptions, and icon configurations.

### 3. Catalog & Inventory Management (`/products`)
- Complete product lifecycle management with automated AWS S3 image uploads.
- Variant manager for color shades, size grids, SKU generation, and volume-tiered pricing.
- In-line editor for the product's live "Orders Delivered" counter.

### 4. Collections & Categorization (`/collections`)
- Multi-category management aligned 1:1 with storefront navigation: `men`, `women`, `kids`, `hoodies`, and `specialty`.

### 5. Reviews, Inquiries & Customers (`/reviews`, `/enquiries`, `/customers`)
- **Reviews**: Moderation and management of customer testimonials.
- **Enquiries**: In-depth wholesale quote requests and custom garment specifications.
- **Customers**: Registered customer roster with contact and account details.

---

## Security & Route Protection

- **Role-Based Guards**: Every dashboard page is wrapped with `<AuthGuard>` and `useRequireAdmin()`.
- **Session Verification**: Validates the stored JWT token with `/api/auth/me` on startup. If the account does not possess the `ADMIN` role, the visitor is immediately bounced to `/login`.
- **Zero Client Key Exposure**: No backend database credentials, JWT secret keys, or payment secret keys are stored or accessible in the client bundle.

---

## Admin Credentials

- `teeszoneindia@gmail.com` | `teeszone@2025`
- `vijayadarshini@teeszone.in` | `tees@2026`
- `archana@teeszone.in` | `tees@2026`
- `nithyasri@teeszone.in` | `tees@2026`
- `vasuki@zavyx.in` | `tees@2026`

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4010
NEXT_PUBLIC_STORE_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Available Scripts

- `npm run dev` — Starts admin development server on port 3001
- `npm run build` — Builds the application for production
- `npm run start` — Runs the production build
- `npm run lint` — Runs ESLint checks
