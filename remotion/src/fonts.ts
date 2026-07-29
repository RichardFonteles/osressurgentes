import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

export const { fontFamily: serif } = loadSerif("normal", {
  weights: ["300", "400", "500"],
  subsets: ["latin"],
});
export const { fontFamily: sans } = loadSans("normal", {
  weights: ["300", "400", "500"],
  subsets: ["latin"],
});
