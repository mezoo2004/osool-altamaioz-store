"use client";

import { useEffect, useState } from "react";
import { HomeImage } from "@/components/home/home-image";
import { getHomeImageSrc, homeImages } from "@/lib/home/home-images";
import { cn } from "@/lib/utils";

const HERO_VIDEO_MP4 = "/videos/home/hero.mp4";
const HERO_VIDEO_WEBM = "/videos/home/hero.webm";
const HERO_POSTER = "/images/home/hero/hero-poster.webp";

async function assetExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

type HeroVisualProps = {
  className?: string;
  priority?: boolean;
};

export function HeroVisual({ className, priority = true }: HeroVisualProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const poster = getHomeImageSrc(homeImages.hero);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (await assetExists(HERO_VIDEO_WEBM)) {
        if (!cancelled) setVideoSrc(HERO_VIDEO_WEBM);
        return;
      }
      if (await assetExists(HERO_VIDEO_MP4)) {
        if (!cancelled) setVideoSrc(HERO_VIDEO_MP4);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
