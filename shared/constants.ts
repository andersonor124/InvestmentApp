import type { RiskProfile, Weights } from "./types.js";

/** Score cut-offs for the pick labels (shared so the UI's methodology text matches the server). */
export const LABEL_THRESHOLDS = { considerBuying: 68, watch: 55 };

/** Factor weights for each investor risk profile (must each sum to 1). */
export const PROFILE_WEIGHTS: Record<RiskProfile, Weights> = {
  conservative: { value: 0.3, growth: 0.15, quality: 0.2, health: 0.25, momentum: 0.1 },
  balanced: { value: 0.25, growth: 0.25, quality: 0.2, health: 0.15, momentum: 0.15 },
  aggressive: { value: 0.15, growth: 0.35, quality: 0.15, health: 0.1, momentum: 0.25 },
};
