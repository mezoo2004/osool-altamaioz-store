"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { HOME_IMAGE_FALLBACK, getHomeImageSrc, type HomeImageEntry } from "@/lib/home/home-images";
import { cn } from "@/lib/utils";

type HomeImageProps = Omit<ImageProps, "src"> & {
  entry: HomeImageEntry;
  preferLocal?: boolean;
};

/** Replaceable homepage imagery with graceful remote fallback — never shows broken icons. */
export function HomeImage({ entry, preferLocal = false, className, alt, style, ...props }: HomeImageProps) {
  const primary = getHomeImageSrc(entry, preferLocal);
  const [src, setSrc] = useState(primary);

  const handleError = useCallback(() => {
    setSrc((current) => {
      if (current === entry.fallback) return HOME_IMAGE_FALLBACK;
      if (current === HOME_IMAGE_FALLBACK) return current;
      return entry.fallback;
    });
  }, [entry.fallback]);

  return (
    <Image
      src={src}
      alt={alt}
      onError={handleError}
      className={cn("object-cover home-space-photo", className)}
      style={{
        objectPosition: entry.objectPosition ?? "center center",
        ...style,
      }}
      {...props}
    />
  );
}
