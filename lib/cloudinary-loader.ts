// lib/cloudinary-loader.ts

type LoaderArgs = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs) {
  // Local files and full URLs are returned as they are
  if (src.startsWith("/") || src.startsWith("http")) return src;

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${quality ?? "auto"},c_limit,w_${width}/${src}`;
}
