# Payments Setup — Osool Altamaioz

**Status: NOT ACTIVATED — awaiting business decisions and merchant approval.**

## Desired methods

| Method | Provider | Status |
|--------|----------|--------|
| Mada | Card gateway TBD | Blocked — credentials |
| Visa / Mastercard | Card gateway TBD | Blocked — credentials |
| Apple Pay | Via card gateway | Blocked — credentials |
| Tabby | Tabby API | Blocked — merchant onboarding |
| Tamara | Tamara API | Blocked — merchant onboarding |

## Environment variables (template)

```env
# Card gateway (example placeholders — replace with chosen provider)
PAYMENT_PROVIDER=
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

# Tabby
TABBY_PUBLIC_KEY=
TABBY_SECRET_KEY=
TABBY_MERCHANT_CODE=
TABBY_WEBHOOK_SECRET=

# Tamara
TAMARA_API_TOKEN=
TAMARA_NOTIFICATION_TOKEN=
TAMARA_PUBLIC_KEY=
```

Never commit real values. Use `.env.local` locally and host secrets in deployment platform.

## Integration boundaries

1. `createPaymentIntent(order)` — server only
2. `verifyWebhook(payload, signature)` — server only
3. `capture/refund` — admin/server jobs
4. Client receives redirect/session URL only — no secret keys

## BNPL rules

- Show Tabby/Tamara installment messaging only when API returns verified amounts
- Handle success/cancel/failure return URLs
- Webhook updates `Order.paymentStatus`

## Checkout UI (Phase 5+)

Payment methods render as selectable options. Unconfigured providers show as disabled with "Coming soon" — **never** fake "Pay now" success.

## Owner checklist

- [ ] Select primary card gateway (Mada-compatible)
- [ ] Complete merchant KYC / activation
- [ ] Tabby approval + keys
- [ ] Tamara approval + keys
- [ ] Confirm VAT invoice requirements on payment receipts
- [ ] Confirm test cards and staging URLs
