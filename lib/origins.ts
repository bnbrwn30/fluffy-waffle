/**
 * The four growing regions. Single source of truth — the map, the data cards,
 * the offer list and the Blender still filenames all read from here.
 *
 * Region-level figures (altitude bands, processing, harvest windows) reflect
 * widely published characteristics of each origin. Anything lot-specific or
 * company-specific is marked VERIFY and must be confirmed before launch.
 */

export type Origin = {
  id: string;
  name: string;
  zone: string;
  /** Metres above sea level. */
  altitude: [number, number];
  processes: string[];
  varietal: string;
  /** Harvest window, human readable. */
  harvest: string;
  /** SCA cupping score. VERIFY per crop year. */
  cupScore: number;
  grades: string[];
  notes: string[];
  /** One line of why a buyer would pick this region. */
  pitch: string;
  /** Blender-rendered still, public/img/origins/<still>.webp */
  still: string;
  /** Position on the inline SVG map, in that SVG's viewBox units. */
  map: { x: number; y: number };
};

export const ORIGINS: Origin[] = [
  {
    id: "yirgacheffe",
    name: "Yirgacheffe",
    zone: "Gedeo, SNNPR",
    altitude: [1750, 2200],
    processes: ["Fully washed", "Natural"],
    varietal: "Ethiopian heirloom",
    harvest: "October – January",
    cupScore: 87.5, // VERIFY per crop year
    grades: ["G1", "G2"],
    notes: ["Bergamot", "Jasmine", "Lemon zest", "Black tea"],
    pitch:
      "The best known of the Ethiopian origins, and the floral, tea-like cup " +
      "most roasters have in mind when they ask for Ethiopian coffee.",
    still: "yirgacheffe",
    map: { x: 295, y: 455 },
  },
  {
    id: "sidamo",
    name: "Sidamo",
    zone: "Sidama Region",
    altitude: [1550, 2200],
    processes: ["Fully washed", "Natural"],
    varietal: "Ethiopian heirloom",
    harvest: "October – January",
    cupScore: 86.5, // VERIFY per crop year
    grades: ["G1", "G2", "G3"],
    notes: ["Ripe berry", "Citrus", "Milk chocolate", "Round body"],
    pitch:
      "Wide altitude band and the deepest supply of the four, which makes it " +
      "the easiest region to buy repeatably for a blend or a house espresso.",
    still: "sidamo",
    map: { x: 320, y: 415 },
  },
  {
    id: "guji",
    name: "Guji",
    zone: "Oromia",
    altitude: [1850, 2300],
    processes: ["Natural", "Fully washed"],
    varietal: "Ethiopian heirloom",
    harvest: "October – February",
    cupScore: 88.0, // VERIFY per crop year
    grades: ["G1"],
    notes: ["Stone fruit", "Peach", "Florals", "Syrupy"],
    pitch:
      "Our highest band, and where the naturals get most expressive. Usually " +
      "what buyers pick for a single origin filter or a competition lot.",
    still: "guji",
    map: { x: 350, y: 470 },
  },
  {
    id: "harrar",
    name: "Harrar",
    zone: "Eastern Highlands",
    altitude: [1500, 2100],
    processes: ["Natural (dry)"],
    varietal: "Heirloom longberry",
    harvest: "October – February",
    cupScore: 85.0, // VERIFY per crop year
    grades: ["G4", "G5"],
    notes: ["Blueberry", "Red wine", "Warm spice", "Heavy body"],
    pitch:
      "Dried on the cherry in the eastern highlands, with the winey, " +
      "fruit-forward profile the region is known for. It divides opinion, so " +
      "it is worth cupping before committing to volume.",
    still: "harrar",
    map: { x: 465, y: 315 },
  },
];

export const ORIGIN_IDS = ORIGINS.map((o) => o.id);

export function getOrigin(id: string): Origin {
  return ORIGINS.find((o) => o.id === id) ?? ORIGINS[0];
}
