# UI Polish Checklist

Last updated: FINAL UI/UX POLISH — PART 2 COMPLETE (Aug 2026)

---

## Part 1 — Core storefront (DONE)

Scope: Header, Mega Menu, Mobile Menu, Search, Homepage, Product Cards, PLP, PDP, Cart, Checkout, Mobile Bottom Nav, Footer.

See git history / prior checklist entries for Part 1 item detail. All Part 1 areas marked DONE except manual responsive QA items.

---

## Part 2 — Content, account, experience, errors (DONE)

| Area | Status | Notes |
|------|--------|-------|
| About | DONE | Content shell, readable width, RTL arrows |
| Contact | DONE | Premium form, channel hierarchy |
| FAQ | DONE | Accordion spacing, hover/focus |
| Projects | DONE | Portfolio grid, empty state |
| Policies (5 slugs) | DONE | Reading template, TOC, max-width prose |
| Account Overview | DONE | Sub-nav, link cards |
| Profile | DONE | Account shell, dl layout |
| Addresses | DONE | Empty state, address cards |
| Orders list | DONE | Order cards, empty state |
| Order detail | DONE | Timeline, status badge, totals |
| Order tracking | DONE | Lookup form, detail view |
| Login / Register | DONE | Centered auth, password toggle, forgot link |
| Forgot Password | DONE | Placeholder shell |
| Wishlist | DONE | PLP-level grid, skeleton, empty state |
| Shop By Space index | DONE | Editorial hero, space cards |
| Space detail | DONE | CTA sidebar, tips, related scenes |
| Shop The Scene index | DONE | Filter pills, cinematic cards |
| Scene detail | DONE | Elegant hotspots, mobile bottom sheet, bundle modal |
| Lighting Experience (5 steps) | DONE | Progress line, mood/CCT cards, recommendations |
| Order confirmation | DONE | Success hierarchy, CTAs |
| 404 / error / global-error | DONE | Unified empty-state language |
| Loading skeletons | DONE | Content + experience fallbacks |

---

## Shared Part 2 components added

| Component | Purpose |
|-----------|---------|
| `content-page-shell.tsx` | Unified hero + breadcrumb + sections |
| `account-page-shell.tsx` | Account sub-navigation |
| `empty-state.tsx` | Reusable empty states |
| `accordion.tsx` | FAQ accordion polish |

---

## Responsive QA (manual — both parts)

| Breakpoint | AR RTL | EN LTR | Code audit fixes applied |
|------------|--------|--------|--------------------------|
| ~390px | PASS (code) | PASS (code) | Safe-area offsets, drawer width, logo truncate, touch targets |
| ~768px | PASS (code) | PASS (code) | Order timeline word-break, scene/pdp sticky spacing |
| ~1024px | PASS (code) | PASS (code) | No blocking issues found in layout logic |
| ~1440px | PASS (code) | PASS (code) | Container max-width unchanged |

### QA pass fixes (Aug 2026)

- [x] `overflow-x: clip` on html/body — prevents drawer animation horizontal scroll
- [x] Safe-area-aware `--bottom-mobile-nav` offset for PDP sticky bar + scene bottom sheet
- [x] Unified mobile bottom padding utilities (`pb-mobile-nav`, `pb-mobile-sticky-extra`, `pb-mobile-scene-extra`)
- [x] PDP mobile sticky bar clearance separated from main nav padding (no double-count)
- [x] Scene mobile panel max-height + scroll when expanded (prevents full-screen overlap)
- [x] Scene bundle modal max-height + scroll on small viewports
- [x] Mobile menu + PLP filter drawer full-width at 390px with RTL slide direction preserved
- [x] Logo truncate on narrow header row (390px crowding)
- [x] Icon buttons 44px on mobile (md: 40px)
- [x] Form inputs 16px on mobile (prevents iOS zoom)
- [x] Heading/eyebrow word-break for long Arabic strings
- [x] Order tracking timeline word-break in Arabic labels
- [x] Lighting Experience progress scroll hidden overflow on mobile
- [x] Account sub-nav horizontal scroll padding

### Still requires browser confirmation

- [ ] Live device pass on iPhone safe-area + Android Chrome
- [ ] Figma pixel alignment (out of scope)

---

## Arabic / English

| Item | Status |
|------|--------|
| RTL breadcrumbs / arrows | DONE |
| Account sub-nav RTL scroll | DONE |
| Scene mobile bottom sheet | DONE |
| Experience progress RTL | DONE |
| Form labels RTL pass | DONE (code audit) |

---

## DEFERRED UNTIL IMAGES

- Content/experience hero photography
- Projects portfolio photography
- Scene room photography
- Space editorial images
- Product images (all surfaces)

---

## DEFERRED UNTIL PRICES

- Official price display with real amounts
- Order/checkout totals with confirmed pricing

---

## Quality gate

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
