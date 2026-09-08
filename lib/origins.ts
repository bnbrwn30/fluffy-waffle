/**
 * The four growing regions. Single source of truth — the map, the data cards,
 * the offer list and the Blender still filenames all read from here.
 *
 * Region-level figures (altitude bands, screen sizes, density, harvest windows
 * and cupping ranges) are the widely published characteristics of each origin,
 * expressed as ranges rather than single figures — a region does not have one
 * cup score, and pretending otherwise is the first thing an experienced buyer
 * spots. Screen numbers are ECX sizes in 1/64 inch; density is free-flow bulk
 * density per ISO 6669. Anything lot-specific or company-specific is marked
 * VERIFY and must be confirmed before launch.
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
  /**
   * Typical SCA cupping range for the region, low to high — not a promise for
   * any one lot. A single decimal score at region level would be a fiction;
   * a band is what the trade actually publishes, and it is the honest thing to
   * put in front of a buyer who will cup a sample anyway.
   */
  cupScore: [number, number];
  /** Typical ECX screen sizes, in 1/64 inch. Screen 14 = 5.6 mm, 18 = 7.1 mm. */
  screen: string;
  /** Typical free-flow bulk density band, g/L (ISO 6669). Height reads here. */
  density: [number, number];
  grades: string[];
  notes: string[];
  /** One line of why a buyer would pick this region. */
  pitch: string;
  /** Blender-rendered still, public/img/origins/<still>.webp */
  still: string;
  /**
   * True coordinates of the region's main trading town, in decimal degrees.
   *
   * The map projects these rather than carrying hand-placed pixel positions.
   * That is not pedantry: the previous hand-tuned pairs had Yirgacheffe
   * plotted west of Sidamo and Harrar in the centre of the country, because
   * nothing tied a dot to a place. Coordinates cannot drift when the outline
   * is retouched, and anyone can check them.
   */
  lon: number;
  lat: number;
};

export const ORIGINS: Origin[] = [
  {
    id: "yirgacheffe",
    name: "Yirgacheffe",
    zone: "Gedeo, South Ethiopia",
    altitude: [1750, 2200],
    processes: ["Fully washed", "Natural"],
    varietal: "Ethiopian heirloom",
    harvest: "October – January",
    cupScore: [85, 88],
    screen: "14–16 (5.6–6.35 mm)",
    density: [700, 740],
    grades: ["G1", "G2"],
    notes: ["Bergamot", "Jasmine", "Lemon zest", "Black tea"],
    pitch:
      "The best known of the Ethiopian origins, and the floral, tea-like cup " +
      "most roasters have in mind when they ask for Ethiopian coffee.",
    still: "yirgacheffe",
    // Yirga Chefe town, Gedeo zone.
    lon: 38.21,
    lat: 6.16,
  },
  {
    id: "sidamo",
    name: "Sidamo",
    zone: "Sidama Region",
    altitude: [1550, 2200],
    processes: ["Fully washed", "Natural"],
    varietal: "Ethiopian heirloom",
    harvest: "October – January",
    cupScore: [84, 87],
    screen: "14–16 (5.6–6.35 mm)",
    density: [690, 730],
    grades: ["G1", "G2", "G3"],
    notes: ["Ripe berry", "Citrus", "Milk chocolate", "Round body"],
    pitch:
      "Wide altitude band and the deepest supply of the four, which makes it " +
      "the easiest region to buy repeatably for a blend or a house espresso.",
    still: "sidamo",
    // Hawassa / central Sidama.
    lon: 38.5,
    lat: 6.75,
  },
  {
    id: "guji",
    name: "Guji",
    zone: "Oromia",
    altitude: [1850, 2300],
    processes: ["Natural", "Fully washed"],
    varietal: "Ethiopian heirloom",
    harvest: "October – February",
    cupScore: [86, 89],
    screen: "15–17 (6.0–6.75 mm)",
    density: [710, 750],
    grades: ["G1"],
    notes: ["Stone fruit", "Peach", "Florals", "Syrupy"],
    pitch:
      "Our highest band, and where the naturals get most expressive. Usually " +
      "what buyers pick for a single origin filter or a competition lot.",
    still: "guji",
    // Shakiso, Guji zone.
    lon: 38.98,
    lat: 5.77,
  },
  {
    id: "jimma",
    name: "Jimma",
    zone: "Jimma, Oromia",
    // The zone spans 1,400–2,100 m; Jimma-proper production sits in the lower
    // half of that, 1,400–1,800 m, which is most of why it cups where it does.
    altitude: [1400, 2100],
    processes: ["Natural (dry)", "Fully washed"],
    varietal: "Ethiopian heirloom",
    harvest: "October – December",
    // Published as 78–82 for commercial Jimma, with well-sorted G4 lots out of
    // Agaro reaching 80–82. Stated honestly rather than inflated to match the
    // other three: a buyer cups the sample either way, and an exporter who
    // claims 86 for Jimma has told them something useful about the exporter.
    cupScore: [78, 82],
    screen: "14–16 (5.6–6.35 mm)", // VERIFY against ECX prep for the crop year
    density: [640, 690], // VERIFY — no published band found for this origin
    grades: ["G4", "G5"],
    notes: ["Dark chocolate", "Tobacco", "Grain", "Low acidity"],
    pitch:
      "The volume origin: earthy, full bodied and low in acidity, dominated " +
      "by natural processing at lower altitude. This is what a blend base or " +
      "a price-led programme is built on, not a competition lot.",
    still: "jimma",
    // Jimma town, Oromia.
    lon: 36.83,
    lat: 7.68,
  },
];

export const ORIGIN_IDS = ORIGINS.map((o) => o.id);

export function getOrigin(id: string): Origin {
  return ORIGINS.find((o) => o.id === id) ?? ORIGINS[0];
}
