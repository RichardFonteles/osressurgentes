import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { serif, sans } from "../fonts";

export const SceneTravessia = () => {
  const f = useCurrentFrame();
  const imgO = interpolate(f, [0, 35], [0, 1], { extrapolateRight: "clamp" });
  const imgS = interpolate(f, [0, 120], [1.05, 1.12]);
  const textO = interpolate(f, [25, 55], [0, 1], { extrapolateRight: "clamp" });
  const textX = interpolate(f, [25, 55], [30, 0], { extrapolateRight: "clamp" });
  const quoteO = interpolate(f, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0D0F0E", display: "flex", flexDirection: "row" }}>
      <div style={{ width: "50%", height: "100%", overflow: "hidden", position: "relative", opacity: imgO }}>
        <Img src={staticFile("images/mentor.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${imgS})` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, #0D0F0E)" }} />
      </div>
      <div style={{ width: "50%", padding: "0 100px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          opacity: textO, transform: `translateX(${textX}px)`,
          fontFamily: sans, color: "#A68A55", letterSpacing: "0.4em", fontSize: 16, textTransform: "uppercase", marginBottom: 28,
        }}>
          III · A Travessia
        </div>
        <div style={{
          opacity: textO, transform: `translateX(${textX}px)`,
          fontFamily: serif, fontWeight: 400, fontSize: 78, color: "#F0EADF", lineHeight: 1.1, marginBottom: 32,
        }}>
          Do peso<br />ao passo firme.
        </div>
        <div style={{
          opacity: quoteO,
          fontFamily: serif, fontStyle: "italic", fontSize: 28, color: "#C9B99A", lineHeight: 1.5, maxWidth: 640,
          paddingLeft: 24, borderLeft: "1px solid #A68A55",
        }}>
          Não se atravessa uma floresta<br />sem olhar a própria sombra.
        </div>
      </div>
    </AbsoluteFill>
  );
};
