# Customer review persistence — proposed Prisma addition

**Status:** Not applied. No migration or `db:push` was run.

## Model: `ProductReview`

| Field | Type | Notes |
|-------|------|--------|
| `id` | `String @id @default(cuid())` | |
| `status` | `ReviewStatus` enum | `PENDING`, `APPROVED`, `REJECTED` |
| `rating` | `Int` | 1–5, required |
| `bodyAr` | `Text?` | Localized body (one locale per row or single `body`) |
| `bodyEn` | `Text?` | |
| `body` | `Text` | Alternative: single field + `locale` |
| `customerId` | `String?` | FK → `Customer`, nullable if guest never allowed |
| `displayName` | `String` | Public name (from profile, never email) |
| `productId` | `String?` | FK → `Product`, optional |
| `productSlug` | `String?` | Denormalized slug for links |
| `orderId` | `String?` | FK → `Order`, for verified purchase |
| `verifiedPurchase` | `Boolean @default(false)` | Set only when `orderId` validated |
| `imageUrl` | `String?` | CDN/object storage URL — **not** binary in MySQL |
| `imageStorageKey` | `String?` | Provider key |
| `moderatedAt` | `DateTime?` | |
| `moderatedBy` | `String?` | Admin user id |
| `rejectReason` | `String?` | Internal |
| `createdAt` | `DateTime @default(now())` | |
| `updatedAt` | `DateTime @updatedAt` | |

## Enum: `ReviewStatus`

`PENDING` | `APPROVED` | `REJECTED`

## Indexes

- `@@index([status, createdAt])` — public listing
- `@@index([productId, status])` — product-scoped reviews
- `@@index([customerId])` — user history

## Relations

- `ProductReview` → `Customer` (optional)
- `ProductReview` → `Product` (optional)
- `ProductReview` → `Order` (optional, verified purchase)

## Public query rule

Only `status = APPROVED` exposed on storefront APIs.
