import Image from "next/image";
import { cn } from "@/lib/utils";

type CatalogProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function CatalogProductImage({ src, alt, className, priority = false }: CatalogProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
      className={cn("object-cover", className)}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
