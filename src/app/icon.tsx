import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0a1f",
          borderRadius: 7,
        }}
      >
        <div style={{ position: "relative", width: 22, height: 28, display: "flex" }}>
          {/* Quill */}
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 14,
              width: 2,
              height: 16,
              borderRadius: 2,
              background: "linear-gradient(180deg, #2dd4bf 0%, #312e81 100%)",
            }}
          />
          {/* Outer eye ring */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 35%, #34d399 0%, #0d9488 55%, #134e4a 100%)",
              display: "flex",
            }}
          />
          {/* Mid eye ring */}
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 3,
              width: 14,
              height: 16,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 35%, #a5f3fc 0%, #0ea5e9 55%, #1e3a8a 100%)",
              display: "flex",
            }}
          />
          {/* Inner eye */}
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 6,
              width: 6,
              height: 8,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 30%, #f5d0fe 0%, #7e22ce 55%, #2e1065 100%)",
              display: "flex",
            }}
          />
          {/* Pupil */}
          <div
            style={{
              position: "absolute",
              left: 9.5,
              top: 8,
              width: 3,
              height: 4,
              borderRadius: "50%",
              background: "#0a0a0a",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
