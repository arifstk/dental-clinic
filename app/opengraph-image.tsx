// app/opengraph-image.tsx

import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/settings";

export const alt = "Online dental appointment booking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const s = await getSiteSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0f4c81", // TODO: match primary-700
          color: "white",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, display: "flex" }}>
          {s.name}
        </div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.9, display: "flex" }}>
          Book your dental appointment online
        </div>
      </div>
    ),
    { ...size },
  );
}