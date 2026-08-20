"use client";

import { HomeImage } from "@/components/home/home-image";
import {
  ambientRoomTint,
  buildHotspotPreviewState,
  cctToHex,
  hotspotOpacity,
  hotspotSpreadPercent,
  normalizeCct,
  type ScenePreviewState,
} from "@/lib/experience/scene-preview";
import { getSpaceImageEntry } from "@/lib/experience/space-images";
import type { CctChoice } from "@/lib/experience/types";
import { cn } from "@/lib/utils";

type HotspotPreviewInput = {
  id: string;
  x: number;
  y: number;
  label: string;
  cct: string | null | undefined;
  wattage: string | null | undefined;
  categorySlug?: string;
};

type ScenePreviewStageProps = {
  spaceSlug: string;
  hotspots: HotspotPreviewInput[];
  activeHotspotId: string;
  previewCct: CctChoice;
  onHotspotClick: (id: string) => void;
};

export function ScenePreviewStage({
  spaceSlug,
  hotspots,
  activeHotspotId,
  previewCct,
  onHotspotClick,
}: ScenePreviewStageProps) {
  const imageEntry = getSpaceImageEntry(spaceSlug);
  const activeState = hotspots.find((h) => h.id === activeHotspotId);

  const previewStates = hotspots.map((hotspot) => {
    const isActive = hotspot.id === activeHotspotId;
    const cct = isActive ? previewCct : normalizeCct(hotspot.cct);
    return {
      hotspot,
      state: buildHotspotPreviewState({
        cct,
        wattage: hotspot.wattage,
        label: hotspot.label,
        categorySlug: hotspot.categorySlug,
        isActive,
      }),
    };
  });

  return (
    <div className="scene-preview-stage relative overflow-hidden rounded-xl border border-white/10 bg-[#080808]">
      <div className="relative aspect-[4/3] w-full md:aspect-[16/10]">
        <HomeImage
          entry={imageEntry}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="scale-[1.02] brightness-[0.72] contrast-[1.05] saturate-[0.92]"
        />

        <div
          className="pointer-events-none absolute inset-0 transition-colors duration-700 motion-reduce:transition-none"
          style={{ backgroundColor: ambientRoomTint(previewCct, activeState ? 1 : 0.6) }}
          aria-hidden="true"
        />

        {previewStates.map(({ hotspot, state }) => (
          <HotspotGlow key={hotspot.id} x={hotspot.x} y={hotspot.y} state={state} />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" aria-hidden="true" />

        {hotspots.map((hotspot) => {
          const isActive = hotspot.id === activeHotspotId;
          return (
            <button
              key={hotspot.id}
              type="button"
              aria-label={hotspot.label}
              aria-pressed={isActive}
              onClick={() => onHotspotClick(hotspot.id)}
              className={cn(
                "absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-300 motion-reduce:transition-none",
                "h-11 w-11 md:h-9 md:w-9",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange",
              )}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            >
              <span
                className={cn(
                  "scene-hotspot-pulse rounded-full border-2 transition-all duration-300 motion-reduce:transition-none",
                  isActive
                    ? "h-3.5 w-3.5 border-white bg-brand-orange shadow-[0_0_0_6px_rgba(234,90,45,0.28)]"
                    : "h-2.5 w-2.5 border-white/90 bg-white/25 hover:bg-white/50",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HotspotGlow({ x, y, state }: { x: number; y: number; state: ScenePreviewState }) {
  const spread = hotspotSpreadPercent(state);
  const opacity = hotspotOpacity(state);
  const color = cctToHex(state.cct);

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 motion-reduce:transition-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${spread * 2}%`,
        height: `${spread * 2}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 72%)`,
        opacity,
        filter: state.isActive ? "blur(8px)" : "blur(12px)",
      }}
      aria-hidden="true"
    />
  );
}
