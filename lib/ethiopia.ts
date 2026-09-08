/**
 * The geographic basis for the Origins map.
 *
 * One frame, one projection, one border — shared by the browser component and
 * by scripts/render-ethiopia.py, which renders the 3D plate. If these numbers
 * and the render ever disagree, the pins drift off their coordinates and the
 * map starts lying about where coffee comes from, so they live in one file
 * that both sides read.
 *
 * The outline is the real national border (natural earth-derived GeoJSON),
 * reduced from 792 vertices to 129 by Ramer-Douglas-Peucker. That keeps every
 * feature that carries the silhouette — the Tigray point in the north, the
 * Afar step and Djibouti notch, the long Somali spur out to 48 degrees east,
 * the Gambela bulge west — while dropping the wiggle along river borders that
 * nobody can see at 300 pixels wide. It is a simplification of a real border,
 * not a drawing of one; the previous hand-tuned path was the drawing, and it
 * had the north wrong and the eastern spur missing entirely.
 */

/** Render frame, in degrees. Mirrored in scripts/render-ethiopia.py. */
export const LON_MIN = 32.35;
export const LON_MAX = 48.75;
export const LAT_MIN = 2.75;
export const LAT_MAX = 15.55;

/** viewBox units per degree. */
export const K = 40;

export const MAP_W = (LON_MAX - LON_MIN) * K;
export const MAP_H = (LAT_MAX - LAT_MIN) * K;

/**
 * Equirectangular, which at this latitude is within a pixel or two of anything
 * more careful: the cosine correction at 9 degrees north is 0.99. Staying this
 * simple is what lets the Blender camera reproduce it exactly — an orthographic
 * top-down render of the same frame IS this projection.
 */
export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON_MIN) * K, (LAT_MAX - lat) * K];
}

/** [longitude, latitude], clockwise. */
export const BORDER: [number, number][] = [
  [37.911, 14.894],
  [37.531, 14.189],
  [37.304, 14.449],
  [37.139, 14.409],
  [37.105, 14.287],
  [37.013, 14.251],
  [36.856, 14.318],
  [36.556, 14.284],
  [36.451, 13.983],
  [36.501, 13.834],
  [36.153, 12.948],
  [36.161, 12.686],
  [36.019, 12.728],
  [35.687, 12.658],
  [35.342, 12.029],
  [35.066, 11.762],
  [35.089, 11.537],
  [34.955, 11.248],
  [35.007, 11.16],
  [34.973, 10.899],
  [34.787, 10.707],
  [34.603, 10.905],
  [34.302, 10.593],
  [34.347, 10.167],
  [34.232, 10.038],
  [34.107, 9.564],
  [34.146, 8.607],
  [33.77, 8.371],
  [33.619, 8.469],
  [33.24, 8.449],
  [33.172, 8.301],
  [33.187, 8.13],
  [33.085, 8.08],
  [33.002, 7.945],
  [33.048, 7.789],
  [33.249, 7.778],
  [33.32, 7.708],
  [33.428, 7.757],
  [33.671, 7.699],
  [33.87, 7.521],
  [33.95, 7.51],
  [34.035, 7.36],
  [34.013, 7.269],
  [34.189, 7.132],
  [34.194, 7.041],
  [34.294, 6.948],
  [34.47, 6.918],
  [34.529, 6.749],
  [34.651, 6.734],
  [34.767, 6.596],
  [34.862, 6.612],
  [34.941, 6.555],
  [35.023, 6.438],
  [34.959, 6.244],
  [34.998, 5.9],
  [35.127, 5.631],
  [35.307, 5.503],
  [35.304, 5.348],
  [35.515, 5.424],
  [35.86, 5.323],
  [35.803, 4.797],
  [35.935, 4.643],
  [35.962, 4.452],
  [36.843, 4.445],
  [37.029, 4.371],
  [38.123, 3.612],
  [38.444, 3.604],
  [38.529, 3.656],
  [38.925, 3.516],
  [39.334, 3.497],
  [39.559, 3.396],
  [39.867, 3.872],
  [40.77, 4.289],
  [41.196, 3.944],
  [41.699, 3.985],
  [41.847, 3.949],
  [42.089, 4.185],
  [42.827, 4.264],
  [42.998, 4.442],
  [43.025, 4.576],
  [43.69, 4.872],
  [44.009, 4.959],
  [44.975, 4.921],
  [47.988, 8.002],
  [46.992, 7.999],
  [43.979, 9.019],
  [43.645, 9.355],
  [43.465, 9.411],
  [43.397, 9.555],
  [43.297, 9.61],
  [43.257, 9.847],
  [43.094, 9.901],
  [42.669, 10.594],
  [42.963, 10.983],
  [42.791, 10.988],
  [42.756, 11.071],
  [42.637, 11.092],
  [42.423, 10.98],
  [42.137, 10.975],
  [42.07, 10.926],
  [41.794, 10.98],
  [41.771, 11.494],
  [41.835, 11.733],
  [41.969, 11.831],
  [42.402, 12.471],
  [42.222, 12.764],
  [42.056, 12.802],
  [41.637, 13.391],
  [41.254, 13.607],
  [40.979, 14.042],
  [40.732, 14.21],
  [40.214, 14.391],
  [40.145, 14.54],
  [40.085, 14.55],
  [40.009, 14.447],
  [39.917, 14.423],
  [39.668, 14.598],
  [39.571, 14.601],
  [39.512, 14.557],
  [39.547, 14.5],
  [39.382, 14.537],
  [39.251, 14.409],
  [39.265, 14.487],
  [39.169, 14.646],
  [39.023, 14.634],
  [38.9, 14.5],
  [38.445, 14.417],
  [38.263, 14.677],
  [38.029, 14.724],
];

/** The border as an SVG path, closed. */
export const OUTLINE =
  BORDER.map(([lon, lat], i) => {
    const [x, y] = project(lon, lat);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";