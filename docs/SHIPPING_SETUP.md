# Shipping Setup — Osool Altamaioz

**Status: Architecture ready — carrier contracts and pricing require business confirmation.**

## Required coverage

| Zone | Description | Status |
|------|-------------|--------|
| Local | Same-city / metro delivery | Cities + pricing TBD |
| Saudi domestic | Nationwide carriers | Carrier TBD |
| GCC | Selected countries | Countries TBD |
| International | Eligible products only | Restrictions TBD |

## Data model (planned)

`ShippingZone`, `ShippingRate`, `ShippingRule` tables or config JSON:

- Match by country, city, cart weight, order value, product tags (oversized/fragile)
- Free shipping thresholds per zone
- Product-level `shippingRestricted` flag

## Environment variables (template)

```env
SHIPPING_DEFAULT_COUNTRY=SA
SHIPPING_LOCAL_CITIES=
SHIPPING_CARRIER_API_KEY=
SHIPPING_CARRIER_ACCOUNT=
SHIPPING_WEBHOOK_SECRET=
```

## Integration boundaries

1. `quoteShipping(cart, address)` — authoritative at checkout
2. Never trust client-displayed shipping totals
3. Carrier label/tracking via adapter when contracted

## Product restrictions

Some items (large chandeliers, bulk floodlights) may be pickup/local-only until confirmed.

## Owner checklist

- [ ] Local delivery cities and flat/weight rates
- [ ] Domestic carrier (SMSA, Aramex, etc.) contract
- [ ] GCC country list and rates
- [ ] International policy + excluded categories
- [ ] Free shipping threshold (if any)
- [ ] Oversized/fragile handling SOP
