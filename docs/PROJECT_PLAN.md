# Project Plan — Osool Altamaioz

## Goal

Build a production-ready bilingual (Arabic primary RTL / English LTR) Saudi lighting e-commerce store for **اصول التميز / Osool Altamaioz**.

## Stack (Phase 0 decision)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4 + design tokens |
| i18n | next-intl (`/ar`, `/en`) |
| Database | MySQL + Prisma ORM (Hostinger production) |
| Auth | NextAuth or custom session (Phase 5) |
| Search | MySQL/in-memory first; Algolia/Meilisearch-ready abstraction (Phase 3+) |
| Payments | Provider abstraction — Mada/Visa/MC/Apple Pay/Tabby/Tamara (Phase 7) |
| Shipping | Zone/rule config layer (Phase 7) |

Repository was documentation-only at start; custom stack initialized per master prompt.

## Phases

1. **Phase 0 — Foundation** — ✅ docs, i18n, tokens, Prisma schema, import model
2. **Phase 1 — Global shell** — ✅ header, mega menu, mobile nav, footer
3. **Phase 2 — Homepage** — ✅ hero, spaces, categories, scene CTA, experience CTA
4. **Phase 3 — Catalog** — ✅ PLP, filters, search, pagination, product cards
5. **Phase 4 — PDP** — ✅ gallery, variants, CCT, sticky bar, specs, related
6. **Phase 5 — Commerce** — ✅ cart, wishlist, auth, checkout, orders
7. **Phase 6 — Signature** — ✅ Shop By Space, Shop The Scene, Lighting Experience
8. **Phase 7 — Scalable catalog & data engine** — ✅ batch imports, Prisma repos, dry-run/apply, validation
9. **Phase 8 — Integrations** — payments, shipping, webhooks
10. **Phase 9 — Content** — policies, FAQ, About, Contact
11. **Phase 10 — Quality** — SEO, a11y, analytics, performance
12. **Phase 11 — Production** — env docs, launch checklist

## Catalog scope

The **current imported sample** (~703 grouped products / ~835 variants) is batch-001 only. The final catalog will be much larger. See `docs/ADDING_PRODUCTS.md`.

## Non-goals for V1 scaffolding

- Full admin panel (use DB seeds / scripts until platform admin exists)
- Certified lux/engineering calculations in Lighting Experience (rule engine only)
- Production payment activation without merchant credentials

## Design source

Figma: https://www.figma.com/design/BN6SR5KcdPaS6u4qCxY3iN

## Business dependencies

See `docs/BUSINESS_BLOCKERS.md`. Frontend uses safe placeholders; prices marked `priceConfirmed: false` until owner confirms.
