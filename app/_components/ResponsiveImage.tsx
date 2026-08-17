import type { ImgHTMLAttributes } from "react";

const wixFillPattern = /\/fill\/w_(\d+)%2Ch_(\d+)%2C/;
const responsiveWidths = [480, 768, 1024, 1280, 1600, 1920];

function wixVariant(source: string, width: number, sourceWidth: number, sourceHeight: number) {
  const targetWidth = Math.min(width, sourceWidth);
  const targetHeight = Math.round(targetWidth * sourceHeight / sourceWidth);
  return source
    .replace(wixFillPattern, `/fill/w_${targetWidth}%2Ch_${targetHeight}%2C`)
    .replace(/q_\d+/, "q_86");
}

export function ResponsiveImage({ src, alt = "", loading = "lazy", decoding = "async", sizes = "100vw", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string") return <img {...props} src={src} alt={alt} loading={loading} decoding={decoding} />;
  const match = src.match(wixFillPattern);
  if (!match) return <img {...props} src={src} alt={alt} loading={loading} decoding={decoding} />;

  const sourceWidth = Number(match[1]);
  const sourceHeight = Number(match[2]);
  const widths = [...new Set([...responsiveWidths.filter((width) => width < sourceWidth), sourceWidth])];
  const optimizedSource = wixVariant(src, sourceWidth, sourceWidth, sourceHeight);
  const srcSet = widths.map((width) => `${wixVariant(src, width, sourceWidth, sourceHeight)} ${width}w`).join(", ");

  return <img {...props} src={optimizedSource} srcSet={srcSet} sizes={sizes} alt={alt} loading={loading} decoding={decoding} />;
}
