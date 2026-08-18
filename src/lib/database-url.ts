/**
 * Prepares DATABASE_URL for MySQL (Hostinger IPv4 resolution).
 * Server-only — used before PrismaClient initialization.
 */
import dns from "node:dns/promises";

function isIpv4(host: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

export async function resolveDatabaseUrlIpv4(rawUrl: string): Promise<string> {
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
    // keep original hostname
  }
  return rawUrl;
}

let prepared = false;

export async function ensureDatabaseUrlPrepared(): Promise<void> {
  if (prepared) return;
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return;
  process.env.DATABASE_URL = await resolveDatabaseUrlIpv4(raw);
  prepared = true;
}
