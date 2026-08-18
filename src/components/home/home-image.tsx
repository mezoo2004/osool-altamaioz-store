import Image, { type ImageProps } from "next/image";
import { getHomeImageSrc } from "@/lib/home/home-images";
import { cn } from "@/lib/utils";

type HomeImageProps = Omit<ImageProps, "src"> & {
  entry: { src: string; local: string };
  preferLocal?: boolean;
};

/** Replaceable homepage imagery — swap `local` paths when official photography arrives. */
export function HomeImage({ entry, preferLocal = false, className, alt, ...props }: HomeImageProps) {
  return (
    <Image
      src={getHomeImageSrc(entry, preferLocal)}
      alt={alt}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}
