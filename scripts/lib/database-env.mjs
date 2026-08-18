/**
 * Prepares DATABASE_URL for MySQL on Hostinger.
 * Resolves hostname to IPv4 — Hostinger IPv6 endpoint can reject auth while IPv4 works.
 * Never logs credentials.
 */
import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/** Load .env.local — .env.local always wins over existing process.env for DB keys. */
export function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return false;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
  return true;
}

function isIpv4(host) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/** Resolve MySQL host to IPv4 when needed. Returns same URL if already IP or non-MySQL. */
export async function resolveDatabaseUrlIpv4(rawUrl) {
  const url = new URL(rawUrl.trim());
  if (url.protocol !== "mysql:") return rawUrl;
  if (isIpv4(url.hostname)) return rawUrl;

  try {
    const [ipv4] = await dns.resolve4(url.hostname);
    if (ipv4) {
      url.hostname = ipv4;
      return url.toString();
    }
  } catch {
    // fall back to original hostname
  }
  return rawUrl;
}

let prepared = false;

/** Load .env.local and apply IPv4 resolution to DATABASE_URL once. */
export async function prepareDatabaseEnv() {
  if (prepared) return;
  loadEnvLocal();

  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return;

  process.env.DATABASE_URL = await resolveDatabaseUrlIpv4(raw);
  prepared = true;
}

export function parseDatabaseUrlSafe(rawUrl) {
  const issues = [];
  if (!rawUrl?.trim()) return { ok: false, issues: ["missing_url"] };

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, issues: ["malformed_url"] };
  }

  if (parsed.protocol !== "mysql:") issues.push("wrong_protocol");
  if (parsed.port !== "3306" && parsed.port !== "") issues.push("unexpected_port");
  if (!parsed.pathname || parsed.pathname === "/") issues.push("missing_database");
  if (!parsed.username) issues.push("missing_user");
  if (!parsed.password) issues.push("missing_password");
  if (/[\r\n]/.test(rawUrl)) issues.push("embedded_newline");

  return {
    ok: issues.length === 0,
    issues,
    host: parsed.hostname,
    port: parsed.port || "3306",
    database: parsed.pathname.replace(/^\//, ""),
    user: decodeURIComponent(parsed.username),
    hasPassword: Boolean(parsed.password),
  };
}

export function categorizeDatabaseError(message, errno) {
  if (errno === 1045 || /authentication failed|access denied/i.test(message))
    return "AUTHENTICATION_FAILED";
  if (errno === 1130 || /not allowed to connect|host is not allowed/i.test(message))
    return "REMOTE_HOST_NOT_ALLOWED";
  if (errno === 1049 || /unknown database/i.test(message)) return "DATABASE_NOT_FOUND";
  if (/enotfound|econnrefused|can't reach/i.test(message)) return "HOST_UNREACHABLE";
  if (/timed out|timeout|etimedout/i.test(message)) return "CONNECTION_TIMEOUT";
  if (/ssl|tls/i.test(message)) return "CONFIGURATION_ERROR";
  return "UNKNOWN_DATABASE_ERROR";
}
