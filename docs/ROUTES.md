# Routes — Osool Altamaioz

All storefront routes are locale-prefixed: `/ar/...` and `/en/...`.

## Storefront

| Route | Purpose | Phase |
|-------|---------|-------|
| `/` | Redirect to `/ar` | 0 |
| `/[locale]` | Homepage | 2 |
| `/[locale]/categories/[slug]` | Category / subcategory landing | 3 |
| `/[locale]/products/[slug]` | Product detail (PDP) | 4 |
| `/[locale]/search` | Search results | 3 |
| `/[locale]/offers` | Promotions listing | 8 |
| `/[locale]/wishlist` | Wishlist | 5 |
| `/[locale]/cart` | Cart | 5 |
| `/[locale]/checkout` | Checkout | 5 |
| `/[locale]/checkout/success` | Order confirmation | 5 |
| `/[locale]/login` | Login | 5 |
| `/[locale]/register` | Register | 5 |
| `/[locale]/forgot-password` | Password reset | 5 |
| `/[locale]/account` | Account overview | 5 |
| `/[locale]/account/orders` | Order list | 5 |
| `/[locale]/account/orders/[id]` | Order detail + tracking | 5 |
| `/[locale]/account/addresses` | Saved addresses | 5 |
| `/[locale]/account/profile` | Profile settings | 5 |
| `/[locale]/spaces` | Shop By Space index | 6 |
| `/[locale]/spaces/[slug]` | Space detail | 6 |
| `/[locale]/scenes` | Shop The Scene index | 6 |
| `/[locale]/scenes/[slug]` | Scene detail + hotspots | 6 |
| `/[locale]/lighting-experience` | 5-step experience | 6 |
| `/[locale]/about` | About | 8 |
| `/[locale]/projects` | Projects | 8 |
| `/[locale]/contact` | Contact | 8 |
| `/[locale]/faq` | FAQ | 8 |
| `/[locale]/policies/shipping` | Shipping policy | 8 |
| `/[locale]/policies/returns` | Returns policy | 8 |
| `/[locale]/policies/warranty` | Warranty policy | 8 |
| `/[locale]/policies/privacy` | Privacy | 8 |
| `/[locale]/policies/terms` | Terms | 8 |

## API (planned)

| Route | Purpose | Phase |
|-------|---------|-------|
| `/api/cart` | Cart CRUD | 5 |
| `/api/checkout` | Order creation | 5 |
| `/api/webhooks/payments/[provider]` | Payment webhooks | 7 |
| `/api/webhooks/shipping/[provider]` | Shipping updates | 7 |
| `/api/experience/recommend` | Lighting recommendation engine | 6 |
| `/api/experience/validate-scene` | Scene bundle validation | 6 |
| `/api/products/batch` | Batch product fetch by slug | 3/6 |

## SEO

- `sitemap.xml` and `robots.txt` at app root (Phase 9)
- hreflang via metadata alternates per page
