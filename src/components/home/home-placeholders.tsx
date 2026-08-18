import { cn } from "@/lib/utils";

/** Hero architectural room with ceiling planes, directional beam, and warm glow */
export function HeroArchitecturalVisual({ className }: { className?: string }) {
  return (
    <div className={cn("home-hero-visual", className)} aria-hidden="true">
      <div className="home-hero-visual-room">
        <div className="home-hero-visual-ceiling" />
        <div className="home-hero-visual-wall-left" />
        <div className="home-hero-visual-wall-right" />
        <div className="home-hero-visual-floor" />
        <div className="home-hero-visual-beam" />
        <div className="home-hero-visual-glow" />
        <div className="home-hero-visual-fixture" />
        <div className="home-hero-visual-furniture" />
      </div>
      <div className="home-hero-visual-edge" />
    </div>
  );
}

/** Full room scene with depth planes and light sources for Shop The Scene */
export function SceneArchitecturalVisual({ className }: { className?: string }) {
  return (
    <div className={cn("home-scene-visual", className)} aria-hidden="true">
      <div className="home-scene-visual-back-wall" />
      <div className="home-scene-visual-side-wall" />
      <div className="home-scene-visual-floor" />
      <div className="home-scene-visual-ceiling" />
      <div className="home-scene-visual-light-main" />
      <div className="home-scene-visual-light-accent" />
      <div className="home-scene-visual-falloff" />
      <div className="home-scene-visual-seating" />
    </div>
  );
}

const spaceThemes: Record<
  string,
  { glow: string; accent: string; className: string }
> = {
  majlis: {
    glow: "radial-gradient(ellipse 70% 55% at 50% 75%, rgba(234,90,45,0.22) 0%, transparent 70%)",
    accent: "#c4a574",
    className: "home-space-majlis",
  },
  living: {
    glow: "radial-gradient(ellipse 60% 50% at 40% 30%, rgba(255,240,220,0.18) 0%, transparent 65%)",
    accent: "#9a9590",
    className: "home-space-living",
  },
  bedroom: {
    glow: "radial-gradient(ellipse 50% 45% at 75% 35%, rgba(255,230,200,0.15) 0%, transparent 60%)",
    accent: "#8a8580",
    className: "home-space-bedroom",
  },
  kitchen: {
    glow: "radial-gradient(ellipse 80% 30% at 50% 15%, rgba(255,255,240,0.2) 0%, transparent 70%)",
    accent: "#b8b5b0",
    className: "home-space-kitchen",
  },
  office: {
    glow: "radial-gradient(ellipse 70% 40% at 50% 12%, rgba(240,245,255,0.16) 0%, transparent 65%)",
    accent: "#7a7d80",
    className: "home-space-office",
  },
  restaurant: {
    glow: "radial-gradient(ellipse 45% 55% at 30% 25%, rgba(234,90,45,0.14) 0%, transparent 60%), radial-gradient(ellipse 45% 55% at 70% 25%, rgba(234,90,45,0.14) 0%, transparent 60%)",
    accent: "#a89070",
    className: "home-space-restaurant",
  },
  retail: {
    glow: "radial-gradient(ellipse 90% 35% at 50% 8%, rgba(255,255,255,0.14) 0%, transparent 70%)",
    accent: "#909498",
    className: "home-space-retail",
  },
  facade: {
    glow: "radial-gradient(ellipse 60% 70% at 50% 90%, rgba(234,90,45,0.2) 0%, transparent 65%)",
    accent: "#6d6f72",
    className: "home-space-facade",
  },
  garden: {
    glow: "radial-gradient(ellipse 70% 50% at 50% 85%, rgba(180,200,160,0.12) 0%, transparent 65%)",
    accent: "#5a6b52",
    className: "home-space-garden",
  },
};

export function SpaceArchitecturalVisual({
  spaceKey,
  className,
  featured = false,
}: {
  spaceKey: string;
  className?: string;
  featured?: boolean;
}) {
  const theme = spaceThemes[spaceKey] ?? spaceThemes.majlis;

  return (
    <div
      className={cn("home-space-visual", theme.className, featured && "home-space-visual-featured", className)}
      style={{ "--space-glow": theme.glow, "--space-accent": theme.accent } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="home-space-visual-base" />
      <div className="home-space-visual-glow" />
      <div className="home-space-visual-geometry" />
    </div>
  );
}
