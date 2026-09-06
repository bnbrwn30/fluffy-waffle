/**
 * The single motion system for the whole site.
 *
 * Every animation — GSAP, Motion, or plain CSS — pulls its easing and duration
 * from here. Mixing library defaults (spring vs power2 vs ease) is the main
 * reason a page reads as assembled from parts rather than authored by one hand.
 */

/** The one curve. Expo-out: fast departure, long graceful settle. */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
/** GSAP needs its own string form of the same curve. */
export const EASE_GSAP = "expo.out";

/** Three durations, in seconds. Nothing on the page uses a fourth. */
export const DUR = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
} as const;

/** Stagger steps, kept proportional to the duration scale. */
export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

/** Motion-library transition presets, so components never hand-roll one. */
export const transition = {
  fast: { duration: DUR.fast, ease: EASE },
  base: { duration: DUR.base, ease: EASE },
  slow: { duration: DUR.slow, ease: EASE },
} as const;

/** Standard entrance: rise and fade. Used by <Reveal>. */
export const riseIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transition.base },
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
