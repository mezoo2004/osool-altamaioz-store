/**
 * Lighting Designer V2 — advisory test scenarios (run: npx tsx scripts/lighting-designer-tests.ts)
 */
import { estimateFixtureCount, calculateLumenRequirement } from "../src/lib/experience/lighting-lumen-engine";
import { buildLayerPlanV2 } from "../src/lib/experience/lighting-heuristics";

function runScenario(
  name: string,
  input: Parameters<typeof calculateLumenRequirement>[0],
) {
  const lumen = calculateLumenRequirement(input);
  const generalCount = estimateFixtureCount({
    spaceSlug: input.spaceSlug,
    area: lumen.area,
    layer: "general",
    requiredLumens: lumen.requiredLumens * 0.65,
    lumensPerFixture: 650,
  });
  const layers = buildLayerPlanV2(input, lumen, 650);
  const generalLayer = layers.find((l) => l.layer === "general");

  console.log(`\n=== ${name} ===`);
  console.log(`Area: ${lumen.area} m² | Volume: ${lumen.volume} m³`);
  console.log(`Target lux: ${lumen.targetLux} | Required lumens: ${lumen.requiredLumens}`);
  console.log(`Adjustment factor: ${lumen.adjustment.combinedFactor}`);
  console.log(`General fixtures (sanity): ${generalCount} (plan: ${generalLayer?.quantity})`);
  console.log(`Layers: ${layers.map((l) => `${l.layer}×${l.quantity}`).join(", ")}`);
  return { lumen, generalCount, layers };
}

// A) Bedroom 44 m², 3m ceiling, light walls, warm, 3000K
const bedroomA = runScenario("A — Bedroom 44m² warm", {
  spaceSlug: "bedroom",
  length: 8,
  width: 5.5,
  height: 3,
  wallColor: "very_light",
  mood: "warm",
  interiorStyle: "light",
  naturalLight: "medium",
  brightnessPreference: "standard",
});

if (bedroomA.generalCount < 4) {
  console.error("FAIL A: bedroom 44m² must not recommend only 1-3 general fixtures");
  process.exitCode = 1;
} else {
  console.log("PASS A: general count >= 4");
}

// B) Majlis 6×8m, 3.5m, beige, luxury
runScenario("B — Majlis 48m² luxury", {
  spaceSlug: "majlis",
  length: 8,
  width: 6,
  height: 3.5,
  wallColor: "beige",
  mood: "luxury",
});

// C) Kitchen 4×5m, white, functional, 4000K
runScenario("C — Kitchen 20m² functional", {
  spaceSlug: "kitchen",
  length: 5,
  width: 4,
  height: 2.8,
  wallColor: "very_light",
  mood: "functional",
});

// D) Office 5×6m, 3m, neutral, 4000K
runScenario("D — Office 30m² functional", {
  spaceSlug: "office",
  length: 6,
  width: 5,
  height: 3,
  wallColor: "light_gray",
  mood: "functional",
});

// E) Dark vs light wall comparison
const lightWall = runScenario("E-light — 30m² light walls", {
  spaceSlug: "living-room",
  length: 6,
  width: 5,
  height: 3,
  wallColor: "very_light",
  mood: "warm",
});
const darkWall = runScenario("E-dark — 30m² dark walls", {
  spaceSlug: "living-room",
  length: 6,
  width: 5,
  height: 3,
  wallColor: "dark_gray",
  mood: "warm",
  interiorStyle: "dark",
});

if (darkWall.lumen.requiredLumens <= lightWall.lumen.requiredLumens) {
  console.error("FAIL E: dark room should require more lumens than light room");
  process.exitCode = 1;
} else {
  console.log("PASS E: dark room lumens > light room");
}

console.log("\nDone.");
