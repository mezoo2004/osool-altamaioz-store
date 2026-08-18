/** True when MySQL DATABASE_URL is configured for production storage. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Use Prisma at runtime when DATABASE_URL is set.
 * During `next build`, keep file/JSON repositories until schema is pushed.
 */
export function requiresDatabaseStorage(): boolean {
  if (!isDatabaseConfigured()) return false;
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return true;
}

export class DatabaseNotConfiguredError extends Error {
  constructor(message = "DATABASE_URL is not configured.") {
    super(message);
    this.name = "DatabaseNotConfiguredError";
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database is configured but unavailable.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function assertDatabaseConfigured(): void {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }
}
