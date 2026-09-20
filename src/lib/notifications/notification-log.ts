import fs from "node:fs";
import path from "node:path";

export type NotificationChannel = "email" | "whatsapp";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export type NotificationLogEntry = {
  orderNumber: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  updatedAt: string;
  detail?: string;
};

const STORE_DIR = path.join(process.cwd(), "data", "store");
const LOG_FILE = path.join(STORE_DIR, "notification-log.json");

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "[]");
}

function readLog(): NotificationLogEntry[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(LOG_FILE, "utf8")) as NotificationLogEntry[];
}

function writeLog(entries: NotificationLogEntry[]) {
  ensureStore();
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2));
}

export function getNotificationEntry(
  orderNumber: string,
  channel: NotificationChannel,
): NotificationLogEntry | null {
  return readLog().find((e) => e.orderNumber === orderNumber && e.channel === channel) ?? null;
}

export function upsertNotificationEntry(entry: NotificationLogEntry) {
  const entries = readLog().filter(
    (e) => !(e.orderNumber === entry.orderNumber && e.channel === entry.channel),
  );
  entries.push(entry);
  writeLog(entries);
}

export function wasNotificationSent(orderNumber: string, channel: NotificationChannel): boolean {
  const entry = getNotificationEntry(orderNumber, channel);
  return entry?.status === "SENT";
}
