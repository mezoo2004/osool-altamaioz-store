import type { LucideProps } from "lucide-react";
import {
  ArrowRight,
  Cable,
  Fan,
  Home,
  Lamp,
  LampCeiling,
  LampFloor,
  PanelTop,
  Smartphone,
  Spotlight,
  Tag,
  ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STROKE = 1.5;

export type HomeIconType =
  | "indoor"
  | "outdoor"
  | "decorative"
  | "offers"
  | "spot"
  | "profile"
  | "smart"
  | "strip"
  | "switch"
  | "fan";

const iconMap: Record<HomeIconType, React.ComponentType<LucideProps>> = {
  indoor: Home,
  outdoor: LampFloor,
  decorative: LampCeiling,
  offers: Tag,
  spot: Spotlight,
  profile: PanelTop,
  smart: Smartphone,
  strip: Cable,
  switch: ToggleLeft,
  fan: Fan,
};

export function HomeCategoryIcon({
  type,
  className,
  strokeWidth = STROKE,
}: {
  type: HomeIconType | string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = iconMap[type as HomeIconType] ?? Lamp;
  return <Icon className={cn("shrink-0", className)} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function HomeArrowIcon({ className }: { className?: string }) {
  return <ArrowRight className={cn("h-4 w-4", className)} strokeWidth={STROKE} aria-hidden="true" />;
}
