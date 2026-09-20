const nationalDayCampaign = {
  enabled: true,
  startInstant: "2026-09-20T00:00:00+03:00",
  endExclusiveInstant: "2026-10-01T00:00:00+03:00",
};

function isNationalDayCampaignActive(now, campaign = nationalDayCampaign) {
  if (!campaign.enabled) return false;
  const t = now.getTime();
  const start = Date.parse(campaign.startInstant);
  const end = Date.parse(campaign.endExclusiveInstant);
  return t >= start && t < end;
}

function assert(label, condition) {
  if (!condition) {
    console.error("FAIL:", label);
    process.exitCode = 1;
  } else {
    console.log("PASS:", label);
  }
}

assert(
  "2026-09-30 23:59 Riyadh → active",
  isNationalDayCampaignActive(new Date("2026-09-30T23:59:59+03:00")),
);
assert(
  "2026-10-01 00:00 Riyadh → default hero",
  !isNationalDayCampaignActive(new Date("2026-10-01T00:00:00+03:00")),
);
assert(
  "before start → default hero",
  !isNationalDayCampaignActive(new Date("2026-09-19T23:59:59+03:00")),
);
