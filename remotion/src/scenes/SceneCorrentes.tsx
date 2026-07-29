import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { serif, sans } from "../fonts";

const items = ["Aprovação", "Comparação", "Medo do julgamento", "A vida do outro"];

export const SceneCorrentes = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <Img src={staticFile("images/moss.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(4px)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(13,15,14,0.85), rgba(24,39,31,0.9))" }} />
      <AbsoluteFill style={{ padding: "120px 140px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          opacity: interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: sans, color: "#A68A55", letterSpacing: "0.4em", fontSize: 16, textTransform: "uppercase", marginBottom: 32,
        }}>
          II · Correntes Invisíveis
        </div>
        <div style={{
          opacity: interpolate(f, [15, 45], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: serif, fontWeight: 400, fontSize: 78, color: "#F0EADF", lineHeight: 1.15, maxWidth: 1300, marginBottom: 70,
        }}>
          O que ainda te prende?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {items.map((label, i) => {
            const start = 40 + i * 12;
            const o = interpolate(f, [start, start + 25], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(f, [start, start + 25], [30, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                opacity: o, transform: `translateY(${y}px)`,
                border: "1px solid rgba(166,138,85,0.35)", padding: "40px 28px",
                background: "rgba(13,15,14,0.5)",
              }}>
                <div style={{ fontFamily: sans, color: "#A68A55", fontSize: 14, letterSpacing: "0.3em", marginBottom: 16 }}>
                  0{i + 1}
                </div>
                <div style={{ fontFamily: serif, color: "#F0EADF", fontSize: 34, lineHeight: 1.2 }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
