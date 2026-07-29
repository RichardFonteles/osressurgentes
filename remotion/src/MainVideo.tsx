import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SceneHero } from "./scenes/SceneHero";
import { SceneLimbo } from "./scenes/SceneLimbo";
import { SceneCorrentes } from "./scenes/SceneCorrentes";
import { SceneTravessia } from "./scenes/SceneTravessia";
import { SceneHorizonte } from "./scenes/SceneHorizonte";

const T = 20;

export const MainVideo = () => (
  <AbsoluteFill style={{ backgroundColor: "#0D0F0E" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={120}>
        <SceneHero />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={120}>
        <SceneLimbo />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={120}>
        <SceneCorrentes />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={120}>
        <SceneTravessia />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={180}>
        <SceneHorizonte />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
