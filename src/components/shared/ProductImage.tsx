import { imageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

// Plain <img>: sources are storefront paths or S3 URLs and only shown as
// small previews, so next/image's optimizer isn't worth the config.
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return <div className={cn("bg-muted", className)} aria-hidden />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imageUrl(src)} alt={alt} className={cn("bg-muted object-cover", className)} loading="lazy" />;
}
