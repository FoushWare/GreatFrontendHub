/**
 * Image optimization utilities
 * Stub implementation for useImageOptimization hook
 */

export function generateOptimizedImageUrl(
  src: string,
  _options: {
    quality?: number;
    format?: "webp" | "jpeg" | "png";
    width?: number;
    height?: number;
  },
): string {
  // Simplified implementation - return original src
  // In production, this would generate optimized URLs
  return src;
}

export function generateResponsiveSrcSet(
  src: string,
  baseWidth: number,
): string {
  // Generate responsive srcset for different screen sizes
  const widths = [baseWidth, baseWidth * 1.5, baseWidth * 2];
  return widths.map((w) => `${src}?w=${w} ${w}w`).join(", ");
}

export function generateSizesAttribute(): string {
  // Standard responsive sizes attribute
  return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
}

export function shouldPrioritizeImage(
  isAboveTheFold?: boolean,
  isHero?: boolean,
  isLogo?: boolean,
): boolean {
  // Prioritize images that are above the fold, hero images, or logos
  return Boolean(isAboveTheFold || isHero || isLogo);
}

export function getPreferredImageFormat(): string {
  // Check browser support for WebP
  if (typeof window !== "undefined") {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp")
      ? "webp"
      : "jpeg";
  }
  return "webp"; // Default to WebP
}
