import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { serif, sans } from "../fonts";

export const SceneHero = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 120], [1.08, 1.18]);
  const eyebrowO = interpolate(f, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const titleO = interpolate(f, [30, 70], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(f, [30, 70], [24, 0], { extrapolateRight: "clamp" });
  const subO = interpolate(f, [60, 95], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img src={staticFile("images/hero-forest.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(47,79,58,0.35), transparent 60%), linear-gradient(180deg, rgba(13,15,14,0.55) 0%, rgba(13,15,14,0.85) 100%)",
      }} />
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 80, textAlign: "center" }}>
        <div style={{ opacity: eyebrowO, fontFamily: sans, color: "#C9B99A", letterSpacing: "0.42em", fontSize: 20, textTransform: "uppercase", marginBottom: 40 }}>
          <span style={{ display: "inline-block", width: 48, height: 1, background: "#A68A55", verticalAlign: "middle", marginRight: 24 }} />
          Uma travessia
          <span style={{ display: "inline-block", width: 48, height: 1, background: "#A68A55", verticalAlign: "middle", marginLeft: 24 }} />
        </div>
        <h1 style={{ opacity: titleO, transform: `translateY(${titleY}px)`, fontFamily: serif, fontWeight: 400, fontSize: 180, color: "#F0EADF", lineHeight: 1, margin: 0, letterSpacing: "-0.02em" }}>
          Os Ressurgentes
        </h1>
        <p style={{ opacity: subO, fontFamily: serif, fontStyle: "italic", fontSize: 34, color: "#F0EADF", marginTop: 36, maxWidth: 900, lineHeight: 1.4 }}>
          Do limbo à travessia. Do peso ao passo firme.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
