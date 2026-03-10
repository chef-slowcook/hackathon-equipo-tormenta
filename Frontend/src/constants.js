/**
 * Shared constants for forecast labels, colors, and horizons.
 * Single source of truth — all components import from here.
 */

export const FORECAST_HORIZONS = ["1h", "3h", "6h"];

/** Maps precipitation class (0/1/2) to human-readable labels. */
export const CLASS_LABELS = ["No rain", "Light rain", "Heavy rain"];

/** Maps precipitation class (0/1/2) to CSS color variables. */
export const CLASS_COLORS = [
  "var(--color-healthy)",
  "var(--color-degraded)",
  "var(--color-heavy-rain)",
];
