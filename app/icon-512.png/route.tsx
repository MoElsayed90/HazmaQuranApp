import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 360,
          background: "#1B6B4A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FDFAF6",
          fontWeight: "bold",
          borderRadius: 96,
        }}
      >
        ح
      </div>
    ),
    { width: 512, height: 512 }
  );
}
