#!/usr/bin/env node
/**
 * Read-heavy load test (safe — no checkout writes).
 * Usage: node scripts/load-test-read.mjs [baseUrl] [durationSec] [connections]
 */
import autocannon from "autocannon";

const base = process.argv[2] ?? "http://localhost:3000";
const duration = Number(process.argv[3] ?? 30);
const connections = Number(process.argv[4] ?? 100);

const paths = ["/ar", "/en", "/ar/products", "/en/products", "/ar/offers", "/api/promotions/active"];

const instance = autocannon({
  url: base,
  connections,
  duration,
  pipelining: 1,
  timeout: 30,
  requests: paths.map((p) => ({ method: "GET", path: p })),
});

autocannon.track(instance, { renderProgressBar: true });

instance.on("done", (result) => {
  const out = {
    durationSec: duration,
    connections,
    requests: result.requests.total,
    throughputRps: result.requests.average,
    latencyAvgMs: result.latency.average,
    p95Ms: result.latency.p97_5 ?? result.latency.p95,
    p99Ms: result.latency.p99,
    errors: result.errors,
    non2xx: result.non2xx,
    timeOuts: result.timeouts,
  };
  console.log(JSON.stringify(out, null, 2));
});
