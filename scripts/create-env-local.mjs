#!/usr/bin/env node
/** Creates .env.local with placeholders — does not print secrets. */
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, ".env.local");

const authSecret = crypto.randomBytes(32).toString("base64url");

const template = `# Osool Altamaioz — local secrets (gitignored; never commit)
#
# 1. Replace REPLACE_WITH_DATABASE_PASSWORD with your Hostinger MySQL password.
# 2. If the password contains special URL characters (@ : / # % ? & +),
#    URL-encode them inside DATABASE_URL only (do not change the real password).
#    Example: p@ss becomes p%40ss
#

DATABASE_URL="mysql://u847758257_osooluser:REPLACE_WITH_DATABASE_PASSWORD@srv519.hstgr.io:3306/u847758257_osoolstore"
AUTH_SECRET="${authSecret}"
`;

if (fs.existsSync(target)) {
  const existing = fs.readFileSync(target, "utf8");
  if (existing.includes("REPLACE_WITH_DATABASE_PASSWORD")) {
    if (!existing.includes("AUTH_SECRET=")) {
      fs.writeFileSync(target, `${existing.trim()}\nAUTH_SECRET="${authSecret}"\n`, "utf8");
      console.log(".env.local updated with AUTH_SECRET — replace REPLACE_WITH_DATABASE_PASSWORD locally.");
    } else {
      console.log(".env.local already exists — replace REPLACE_WITH_DATABASE_PASSWORD locally.");
    }
  } else {
    console.log(".env.local already exists with a configured password — left unchanged.");
  }
} else {
  fs.writeFileSync(target, template, "utf8");
  console.log(".env.local created — replace REPLACE_WITH_DATABASE_PASSWORD locally.");
}
