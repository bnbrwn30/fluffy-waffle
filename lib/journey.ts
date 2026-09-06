/**
 * The scroll journey: four photographs from wild forest to a ship leaving
 * Djibouti, cross-dissolving under a slow push as the reader scrolls.
 *
 * Four beats, not nine. Nine was too long a scroll to hold a buyer through and
 * too much footage to source; four still carries the whole arc — wild origin,
 * cultivation at altitude, processing, export — with one hard number each.
 *
 * Each beat names the image it needs and the shot to go and get. Drop files
 * into `public/img/journey/` using the `photo` name below. Beats with no file
 * fall back to a tinted gradient, so the section works before any imagery
 * exists.
 */

export type Beat = {
  id: string;
  /** File basename in /public/img/journey — e.g. "forest" -> forest.jpg */
  photo: string;
  /** What to look for when sourcing or generating this frame. */
  shot: string;
  /** Fallback tint while the photo is missing. */
  tint: string;
  kicker: string;
  headline: string;
  body: string;
  /** The hard number that lands with this beat. Beauty carrying the proof. */
  stat?: { value: string; label: string };
};

export const BEATS: Beat[] = [
  {
    id: "forest",
    photo: "forest",
    shot:
      "Dense montane forest interior at dawn, shafts of light through canopy, " +
      "mist, wild coffee growing untended, no rows and no people",
    tint: "#16241a",
    kicker: "Kaffa · Southwest Ethiopia",
    headline: "Nobody planted this.",
    body:
      "Coffee grows semi-wild under forest canopy here, picked from trees " +
      "nobody planted in rows. This is the plant's native range, and the " +
      "starting point for most of what is grown commercially elsewhere.",
    stat: { value: "6,000+", label: "heirloom varietals, found only in Ethiopia" },
  },
  {
    id: "highland",
    photo: "highland",
    shot:
      "Terraced highland coffee farm at altitude, layered ridges receding into " +
      "morning haze, cloud sitting in the valleys",
    tint: "#243021",
    kicker: "Guji · 1,850 – 2,300 m",
    headline: "Most of it comes down to altitude.",
    body:
      "Cold nights slow the cherry down, so the bean grows denser and the " +
      "acidity is more pronounced. Picking is done by hand over several passes " +
      "through the season, since the cherries on one tree do not ripen at once.",
    stat: { value: "2,300 m", label: "top of our Guji altitude band" },
  },
  {
    id: "mill",
    photo: "mill",
    shot:
      "Rows of raised drying beds under strong sun, or a dry mill interior with " +
      "green beans on long sorting tables and dusty light from high windows",
    tint: "#4a3a1e",
    kicker: "Dry mill · Addis Ababa",
    headline: "Dried, hulled, graded, sorted.",
    body:
      "Naturals dry about twelve days on raised beds, turned by hand and " +
      "covered over midday. The lot is then hulled, screen sized, density and " +
      "colour sorted by machine, and hand sorted before it is weighed into " +
      "bags.",
    stat: { value: "10.5%", label: "target moisture, G1, screen 15+" },
  },
  {
    id: "ship",
    photo: "ship",
    shot:
      "Container ship leaving port at dusk, stacked containers in silhouette, " +
      "wide horizon, warm sky",
    tint: "#1b2433",
    kicker: "Djibouti → your warehouse",
    headline: "Sealed, surveyed, on the water.",
    body:
      "Stuffed and sealed in Addis, trucked down the Djibouti corridor, then " +
      "surveyed at the port before loading. Sailing time runs around three " +
      "weeks to Hamburg and four to Rotterdam, depending on the service.",
    stat: { value: "~21 days", label: "typical sailing, Djibouti to Hamburg" },
  },
];

/** Scroll progress 0–1 → index of the beat that owns it. */
export function beatIndexAt(p: number): number {
  const clamped = Math.min(Math.max(p, 0), 1);
  return Math.min(BEATS.length - 1, Math.floor(clamped * BEATS.length));
}

/** Public path for a beat's photograph. */
export function photoPath(beat: Beat): string {
  return `/img/journey/${beat.photo}.webp`;
}
