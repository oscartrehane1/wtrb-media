import { ImageResponse } from "next/og";

export const alt = "WtRB Media — Stories Made Outside";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", background: "#101312", color: "#F3F0E9", fontFamily: "serif" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", fontSize: "32px" }}>WtRB <span style={{ fontFamily: "sans-serif", fontSize: "15px", letterSpacing: "5px", textTransform: "uppercase" }}>Media</span></div>
      <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#B1A08C", fontFamily: "sans-serif", fontSize: "16px", letterSpacing: "4px", textTransform: "uppercase" }}>Outdoor film & photography</span><span style={{ fontSize: "96px", lineHeight: 0.95, letterSpacing: "-5px" }}>Stories Made Outside.</span></div>
    </div>,
    size,
  );
}
