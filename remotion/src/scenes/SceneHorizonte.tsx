import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { serif, sans } from "../fonts";

export const SceneHorizonte = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(f, [0, 180], [1.15, 1.0]);
  const eyebrowO = interpolate(f, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const titleSpring = spring({ frame: f - 30, fps, config: { damping: 200 } });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const ruleW = interpolate(f, [70, 110], [0, 180], { extrapolateRight: "clamp" });
  const logoO = interpolate(f, [90, 125], [0, 1], { extrapolateRight: "clamp" });
  const ctaO = interpolate(f, [125, 160], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img src={staticFile("images/horizon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: "linear-gradient(180deg, rgba(13,15,14,0.35) 0%, rgba(13,15,14,0.55) 60%, rgba(13,15,14,0.9) 100%)",
      }} />
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 80, textAlign: "center" }}>
        <div style={{
          opacity: eyebrowO,
          fontFamily: sans, color: "#C9B99A", letterSpacing: "0.42em", fontSize: 18, textTransform: "uppercase", marginBottom: 40,
        }}>
          A travessia começa aqui
        </div>

        <Img src={staticFile("images/logo.png")} style={{
          opacity: logoO,
          width: 140, height: "auto", marginBottom: 32,
          filter: "brightness(0) invert(1)",
        }} />

        <h1 style={{
          opacity: titleSpring, transform: `translateY(${titleY}px)`,
          fontFamily: serif, fontWeight: 400, fontSize: 160, color: "#F0EADF",
          margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
        }}>
          Os Ressurgentes
        </h1>

        <div style={{ height: 1, width: ruleW, background: "#A68A55", margin: "40px 0" }} />

        <p style={{
          opacity: ctaO,
          fontFamily: serif, fontStyle: "italic", fontSize: 32, color: "#F0EADF", maxWidth: 900, lineHeight: 1.4, margin: 0,
        }}>
          Uma mentoria para homens que decidem<br />atravessar a própria floresta.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
