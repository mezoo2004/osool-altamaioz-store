# Integrations — Osool Altamaioz

## Payments (Phase 7)

Desired methods:

- Mada, Visa, Mastercard, Apple Pay (card gateway TBD)
- Tabby (BNPL)
- Tamara (BNPL)

Architecture:

```
Checkout → PaymentService.createIntent()
         → Provider adapter (HyperPay / Moyasar / Stripe SA / etc.)
         → Webhook → PaymentService.verify() → Order update
```

**Status:** Not activated. No production credentials. UI may show method placeholders disabled until `docs/PAYMENTS_SETUP.md` checklist complete.

## Shipping (Phase 7)

Zones:

- Local delivery (city-level — business confirmation)
- Saudi domestic
- GCC
- International (eligible products only)

Architecture:

```
Checkout → ShippingService.quote(cart, address)
         → Rule engine (weight, value, product flags)
         → Carrier adapter when contracted
```

## Analytics (Phase 9)

`AnalyticsProvider` interface with events:

- view_item, view_item_list, search, select_item
- add_to_cart, remove_from_cart, view_cart
- begin_checkout, add_shipping_info, add_payment_info, purchase
- add_to_wishlist, language_change
- lighting_experience_start/complete, shop_scene_view, shop_scene_add_bundle

Adapters: GA4, Meta Pixel, TikTok — enabled via env flags only.

## Search (Phase 3+)

Default: MySQL (Hostinger). Migration path to Meilisearch/Algolia via `SearchProvider` swap.

## Email / SMS (future)

Order confirmation, password reset, tracking — provider TBD (Resend, SendGrid, Unifonic, etc.).

## Figma

Design source: https://www.figma.com/design/BN6SR5KcdPaS6u4qCxY3iN

MCP access requires authentication; implementation follows written specs + brand tokens until Figma MCP is connected.
