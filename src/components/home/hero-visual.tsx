"use client";

import { HomeImage } from "@/components/home/home-image";
import { getHomeImageSrc, homeImages } from "@/lib/home/home-images";
import { cn } from "@/lib/utils";

const HERO_POSTER = "/images/home/hero/hero-poster.webp";

type HeroVisualProps = {
  className?: string;
  priority?: boolean;
  /** Set on the server from filesystem; null uses cinematic image fallback. */
  videoSrc?: string | null;
};

export function HeroVisual({ className, priority = true, videoSrc = null }: HeroVisualProps) {
  const poster = getHomeImageSrc(homeImages.hero);

  return (
    <div className={cn("home-hero-visual-wrap relative h-full min-h-[inherit] overflow-hidden", className)}>
      {videoSrc ? (
        <video
          className="home-hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER.startsWith("/") ? HERO_POSTER : poster}
          aria-hidden="true"
        >
          <source src={videoSrc} type={videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      ) : (
        <>
          <HomeImage
            entry={homeImages.hero}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="home-hero-photo home-hero-ken-burns"
          />
          <div className="home-hero-shimmer pointer-events-none absolute inset-0" aria-hidden="true" />
        </>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/55 via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#080808]/70 lg:via-[#080808]/15 lg:to-transparent rtl:lg:bg-gradient-to-r"
        aria-hidden="true"
      />
      <div className="home-hero-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}
