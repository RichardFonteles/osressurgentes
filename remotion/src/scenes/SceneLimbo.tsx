import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { serif, sans } from "../fonts";

const lines = [
  "Você acordou perdido,",
  "mas não sabe quando adormeceu.",
];

export const SceneLimbo = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #18271F 0%, #0D0F0E 70%)" }}>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 100 }}>
        <div style={{
          opacity: interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: sans, color: "#A68A55", letterSpacing: "0.4em", fontSize: 16, textTransform: "uppercase", marginBottom: 60,
        }}>
          I · O Limbo
        </div>
        {lines.map((line, i) => {
          const start = 25 + i * 25;
          const o = interpolate(f, [start, start + 25], [0, 1], { extrapolateRight: "clamp" });
          const y = interpolate(f, [start, start + 25], [20, 0], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              opacity: o, transform: `translateY(${y}px)`,
              fontFamily: serif, fontStyle: "italic", fontWeight: 300, fontSize: 88, color: "#F0EADF",
              textAlign: "center", lineHeight: 1.25, maxWidth: 1400,
            }}>
              {line}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
