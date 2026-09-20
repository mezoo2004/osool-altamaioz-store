/**
 * Temporary Saudi National Day homepage campaign (Asia/Riyadh boundaries).
 * Auto-expires 2026-10-01 00:00:00 +03:00 — no manual code change required.
 */

export type SaudiNationalDayCampaign = {
  id: string;
  enabled: boolean;
  /** Inclusive start (Asia/Riyadh offset fixed in ISO string). */
  startInstant: string;
  /** Exclusive end — default hero returns from this instant. */
  endExclusiveInstant: string;
};

export const nationalDayCampaign: SaudiNationalDayCampaign = {
  id: "saudi-national-day-2026",
  enabled: true,
  startInstant: "2026-09-20T00:00:00+03:00",
  endExclusiveInstant: "2026-10-01T00:00:00+03:00",
};

/** @param now — inject for tests; defaults to current instant (UTC-safe comparison). */
export function isNationalDayCampaignActive(
  now: Date = new Date(),
  campaign: SaudiNationalDayCampaign = nationalDayCampaign,
): boolean {
  if (!campaign.enabled) return false;
  const t = now.getTime();
  const start = Date.parse(campaign.startInstant);
  const end = Date.parse(campaign.endExclusiveInstant);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return t >= start && t < end;
}

/** Human-readable end of active window in Riyadh (last active second). */
export const nationalDayCampaignEndLabel = "2026-09-30T23:59:59+03:00";
