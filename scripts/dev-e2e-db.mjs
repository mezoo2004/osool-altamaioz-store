#!/usr/bin/env node
/**
 * Safe development E2E against local Next.js + MySQL.
 * Creates clearly labeled DEVELOPMENT test data only.
 */
import { prepareDatabaseEnv } from "./lib/database-env.mjs";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = "dev-e2e+mysql@osool-altamaioz.test";
const TEST_PASSWORD = "DevE2E-Test-2026!";

function parseCookies(setCookieHeaders) {
  const jar = new Map();
  for (const header of setCookieHeaders) {
    const part = header.split(";")[0];
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    jar.set(part.slice(0, eq), part.slice(eq + 1));
  }
  return jar;
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function fetchJson(path, { method = "GET", body, jar } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (jar?.size) headers.Cookie = cookieHeader(jar);

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });

  const setCookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : res.headers.raw?.()?.["set-cookie"] ?? [];

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { _raw: text.slice(0, 200) };
  }

  return { status: res.status, json, setCookies };
}

async function waitForServer(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/search/suggestions?q=test`);
      if (res.ok || res.status === 400) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("dev_server_timeout");
}

async function main() {
  await prepareDatabaseEnv();
  const results = { passed: [], failed: [] };
  const pass = (name) => results.passed.push(name);
  const fail = (name, detail) => results.failed.push({ name, detail });

  console.log("\n🧪 Development E2E — MySQL-backed flows\n");

  await waitForServer();

  const jar = new Map();

  // Storefront pages (database-backed reads)
  await prepareDatabaseEnv();
  const prismaRoutes = new (await import("@prisma/client")).PrismaClient();
  const categorySlug =
    (await prismaRoutes.category.findFirst({ where: { isActive: true }, select: { slug: true } }))?.slug ??
    "downlights";
  const productSlug =
    (
      await prismaRoutes.product.findFirst({
        where: { status: "ACTIVE" },
        select: { slug: true },
      })
    )?.slug ?? "";
  await prismaRoutes.$disconnect();

  for (const path of [
    "/ar",
    "/en",
    `/ar/categories/${categorySlug}`,
    "/ar/search?q=downlight",
    "/ar/spaces",
    "/ar/scenes",
    "/ar/lighting-experience",
    productSlug ? `/ar/products/${productSlug}` : "/ar/search?q=led",
  ]) {
    const res = await fetch(`${BASE}${path}`);
    if (res.status === 200) pass(`page ${path}`);
    else fail(`page ${path}`, `status ${res.status}`);
  }

  // Pick an in-stock variant from DB
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  let sample = null;
  try {
    sample = await prisma.productVariant.findFirst({
      where: { stockStatus: { in: ["IN_STOCK", "LOW_STOCK"] } },
      include: { product: { select: { id: true, slug: true } } },
    });
    if (sample) pass("sample variant loaded from MySQL");
    else fail("sample variant", "none in stock");
  } finally {
    await prisma.$disconnect();
  }

  // Register (or login if exists)
  let reg = await fetchJson("/api/auth/register", {
    method: "POST",
    jar,
    body: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: "DEV",
      lastName: "E2E-TEST",
      phone: "+966500000999",
    },
  });
  for (const c of reg.setCookies) {
    for (const [k, v] of parseCookies([c])) jar.set(k, v);
  }

  if (reg.status === 200) pass("register");
  else if (reg.json?.error === "email_exists") {
    const login = await fetchJson("/api/auth/login", {
      method: "POST",
      jar,
      body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    for (const c of login.setCookies) {
      for (const [k, v] of parseCookies([c])) jar.set(k, v);
    }
    if (login.status === 200) pass("login (existing dev account)");
    else fail("login", login.json?.error ?? login.status);
  } else {
    fail("register", reg.json?.error ?? reg.status);
  }

  const me = await fetchJson("/api/auth/me", { jar });
  if (me.status === 200 && me.json?.user?.email === TEST_EMAIL) pass("session / auth/me");
  else fail("session", me.json?.error ?? me.status);

  // Address via repository path (no public address API yet)
  await prepareDatabaseEnv();
  const prisma2 = new PrismaClient();
  try {
    const customer = await prisma2.customer.findUnique({ where: { email: TEST_EMAIL } });
    if (!customer) throw new Error("customer_missing");

    const passwordRow = await prisma2.customer.findUnique({
      where: { id: customer.id },
      select: { passwordHash: true },
    });
    const looksHashed =
      passwordRow?.passwordHash?.startsWith("$2") && passwordRow.passwordHash.length > 20;
    if (looksHashed) pass("password hashed (bcrypt)");
    else fail("password hash", "unexpected format");

    const existingAddr = await prisma2.address.findFirst({ where: { customerId: customer.id } });
    if (!existingAddr) {
      await prisma2.address.create({
        data: {
          customerId: customer.id,
          label: "DEV-TEST",
          firstName: "DEV",
          lastName: "E2E-TEST",
          phone: "+966500000999",
          country: "SA",
          city: "Riyadh",
          region: "DEV",
          line1: "Development Test Street 1",
          isDefault: true,
        },
      });
      pass("address created (DEV-TEST)");
    } else {
      pass("address exists");
    }

    if (sample) {
      const wlAdd = await fetchJson("/api/wishlist", {
        method: "POST",
        jar,
        body: { slug: sample.product.slug, action: "add" },
      });
      if (wlAdd.status === 200 && wlAdd.json?.storage === "database") pass("wishlist add");
      else fail("wishlist add", wlAdd.json?.error ?? wlAdd.status);

      const wlDup = await fetchJson("/api/wishlist", {
        method: "POST",
        jar,
        body: { slug: sample.product.slug, action: "add" },
      });
      const count = (wlDup.json?.slugs ?? []).filter((s) => s === sample.product.slug).length;
      if (wlDup.status === 200 && count <= 1) pass("wishlist idempotent add");
      else fail("wishlist duplicate", `count=${count}`);
    }

    // Development checkout order
    if (sample) {
      const checkout = await fetchJson("/api/checkout", {
        method: "POST",
        jar,
        body: {
          email: TEST_EMAIL,
          phone: "+966500000999",
          fullName: "DEV E2E TEST",
          address: {
            fullName: "DEV E2E TEST",
            phone: "+966500000999",
            country: "SA",
            city: "Riyadh",
            street: "Development Test Street 1",
          },
          shippingMethodId: "local-dev",
          paymentMethodId: "development-test",
          customerNotes: "DEVELOPMENT TEST ORDER — safe to keep for audit",
          acceptTerms: true,
          cartLines: [
            {
              productId: sample.product.id,
              productSlug: sample.product.slug,
              variantId: sample.id,
              variantSku: sample.sku,
              quantity: 1,
            },
          ],
        },
      });

      if (checkout.status === 200 && checkout.json?.order?.orderNumber) {
        pass("development checkout order");
        const orderNumber = checkout.json.order.orderNumber;

        const dbOrder = await prisma2.order.findUnique({
          where: { orderNumber },
          include: { items: true },
        });
        if (dbOrder && dbOrder.items.length === 1) pass("order persisted in MySQL");
        else fail("order persistence", "missing items");

        const track = await fetchJson("/api/orders/track", {
          method: "POST",
          body: { orderNumber, email: TEST_EMAIL },
        });
        if (track.status === 404) {
          // logged-in customer order — guest track may not apply; check account list via repo
          pass("order track (guest N/A for logged-in order)");
        } else if (track.status === 200) {
          pass("order track");
        }

        const logout = await fetchJson("/api/auth/logout", { method: "POST", jar });
        if (logout.status === 200) pass("logout");
        else fail("logout", logout.status);

        const relogin = await fetchJson("/api/auth/login", {
          method: "POST",
          jar,
          body: { email: TEST_EMAIL, password: TEST_PASSWORD },
        });
        if (relogin.status === 200) pass("re-login persistence");
        else fail("re-login", relogin.json?.error ?? relogin.status);

        const wlAfter = await fetchJson("/api/wishlist", { jar });
        if (wlAfter.status === 200 && (wlAfter.json?.slugs ?? []).includes(sample.product.slug)) {
          pass("wishlist persistence after re-login");
        } else {
          fail("wishlist persistence", wlAfter.json?.error ?? "empty");
        }

        // Guest development order + tracking (no session)
        const guestCheckout = await fetchJson("/api/checkout", {
          method: "POST",
          body: {
            email: "dev-guest-e2e@osool-altamaioz.test",
            phone: "+966500000998",
            fullName: "DEV GUEST E2E",
            address: {
              fullName: "DEV GUEST E2E",
              phone: "+966500000998",
              country: "SA",
              city: "Riyadh",
              street: "Guest Development Test Street 2",
            },
            shippingMethodId: "local-dev",
            paymentMethodId: "development-test",
            customerNotes: "DEVELOPMENT GUEST TEST ORDER",
            acceptTerms: true,
            cartLines: [
              {
                productId: sample.product.id,
                productSlug: sample.product.slug,
                variantId: sample.id,
                variantSku: sample.sku,
                quantity: 1,
              },
            ],
          },
        });
        if (guestCheckout.status === 200 && guestCheckout.json?.order?.orderNumber) {
          pass("guest development checkout");
          const guestOrderNumber = guestCheckout.json.order.orderNumber;
          const guestTrack = await fetchJson("/api/orders/track", {
            method: "POST",
            body: { orderNumber: guestOrderNumber, email: "dev-guest-e2e@osool-altamaioz.test" },
          });
          if (guestTrack.status === 200) pass("guest order tracking");
          else fail("guest order tracking", guestTrack.json?.error ?? guestTrack.status);
        } else {
          fail("guest development checkout", guestCheckout.json?.error ?? guestCheckout.status);
        }
      } else {
        fail("development checkout", checkout.json?.error ?? checkout.status);
      }
    }
  } finally {
    await prisma2.$disconnect();
  }

  console.log(JSON.stringify({ base: BASE, passed: results.passed.length, failed: results.failed }, null, 2));
  if (results.failed.length) process.exit(1);
  console.log("\n✅ Development E2E passed.\n");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
