# TeesZone Admin Dashboard

Administrative back office for the TeesZone storefront: products catalog, collections, promotions, fabrics, customer reviews, inquiries, and customer management. Directly interfaces with the TeesZone Fastify API (`http://localhost:4010`).

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & shadcn/ui (Radix Primitives)
- **State & Tables**: TanStack Query & TanStack Table
- **Forms & Validation**: react-hook-form + Zod

---

## Recent Updates & Improvements

1. **Authentication Credentials**:
   - Authorized Administrator Login: `teeszoneindia@gmail.com`
   - Secure dashboard authentication with persistent token storage.

2. **Catalog Synchronization**:
   - Removed deprecated segments (e.g. `unisex`).
   - Integrated full segment support: `men`, `women`, `kids`, `hoodies`, and `specialty`.
   - Collections view aligns 1:1 with live storefront navigation.

3. **Products Table UI Optimization**:
   - Fixed text overflow and alignment conflicts between the Collections column and Price/Discount column.
   - Constrained layout badges and tags for clean responsive presentation.

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

## Admin Credentials

- **Email**: `teeszoneindia@gmail.com`
- **Password**: `teeszone@2025`

---

## Available Scripts

- `npm run dev` — Starts admin development server on port 3001
- `npm run build` — Builds the application for production
- `npm run start` — Runs the production build
- `npm run lint` — Runs ESLint checks
