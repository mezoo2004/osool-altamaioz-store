import fs from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "store");
const LINKS_FILE = path.join(STORE_DIR, "oauth-links.json");

export type OAuthLink = {
  provider: "google" | "apple";
  providerUserId: string;
  customerId: string;
  email: string;
  createdAt: string;
};

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(LINKS_FILE)) fs.writeFileSync(LINKS_FILE, "[]");
}

function readLinks(): OAuthLink[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(LINKS_FILE, "utf8")) as OAuthLink[];
}

function writeLinks(links: OAuthLink[]) {
  ensureStore();
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
}

export function findOAuthLink(provider: OAuthLink["provider"], providerUserId: string): OAuthLink | null {
  return readLinks().find((l) => l.provider === provider && l.providerUserId === providerUserId) ?? null;
}

export function upsertOAuthLink(link: Omit<OAuthLink, "createdAt"> & { createdAt?: string }) {
  const links = readLinks().filter(
    (l) => !(l.provider === link.provider && l.providerUserId === link.providerUserId),
  );
  links.push({
    ...link,
    createdAt: link.createdAt ?? new Date().toISOString(),
  });
  writeLinks(links);
}
