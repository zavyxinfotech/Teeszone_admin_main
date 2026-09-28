# TeesZone Admin

Back office for the TeesZone storefront: products, collections, promotions, fabrics, reviews,
enquiries, customers and newsletter subscribers. Talks only to the TeesZone API (`backend/`).

- Plan: [`../ADMIN_PLAN.md`](../ADMIN_PLAN.md) · Status: [`../PROGRESS.md`](../PROGRESS.md) (Phase 2.6)
- Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (Radix) · TanStack Query + Table ·
  react-hook-form + zod · sonner · lucide

## Run

```bash
cp .env.example .env.local        # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STORE_URL
cd ../backend && npm run dev      # API on :4010 (MySQL + Redis must be up)
npm run dev                       # http://localhost:3001
```

Sign in with an account whose email is listed in `ADMIN_EMAILS` (`backend/.env`) — the same
email/password used on the storefront. Non-admin accounts are rejected.

## Scripts

- `npm run dev` — dev server on :3001 (`next dev -p 3001` is set in package.json)
- `npm run build` — production build (backend must be reachable)
- `npm run lint`

## Layout

```
src/app/login                 sign-in
src/app/(dashboard)/…         auth-guarded routes, one folder per module
src/components/ui             shadcn primitives (generated)
src/components/data-table     DataTable (TanStack), ServerPagination, RowActions
src/components/shared         FormRow, TagInput, MultiSelect, ImageField, ConfirmDialog, …
src/components/<module>       tables, forms, dialogs per module
src/hooks                     TanStack Query hooks per domain
src/lib/api.ts                envelope-unwrapping API client (Bearer JWT)
src/lib/types.ts              API contract (copied from ui/src/lib/types.ts) + admin extras
```

Product image uploads go to `POST /api/upload/image`, which answers 503 until S3 credentials are
configured in `backend/.env`; image paths stay editable as text meanwhile.
